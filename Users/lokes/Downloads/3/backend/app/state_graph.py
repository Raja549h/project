"""LangGraph State Graph — the central orchestration engine (Layer 3).

Flow:
  START → meta_router → execute_workers → synthesize → evaluate
                                                          ↓
                                                   [pass?] → END
                                                   [fail?] → synthesize (retry with critique)
"""

from __future__ import annotations

import json
import logging
import uuid
from typing import Any, TypedDict

from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver
from langgraph.types import interrupt

from app.config import get_settings
from app.llm_gateway import get_gateway, TaskComplexityClassifier
from app.memory_store import get_memory_store
from app.policy_engine import PolicyEngine
from app.agents.meta_router import MetaRouter
from app.agents.evaluator import EvaluatorAgent
from app.agents.synthesizer import SynthesizerAgent
from app.agents.base import WorkerAgent
from app.goap_planner import GOAPPlanner
from app.swarm_coordinator import SwarmCoordinator
from app.agents.base import WorkerAgent
from app.tools.registry import get_tools_for_intent
from app.tools.store_tools import set_execution_context, get_pending_actions, clear_pending_actions
from app.graph_emitter import generate_graph_payload

log = logging.getLogger(__name__)


# ═══════════════════════════════════════════════════════════════════════
# State definition
# ═══════════════════════════════════════════════════════════════════════

class AgentState(TypedDict, total=False):
    # Input
    session_id: str
    user_input: str
    user_context: dict
    execution_mode: str      # 'dry-run' | 'auto' | 'strict'

    # Routing (meta-router output)
    intent: str
    complexity: str          # "low" | "high"
    sub_tasks: list[dict]

    # Execution
    worker_results: list[dict]

    # Synthesis
    synthesized_response: str

    # Evaluation
    evaluation_score: float
    evaluation_feedback: str
    evaluation_detail: dict

    # Output
    final_response: str
    pending_actions: list[dict]

    # Meta
    trajectory: list[dict]
    iteration: int
    relevant_skills: list[dict]
    events: list[dict]       # SSE events streamed to frontend
    error: str


# ═══════════════════════════════════════════════════════════════════════
# Shared instances (created per-graph-run)
# ═══════════════════════════════════════════════════════════════════════

_policy = PolicyEngine()
_meta_router = MetaRouter()
_evaluator = EvaluatorAgent()
_synthesizer = SynthesizerAgent()


def _emit(state: dict, event_type: str, data: Any) -> dict:
    """Append a streaming event to the state."""
    events = list(state.get("events") or [])
    events.append({"type": event_type, "data": data})
    return {"events": events}


# ═══════════════════════════════════════════════════════════════════════
# Node functions
# ═══════════════════════════════════════════════════════════════════════

async def meta_router_node(state: AgentState) -> dict:
    """Classify complexity, intent, and optionally decompose."""
    gw = get_gateway()
    llm = gw.get_llm("fast")
    memory = get_memory_store()

    user_input = state["user_input"]
    user_context = state.get("user_context", {})
    session_id = state.get("session_id", "")

    # ZeroGPU Safeguard: Fast complexity classification
    complexity = await TaskComplexityClassifier.classify(user_input)

    # Search for relevant past skills
    relevant_skills = await memory.search_similar_skills(user_input, k=3)

    if complexity == "low":
        # Bypass heavy GOAP planner
        intent = "general"
        sub_tasks = [{"id": "task_1", "description": user_input, "intent": "general", "depends_on": []}]
    else:
        # Full dynamic DAG generation via GOAP
        llm_complex = gw.get_llm("complex")
        sub_tasks = await GOAPPlanner.generate_dynamic_dag(user_input, user_context, llm_complex)
        intent = sub_tasks[0].get("intent", "general") if sub_tasks else "general"

    # Log trajectory
    await memory.log_trajectory(
        session_id=session_id,
        agent_id="meta-router",
        node_name="meta_router",
        thought=f"Classified as intent={intent}, complexity={complexity}",
        action="goap_plan",
        result=json.dumps(sub_tasks),
        execution_mode=state.get("execution_mode", "auto"),
        complexity_score=complexity,
    )

    updates = {
        "intent": intent,
        "complexity": complexity,
        "sub_tasks": sub_tasks,
        "relevant_skills": relevant_skills,
        "error": "", # Clear replan flag
        "trajectory": list(state.get("trajectory") or []) + [
            {"node": "meta_router", "action": "goap_plan", "result": json.dumps(sub_tasks)}
        ],
    }
    updates.update(
        _emit(state, "routing", {
            "intent": intent,
            "complexity": complexity,
            "sub_tasks_count": len(sub_tasks),
            "skills_found": len(relevant_skills),
        })
    )
    # Emit topology
    updates.update(
        _emit(updates, "graph_update", generate_graph_payload("meta_router", sub_tasks, []))
    )
    return updates


async def execute_workers_node(state: AgentState) -> dict:
    """Spawn worker agents for each sub-task and execute them."""
    gw = get_gateway()
    memory = get_memory_store()
    session_id = state.get("session_id", "")
    user_context = state.get("user_context", {})
    complexity = state.get("complexity", "low")
    sub_tasks = state.get("sub_tasks", [])
    intent = state.get("intent", "general")
    relevant_skills = state.get("relevant_skills", [])
    exec_mode = state.get("execution_mode", "auto")

    # Inject user context into tools
    set_execution_context(user_context)
    clear_pending_actions()

    tier = "complex" if complexity == "high" else "fast"
    llm = gw.get_llm(tier)

    all_results = []
    trajectory = list(state.get("trajectory") or [])
    events_update = {}

    # Check for intervention pause
    if state.get("error") == "replan_required":
        events_update = _emit(state, "plan_overridden", {})
        return events_update  # Should loop back, handled by router edge

    # Execute DAG concurrently via Mesh Swarm Coordinator
    coordinator = SwarmCoordinator(_policy)
    
    # In Dry-Run mode, workers execute but actions are discarded
    all_results = await coordinator.execute_swarm(sub_tasks, user_context, complexity, session_id)

    # Log results
    for i, result in enumerate(all_results):
        await memory.log_trajectory(
            session_id=session_id,
            agent_id=result.get("agent_id", "worker"),
            node_name="execute_workers",
            thought=result.get("thought", ""),
            action=f"execute_{result.get('node_id', i)}",
            tool_name=",".join(tc["tool"] for tc in result.get("tool_calls", [])),
            result=result.get("raw_response", "")[:1000],
            execution_mode=exec_mode,
            complexity_score=complexity,
        )

        trajectory.append({
            "node": "execute_workers",
            "action": f"worker_{result.get('node_id', i)}",
            "result": result.get("raw_response", "")[:500],
        })

    pending = get_pending_actions()

    # Strict mode Human-in-the-Loop Interrupt
    if pending and exec_mode == "strict":
        events_update = _emit(
            {**state, **events_update},
            "approval_required",
            {"pending_actions": pending}
        )
        
        # Inject 'task_paused' event for UI
        events_update = _emit({**state, **events_update}, "task_paused", {})
        
        decision = interrupt({"action": "review", "pending_actions": pending})
        
        # UI event for resume
        events_update = _emit({**state, **events_update}, "task_resumed", {})
        
        if decision == "reject":
            clear_pending_actions()
            pending = []
            events_update = _emit({**state, **events_update}, "approval_rejected", {})
        elif decision == "override":
            # Override sent via intervene API while paused
            clear_pending_actions()
            pending = []
            events_update = _emit({**state, **events_update}, "plan_overridden", {})
            return {"error": "replan_required", **events_update}
        else:
            events_update = _emit({**state, **events_update}, "approval_granted", {})

    if exec_mode == "dry-run":
        # Discard actions in dry-run
        clear_pending_actions()
        pending = []

    updates = {
        "worker_results": all_results,
        "pending_actions": pending,
        "trajectory": trajectory,
    }
    events_update.update(
        _emit(events_update, "graph_update", generate_graph_payload("execute_workers", sub_tasks, all_results))
    )
    updates.update(events_update)
    return updates


async def synthesize_node(state: AgentState) -> dict:
    """Aggregate worker results into a coherent response."""
    gw = get_gateway()
    memory = get_memory_store()
    session_id = state.get("session_id", "")
    exec_mode = state.get("execution_mode", "auto")
    complexity = state.get("complexity", "low")

    llm = gw.get_llm("fast")
    worker_results = state.get("worker_results", [])
    user_input = state.get("user_input", "")
    intent = state.get("intent", "general")
    critique = state.get("evaluation_feedback", "")

    response = await _synthesizer.synthesize(
        worker_results, user_input, intent, llm, critique=critique
    )

    _policy.validate_output(response)

    await memory.log_trajectory(
        session_id=session_id,
        agent_id="synthesizer",
        node_name="synthesize",
        thought="Aggregating worker results",
        action="synthesize",
        result=response[:1000],
        execution_mode=exec_mode,
        complexity_score=complexity,
    )

    trajectory = list(state.get("trajectory") or [])
    trajectory.append({"node": "synthesize", "action": "synthesize", "result": response[:500]})

    updates = {
        "synthesized_response": response,
        "trajectory": trajectory,
    }
    updates.update(_emit(state, "synthesizing", {"length": len(response)}))
    updates.update(
        _emit(updates, "graph_update", generate_graph_payload("synthesize", state.get("sub_tasks", []), state.get("worker_results", [])))
    )
    return updates


async def evaluate_node(state: AgentState) -> dict:
    """Grade the synthesized response for quality using the Constitutional Council."""
    memory = get_memory_store()
    session_id = state.get("session_id", "")
    exec_mode = state.get("execution_mode", "auto")
    complexity = state.get("complexity", "low")

    response = state.get("synthesized_response", "")
    user_input = state.get("user_input", "")
    trajectory_data = state.get("trajectory", [])

    if complexity == "low":
        # Lightweight evaluation to save ZeroGPU / API quotas
        evaluation = {
            "evaluation_score": 9.0,
            "dimensions": {"functional_correctness": 9.0, "efficiency": 9.0},
            "feedback": {"quality": "Low complexity task, bypass heavy eval"},
            "pass": True
        }
    else:
        # Full 4-Judge Constitutional Council
        evaluation = await _evaluator.evaluate(user_input, trajectory_data, response)
        evaluation["pass"] = evaluation["evaluation_score"] >= 7.0

    iteration = (state.get("iteration") or 0) + 1

    await memory.log_trajectory(
        session_id=session_id,
        agent_id="evaluator",
        node_name="evaluate",
        thought=f"Score: {evaluation['evaluation_score']}/10",
        action="evaluate",
        result=json.dumps(evaluation),
        outcome="pass" if evaluation["pass"] else "retry",
        execution_mode=exec_mode,
        complexity_score=complexity,
        judge_scores=evaluation.get("dimensions", {}),
    )

    trajectory = list(state.get("trajectory") or [])
    trajectory.append({
        "node": "evaluate",
        "action": "grade",
        "result": f"score={evaluation['evaluation_score']}, pass={evaluation['pass']}",
    })

    updates = {
        "evaluation_score": evaluation["evaluation_score"],
        "evaluation_feedback": str(evaluation.get("feedback", "")),
        "evaluation_detail": evaluation,
        "iteration": iteration,
        "trajectory": trajectory,
    }

    if evaluation["pass"]:
        updates["final_response"] = response

        # Trigger skill distillation in background
        if complexity == "high":
            try:
                await memory.distill_skill(
                    session_id=session_id,
                    intent=state.get("intent", "general"),
                    user_input=user_input,
                    final_response=response,
                    trajectory=trajectory,
                    evaluation_score=evaluation["evaluation_score"],
                )
            except Exception as e:
                log.warning("Skill distillation failed: %s", e)

    updates.update(_emit(state, "evaluation", {
        "score": evaluation["evaluation_score"],
        "pass": evaluation["pass"],
        "iteration": iteration,
    }))
    updates.update(
        _emit(updates, "graph_update", generate_graph_payload("evaluate", state.get("sub_tasks", []), state.get("worker_results", [])))
    )
    return updates


# ═══════════════════════════════════════════════════════════════════════
# Conditional edges
# ═══════════════════════════════════════════════════════════════════════

def should_retry(state: AgentState) -> str:
    """After evaluation: retry synthesis if score is low and iterations remain."""
    if state.get("evaluation_detail", {}).get("pass", True):
        return "finish"

    iteration = state.get("iteration", 0)
    violation = _policy.check_iteration_limit(iteration)
    if violation:
        log.warning("Iteration limit reached, forcing finish")
        return "finish"

    return "retry"


async def finish_node(state: AgentState) -> dict:
    """Final node — package the output."""
    response = state.get("final_response") or state.get("synthesized_response", "")
    pending = state.get("pending_actions", [])

    updates = {
        "final_response": response,
        "pending_actions": pending,
    }
    updates.update(_emit(state, "complete", {
        "response": response,
        "pending_actions": pending,
        "policy_summary": _policy.summary(),
    }))
    return updates


# ═══════════════════════════════════════════════════════════════════════
# Graph construction
# ═══════════════════════════════════════════════════════════════════════

def check_replan(state: AgentState) -> str:
    """Check if an override intervention triggered a replan."""
    if state.get("error") == "replan_required":
        return "meta_router"
    return "synthesize"

def build_graph() -> StateGraph:
    """Construct and compile the full 5-layer agent graph."""
    graph = StateGraph(AgentState)

    graph.add_node("meta_router", meta_router_node)
    graph.add_node("execute_workers", execute_workers_node)
    graph.add_node("synthesize", synthesize_node)
    graph.add_node("evaluate", evaluate_node)
    graph.add_node("finish", finish_node)

    graph.add_edge(START, "meta_router")
    graph.add_edge("meta_router", "execute_workers")
    
    graph.add_conditional_edges(
        "execute_workers",
        check_replan,
        {"meta_router": "meta_router", "synthesize": "synthesize"},
    )
    
    graph.add_edge("synthesize", "evaluate")

    graph.add_conditional_edges(
        "evaluate",
        should_retry,
        {"finish": "finish", "retry": "synthesize"},
    )
    graph.add_edge("finish", END)

    return graph


# MemorySaver is required for interrupt()
_checkpointer = MemorySaver()
_compiled = None


def get_compiled_graph():
    global _compiled
    if _compiled is None:
        _compiled = build_graph().compile(checkpointer=_checkpointer)
    return _compiled


async def run_agent_graph(
    user_input: str,
    user_context: dict,
    session_id: str | None = None,
    execution_mode: str = "auto",
) -> AgentState:
    """Execute the full agent graph and return the final state."""
    _policy.reset()

    if not session_id:
        session_id = f"sess-{uuid.uuid4().hex[:12]}"

    memory = get_memory_store()
    await memory.create_session(session_id, user_context)

    initial_state: AgentState = {
        "session_id": session_id,
        "user_input": user_input,
        "user_context": user_context,
        "execution_mode": execution_mode,
        "intent": "",
        "complexity": "low",
        "sub_tasks": [],
        "worker_results": [],
        "synthesized_response": "",
        "evaluation_score": 0.0,
        "evaluation_feedback": "",
        "evaluation_detail": {},
        "final_response": "",
        "pending_actions": [],
        "trajectory": [],
        "iteration": 0,
        "relevant_skills": [],
        "events": [],
        "error": "",
    }

    graph = get_compiled_graph()
    thread = {"configurable": {"thread_id": session_id}}
    
    final_state = await graph.ainvoke(initial_state, config=thread)

    gw = get_gateway()
    await memory.update_session_tokens(session_id, gw.session_tokens)

    return final_state
