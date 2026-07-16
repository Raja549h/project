"""Computer Use Engine - Local Vision (moondream2) + Cerebras Reasoning."""

import base64
import json
import logging
import asyncio
from typing import Dict, Any
from langchain_core.tools import tool
from langchain_core.messages import SystemMessage, HumanMessage
from app.llm_gateway import get_gateway
from app.tools.store_tools import _pending_actions
from PIL import Image
import io

log = logging.getLogger(__name__)

# We import these conditionally or handle gracefully if not installed
try:
    import mss
    import pyautogui
    pyautogui.FAILSAFE = True
    HAS_DESKTOP = True
except ImportError:
    HAS_DESKTOP = False
    log.warning("Desktop automation libraries (mss, pyautogui) not installed.")

_vision_model = None
_vision_tokenizer = None

def _load_vision_model():
    """Lazily load the moondream2 model for local screen parsing."""
    global _vision_model, _vision_tokenizer
    if _vision_model is None:
        try:
            from transformers import AutoModelForCausalLM, AutoTokenizer
            log.info("Downloading/Loading local Moondream2 vision model...")
            model_id = "vikhyatk/moondream2"
            _vision_tokenizer = AutoTokenizer.from_pretrained(model_id, trust_remote_code=True)
            _vision_model = AutoModelForCausalLM.from_pretrained(
                model_id, trust_remote_code=True
            ).to("cpu")
            _vision_model.eval()
            log.info("Moondream2 loaded successfully.")
        except Exception as e:
            log.error("Failed to load local vision model: %s", e)
            raise

def take_screenshot_pil() -> Image.Image:
    """Capture screen and return PIL Image."""
    if not HAS_DESKTOP:
        raise RuntimeError("mss library not available")
    
    with mss.mss() as sct:
        monitor = sct.monitors[1]
        sct_img = sct.grab(monitor)
        # Convert to PIL Image
        img = Image.frombytes("RGB", sct_img.size, sct_img.bgra, "raw", "BGRX")
        # Resize to prevent RAM overload on CPU inference
        img.thumbnail((800, 800))
        return img

def execute_action(action_json: Dict[str, Any]) -> str:
    """Execute physical mouse/keyboard actions."""
    if not HAS_DESKTOP:
        return "Error: pyautogui not available"
        
    action = action_json.get("action", "").lower()
    
    # SAFETY LAYER
    if action in ["delete", "format", "send_email", "dangerous_cmd"]:
        # Push to pending actions for Strict Mode approval
        _pending_actions.append({
            "store": "os",
            "action": "execute_dangerous",
            "payload": action_json
        })
        return f"Safety intercept: Action '{action}' requires explicit human approval. Queued for Strict Mode."
    
    try:
        if action == "click":
            x = action_json.get("x")
            y = action_json.get("y")
            if x is not None and y is not None:
                pyautogui.click(x, y)
                return f"Clicked at ({x}, {y})"
            return "Missing x/y for click"
            
        elif action == "type":
            text = action_json.get("text")
            if text:
                pyautogui.write(text, interval=0.01)
                return f"Typed: {text}"
            return "Missing text for type"
            
        elif action == "hotkey":
            keys = action_json.get("keys", [])
            if keys:
                pyautogui.hotkey(*keys)
                return f"Pressed hotkey: {'+'.join(keys)}"
            return "Missing keys for hotkey"
            
        elif action == "press":
            key = action_json.get("key")
            if key:
                pyautogui.press(key)
                return f"Pressed {key}"
            return "Missing key for press"
            
        elif action == "scroll":
            clicks = action_json.get("clicks", -10)
            pyautogui.scroll(clicks)
            return f"Scrolled {clicks} clicks"
            
        else:
            return f"Unknown action: {action}"
            
    except Exception as e:
        log.error("Execution failed: %s", e)
        return f"Execution failed: {e}"

@tool
def computer_use(instruction: str) -> str:
    """
    Control the computer mouse, keyboard, and read the screen to accomplish a task.
    Provide a specific instruction of what you want to achieve on the screen.
    """
    if not HAS_DESKTOP:
        return "Computer Use is disabled (dependencies missing)."
        
    try:
        log.info(f"Computer Use invoked: {instruction}")
        
        # 1. Take Screenshot (PIL Image)
        img = take_screenshot_pil()
        
        # 2. Local Vision: Parse Screen Context
        _load_vision_model()
        enc_image = _vision_model.encode_image(img)
        
        # Ask the vision model to describe UI elements related to the instruction
        vision_prompt = f"Describe the visible UI elements, buttons, and text fields on this screen relevant to: '{instruction}'. Include approximate coordinates if possible."
        ui_description = _vision_model.answer_question(enc_image, vision_prompt, _vision_tokenizer)
        
        log.info(f"Local Vision Description: {ui_description}")
        
        # 3. Cerebras Reasoning: Generate Action Plan
        llm = get_gateway().get_llm("fast")
        
        system_prompt = (
            "You are a computer automation AI. You are provided with a user instruction "
            "and a textual description of the user's screen generated by a local vision model.\n"
            "Determine the immediate next physical action required.\n"
            "Return ONLY a valid JSON object matching this schema:\n"
            "{\"action\": \"click\", \"x\": int, \"y\": int} OR\n"
            "{\"action\": \"type\", \"text\": \"string\"} OR\n"
            "{\"action\": \"hotkey\", \"keys\": [\"ctrl\", \"c\"]} OR\n"
            "{\"action\": \"press\", \"key\": \"enter\"} OR\n"
            "{\"action\": \"scroll\", \"clicks\": int} OR\n"
            "{\"action\": \"delete\" | \"send_email\", \"target\": \"string\"}\n\n"
            "DO NOT wrap the response in markdown ```json blocks. Return ONLY the raw JSON."
        )
        
        user_prompt = f"Instruction: {instruction}\nScreen Description: {ui_description}"
        
        # Use invoke since this is a synchronous tool wrapper
        response = llm.invoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_prompt)
        ])
        raw_text = response.content.strip()
        
        # Clean potential markdown
        if raw_text.startswith("```json"):
            raw_text = raw_text[7:-3].strip()
        elif raw_text.startswith("```"):
            raw_text = raw_text[3:-3].strip()
            
        action_json = json.loads(raw_text)
        log.info(f"Cerebras Action Plan: {action_json}")
        
        # 4. Execute Action
        result = execute_action(action_json)
        return f"Executed plan: {action_json}. Result: {result}"
        
    except json.JSONDecodeError:
        return f"Failed to parse LLM action plan: {raw_text}"
    except Exception as e:
        log.error("Computer use error: %s", e)
        return f"Error during computer use: {str(e)}"
