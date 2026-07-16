"""Zoey OS Behavioral Onboarding Interview (LangGraph Sub-Graph)."""

import json
import logging
from typing import TypedDict
from fastapi import APIRouter
from langgraph.graph import StateGraph, START, END
from pydantic import BaseModel

from app import db
from app.llm_gateway import get_gateway

log = logging.getLogger(__name__)

router = APIRouter()

class InterviewState(TypedDict):
    user_id: str
    messages: list[dict]
    profile_data: dict
    is_complete: bool


def ask_question_node(state: InterviewState) -> dict:
    """Uses LLM to determine the next question based on the conversation history."""
    # Placeholder logic for the node
    # In reality, this would prompt the LLM with the current state to generate the next interview question
    messages = list(state.get("messages", []))
    
    if len(messages) == 0:
        messages.append({"role": "assistant", "content": "Welcome to LifeOS ASCEND! To personalize your experience, what are your primary goals for this month? (e.g. JEE prep, fitness)"})
    elif len(messages) == 2:
        messages.append({"role": "assistant", "content": "Great! And how would you describe your risk tolerance for intense schedules? (e.g., 'Push me to the limit' or 'I need balance')"})
    elif len(messages) == 4:
        messages.append({"role": "assistant", "content": "Got it. Finally, do you prefer a strict, drill-sergeant tone or a supportive, coaching tone?"})
    
    return {"messages": messages}


async def analyze_profile_node(state: InterviewState) -> dict:
    """When the interview is complete, extract the JSON profile and save to DB."""
    messages = state.get("messages", [])
    user_id = state.get("user_id")
    
    try:
        gw = get_gateway()
        llm = gw.get_llm("fast")
        
        chat_history = "\n".join([f"{m['role']}: {m['content']}" for m in messages])
        
        prompt = (
            "Analyze the following onboarding interview and extract the user's preferences.\n"
            "Format exactly as JSON with keys: goals (list), risk_tolerance (string), preferred_tone (string).\n\n"
            f"Interview:\n{chat_history}"
        )
        
        resp = await llm.ainvoke(prompt)
        raw = resp.content.strip()
        if raw.startswith("```"):
            raw = "\n".join([l for l in raw.split("\n") if not l.startswith("```")]).strip()
            
        profile_data = json.loads(raw)
        
        # Save to database
        await db.execute_write(
            "INSERT INTO user_profiles (user_id, preferences) VALUES (%s, %s) "
            "ON CONFLICT (user_id) DO UPDATE SET preferences = EXCLUDED.preferences, updated_at = now()",
            (user_id, json.dumps(profile_data))
        )
        
        return {"profile_data": profile_data, "is_complete": True, "messages": messages + [{"role": "assistant", "content": "Thank you! Your profile has been configured."}]}
    except Exception as e:
        log.error("Profile extraction failed: %s", e)
        return {"is_complete": True}


def should_continue(state: InterviewState) -> str:
    if len(state.get("messages", [])) >= 6:
        return "analyze_profile"
    return "ask_question"


# Build the subgraph
builder = StateGraph(InterviewState)
builder.add_node("ask_question", ask_question_node)
builder.add_node("analyze_profile", analyze_profile_node)

builder.add_edge(START, "ask_question")
builder.add_conditional_edges("ask_question", should_continue, {"ask_question": "ask_question", "analyze_profile": "analyze_profile"})
builder.add_edge("analyze_profile", END)

interview_graph = builder.compile()


class ChatRequest(BaseModel):
    user_id: str
    message: str = ""

@router.post("/chat")
async def interview_chat(req: ChatRequest):
    """Handles a turn in the behavioral interview."""
    initial_state = {
        "user_id": req.user_id,
        "messages": [{"role": "user", "content": req.message}] if req.message else [],
        "profile_data": {},
        "is_complete": False
    }
    
    # In a real setup, we'd use a checkpointer to load previous state
    # For now, we just step through based on the input
    final_state = await interview_graph.ainvoke(initial_state)
    
    # Return the last message from the assistant
    assistant_msgs = [m for m in final_state["messages"] if m["role"] == "assistant"]
    reply = assistant_msgs[-1]["content"] if assistant_msgs else "..."
    
    return {
        "reply": reply,
        "is_complete": final_state["is_complete"]
    }
