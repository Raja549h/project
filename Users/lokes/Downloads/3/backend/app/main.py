"""LifeOS ASCEND — FastAPI entry point with SSE streaming endpoint.

Deployed as a local desktop service (port 8000).
All config is via local .env file.
"""

from __future__ import annotations

import json
import logging
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from sse_starlette.sse import EventSourceResponse

from app.config import get_settings
from app import db
from app.llm_gateway import get_gateway, reset_gateway
from app.state_graph import run_agent_graph, get_compiled_graph

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(name)-25s  %(levelname)-7s  %(message)s",
)
log = logging.getLogger(__name__)


# ═══════════════════════════════════════════════════════════════════════
# Lifespan — runs migrations on startup, closes pool on shutdown
# ═══════════════════════════════════════════════════════════════════════

@asynccontextmanager
async def lifespan(app: FastAPI):
    s = get_settings()
    log.info("Starting LifeOS ASCEND Agent Backend")

    # Init database pool + run migrations
    if s.neon_database_url:
        await db.init_pool()
        await db.run_migrations()
        log.info("Database ready")
    else:
        log.warning("No NEON_DATABASE_URL — running without persistence")

    # Warm up LLM gateway
    try:
        get_gateway()
        log.info("LLM Gateway initialised (Cerebras + Gemini)")
    except Exception as e:
        log.warning("LLM Gateway init warning: %s", e)

    # Pre-compile the graph
    get_compiled_graph()
    log.info("Agent graph compiled")

    # Start Telegram background task
    import asyncio
    try:
        from app.telegram_bridge import start_telegram_bot
        app.state.telegram_task = asyncio.create_task(start_telegram_bot())
        log.info("Telegram bridge started in background")
    except Exception as e:
        log.warning("Telegram bridge failed to start: %s", e)

    # Phase 5: Seed Harness Hub Presets
    try:
        from app.harness_hub import HarnessHub
        await HarnessHub.seed_presets()
    except Exception as e:
        log.error("Failed to seed Soul Presets: %s", e)

    # Phase 5: Load Plugins
    try:
        from app.plugin_loader import load_plugins
        await load_plugins()
    except Exception as e:
        log.error("Failed to load plugins: %s", e)

    # Phase 5: Start Ruflo Background Workers
    try:
        from app.background_workers import worker_manager
        worker_manager.start()
    except Exception as e:
        log.error("Failed to start Background Workers: %s", e)

    yield

    # Shutdown
    try:
        from app.background_workers import worker_manager
        worker_manager.stop()
    except:
        pass
        
    await db.close_pool()
    reset_gateway()
    log.info("Shutdown complete")


# ═══════════════════════════════════════════════════════════════════════
# App creation
# ═══════════════════════════════════════════════════════════════════════

app = FastAPI(
    title="LifeOS ASCEND Agent API",
    description="5-Layer Autonomous Multi-Agent Backend",
    version="1.0.0",
    lifespan=lifespan,
)

# Apply Phase 5 Production Hardening
try:
    from app.production_hardening import setup_production_hardening
    setup_production_hardening(app)
except Exception as e:
    log.error("Failed to apply production hardening: %s", e)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "tauri://localhost"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ═══════════════════════════════════════════════════════════════════════
# Include Sub-Routers
# ═══════════════════════════════════════════════════════════════════════
try:
    from app.voice_gateway import router as voice_router
    app.include_router(voice_router, prefix="/api/v1/audio", tags=["Zoey Voice"])
except Exception as e:
    log.warning("Failed to include voice router: %s", e)

try:
    from app.behavior_interview import router as interview_router
    app.include_router(interview_router, prefix="/api/v1/interview", tags=["Zoey Onboarding"])
except Exception as e:
    log.warning("Failed to include interview router: %s", e)

try:
    from app.portal_sharing import router as portal_router
    app.include_router(portal_router, prefix="/api/v1/portal", tags=["Zoey Portal Sharing"])
except Exception as e:
    log.warning("Failed to include portal sharing router: %s", e)

try:
    from app.analytics import router as analytics_router
    app.include_router(analytics_router, prefix="/api/v1", tags=["Advanced Analytics"])
except Exception as e:
    log.warning("Failed to include analytics router: %s", e)


# ═══════════════════════════════════════════════════════════════════════
# Request / Response models
# ═══════════════════════════════════════════════════════════════════════

class AgentRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=5000)
    user_context: dict = Field(default_factory=dict)
    session_id: str | None = None
    execution_mode: str = Field(default="auto", description="'dry-run' | 'auto' | 'strict'")


class AgentResponse(BaseModel):
    session_id: str
    response: str
    intent: str
    complexity: str
    evaluation_score: float
    pending_actions: list[dict]
    policy_summary: dict
    trajectory_length: int


class HealthResponse(BaseModel):
    status: str
    database: str
    llm_gateway: str
    graph: str

class MemorySearchRequest(BaseModel):
    user_id: str
    query: str
    limit: int = 5

class InterveneRequest(BaseModel):
    thread_id: str
    action: str = Field(..., description="'pause', 'resume', 'cancel', 'override'")
    new_instruction: str = ""


# ═══════════════════════════════════════════════════════════════════════
# Endpoints
# ═══════════════════════════════════════════════════════════════════════

@app.get("/health", response_model=HealthResponse)
async def health():
    """Healthcheck for local deployment."""
    db_status = "connected"
    try:
        pool = db.get_pool()
        async with pool.connection() as conn:
            await conn.execute("SELECT 1")
    except Exception:
        db_status = "disconnected"

    llm_status = "ready"
    try:
        get_gateway()
    except Exception:
        llm_status = "not_configured"

    graph_status = "compiled"
    try:
        get_compiled_graph()
    except Exception:
        graph_status = "error"

    return HealthResponse(
        status="ok",
        database=db_status,
        llm_gateway=llm_status,
        graph=graph_status,
    )


@app.post("/api/v1/agent/run", response_model=AgentResponse)
async def agent_run(req: AgentRequest):
    """Non-streaming agent execution — returns the complete result."""
    session_id = req.session_id or f"sess-{uuid.uuid4().hex[:12]}"

    try:
        final_state = await run_agent_graph(
            user_input=req.prompt,
            user_context=req.user_context,
            session_id=session_id,
            execution_mode=req.execution_mode,
        )

        return AgentResponse(
            session_id=session_id,
            response=final_state.get("final_response", ""),
            intent=final_state.get("intent", "general"),
            complexity=final_state.get("complexity", "simple"),
            evaluation_score=final_state.get("evaluation_score", 0.0),
            pending_actions=final_state.get("pending_actions", []),
            policy_summary={
                "tokens_used": get_gateway().session_tokens,
                "trajectory_length": len(final_state.get("trajectory", [])),
            },
            trajectory_length=len(final_state.get("trajectory", [])),
        )

    except Exception as e:
        log.exception("Agent run failed")
        return JSONResponse(
            status_code=500,
            content={"error": str(e), "session_id": session_id},
        )


@app.post("/api/v1/agent/stream")
async def agent_stream(req: AgentRequest):
    """
    SSE streaming endpoint — streams agent thoughts, tool calls,
    evaluations, and the final response in real time.

    The React frontend connects via:
        const es = new EventSource('/api/v1/agent/stream', { method: 'POST', body: ... });
    Or more commonly with fetch + ReadableStream.
    """
    session_id = req.session_id or f"sess-{uuid.uuid4().hex[:12]}"

    async def event_generator():
        # 1. Emit session start
        yield {
            "event": "session_start",
            "data": json.dumps({"session_id": session_id}),
        }

        try:
            # 2. Run the graph (collects events in state)
            final_state = await run_agent_graph(
                user_input=req.prompt,
                user_context=req.user_context,
                session_id=session_id,
                execution_mode=req.execution_mode,
            )

            # 3. Stream all collected events
            for event in final_state.get("events", []):
                yield {
                    "event": event["type"],
                    "data": json.dumps(event["data"]),
                }

            # 4. Emit the final response
            yield {
                "event": "final_response",
                "data": json.dumps({
                    "session_id": session_id,
                    "response": final_state.get("final_response", ""),
                    "intent": final_state.get("intent", "general"),
                    "complexity": final_state.get("complexity", "simple"),
                    "evaluation_score": final_state.get("evaluation_score", 0.0),
                    "pending_actions": final_state.get("pending_actions", []),
                    "trajectory_length": len(final_state.get("trajectory", [])),
                }),
            }

        except Exception as e:
            log.exception("Stream failed")
            yield {
                "event": "error",
                "data": json.dumps({"error": str(e)}),
            }

        # 5. Signal completion
        yield {
            "event": "done",
            "data": json.dumps({"session_id": session_id}),
        }

    return EventSourceResponse(event_generator())


class ApproveRequest(BaseModel):
    session_id: str
    decision: str = Field(..., description="'approve' or 'reject'")

@app.post("/api/v1/agent/approve")
async def agent_approve(req: ApproveRequest):
    """Resume a Strict-mode paused agent execution."""
    from langgraph.types import Command
    
    try:
        graph = get_compiled_graph()
        thread = {"configurable": {"thread_id": req.session_id}}
        
        # Resume the graph with the human decision
        await graph.ainvoke(Command(resume=req.decision), config=thread)
        
        return {"status": "resumed", "decision": req.decision, "session_id": req.session_id}
    except Exception as e:
        log.exception("Approve resume failed")
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post("/api/v1/agent/intervene")
async def agent_intervene(req: InterveneRequest):
    """Real-time control over running swarms."""
    from app.intervention_api import InterventionAPI
    result = await InterventionAPI.intervene(req.thread_id, req.action, req.new_instruction)
    if "error" in result:
        return JSONResponse(status_code=400, content=result)
    return result

@app.get("/api/v1/agent/status/{thread_id}")
async def agent_status(thread_id: str):
    """Get the real-time status of a swarm."""
    from app.intervention_api import InterventionAPI
    return await InterventionAPI.get_status(thread_id)


# ═══════════════════════════════════════════════════════════════════════
# Utility endpoints
# ═══════════════════════════════════════════════════════════════════════

@app.get("/api/v1/sessions/{session_id}/trajectory")
async def get_trajectory(session_id: str):
    """Retrieve the full trajectory log for a session."""
    from app.memory_store import get_memory_store
    memory = get_memory_store()
    trajectory = await memory.get_session_trajectory(session_id)
    return {"session_id": session_id, "trajectory": trajectory}


@app.get("/api/v1/skills")
async def list_skills(limit: int = 20):
    """List distilled skills ordered by success count."""
    try:
        rows = await db.execute(
            """
            SELECT id, intent, summary, success_count, created_at
            FROM skills
            ORDER BY success_count DESC
            LIMIT %s
            """,
            (limit,),
        )
        return {"skills": rows}
    except Exception as e:
        return {"skills": [], "error": str(e)}


@app.get("/api/v1/skills/search")
async def search_skills(q: str, k: int = 5):
    """Semantic search across distilled skills."""
    from app.memory_store import get_memory_store
    memory = get_memory_store()
    results = await memory.search_similar_skills(q, k=k)
    return {"query": q, "results": results}


@app.post("/api/v1/memory/search")
async def search_memory(req: MemorySearchRequest):
    """Query the semantic memory hub (HOT/WARM/COLD)."""
    from app.memory_hub import get_memory_hub
    hub = get_memory_hub()
    results = await hub.retrieve_memory(req.user_id, req.query, req.limit)
    return {"user_id": req.user_id, "query": req.query, "results": results}


from fastapi import BackgroundTasks

@app.post("/api/v1/memory/maintenance")
async def trigger_maintenance(background_tasks: BackgroundTasks):
    """Trigger background decay and summarization."""
    from app.background_worker import trigger_nightly_maintenance
    background_tasks.add_task(trigger_nightly_maintenance)
    return {"status": "Maintenance triggered in background"}


# ═══════════════════════════════════════════════════════════════════════
# Serve Frontend statically for Local Desktop
# ═══════════════════════════════════════════════════════════════════════
import os
static_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static")
if os.path.exists(static_dir):
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")
else:
    log.warning(f"Static directory not found at {static_dir}. Frontend will not be served.")
