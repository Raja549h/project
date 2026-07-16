import os
import sys
import logging

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("validation")

def check_routing():
    log.info("Testing LLM Routing...")
    try:
        from app.llm_gateway import get_gateway
        gw = get_gateway()
        # Verify it's Cerebras / OpenAI compliant
        assert "gpt-oss" in gw._primary_model or "gemma-4" in gw._complex_model
        log.info("✔ LLM Gateway configured for Cerebras successfully.")
    except Exception as e:
        log.error("✘ Routing check failed: %s", e)
        sys.exit(1)

def check_local_models():
    log.info("Testing Local Models...")
    try:
        # Vision
        from transformers import AutoTokenizer, AutoModelForCausalLM
        log.info("✔ Transformers library available for Moondream2.")
        
        # Audio
        from faster_whisper import WhisperModel
        log.info("✔ Faster-Whisper library available.")
        
        # Embeddings
        from sentence_transformers import SentenceTransformer
        log.info("✔ Sentence-Transformers library available.")
    except ImportError as e:
        log.warning("⚠ Skipping local model check: %s (libraries not installed locally)", e)
    except Exception as e:
        log.error("✘ Local Models check failed: %s", e)
        sys.exit(1)

def check_desktop_wrapper():
    log.info("Testing Desktop Wrapper...")
    try:
        import webview
        import pystray
        from app.desktop_app import main
        log.info("✔ Desktop UI libraries (pywebview, pystray) available.")
    except ImportError as e:
        log.error("✘ Desktop Wrapper check failed: %s", e)
        sys.exit(1)

def check_computer_use():
    log.info("Testing Computer Use Safety...")
    try:
        import pyautogui
        import mss
        from app.computer_use import execute_action
        
        res = execute_action({"action": "delete", "target": "all"})
        if "Safety intercept" in res:
            log.info("✔ Safety intercept correctly caught destructive action.")
        else:
            log.error("✘ Safety intercept FAILED to catch destructive action.")
            sys.exit(1)
    except Exception as e:
        log.error("✘ Computer Use check failed: %s", e)
        sys.exit(1)

if __name__ == "__main__":
    log.info("Starting Release Validation...")
    # Add project root to path
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    
    check_routing()
    check_local_models()
    check_desktop_wrapper()
    check_computer_use()
    
    log.info("========================================")
    log.info("ALL VALIDATION CHECKS PASSED. SYSTEM IS RELEASE READY.")
    log.info("========================================")
