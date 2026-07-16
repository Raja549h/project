"""Intervention API — Real-Time Control over running swarms."""

import logging
from typing import Any
from app import db
from app.state_graph import get_compiled_graph
from langgraph.types import Command

log = logging.getLogger(__name__)

class InterventionAPI:
    """Manages pause, resume, cancel, and override operations for running swarms."""

    @staticmethod
    async def intervene(thread_id: str, action: str, new_instruction: str = "") -> dict[str, Any]:
        """
        Executes a real-time intervention on the specified thread.
        Supported actions: 'pause', 'resume', 'cancel', 'override'.
        """
        log.info(f"Intervention requested: {action} on thread {thread_id}")
        
        valid_actions = {"pause", "resume", "cancel", "override"}
        if action not in valid_actions:
            return {"error": f"Invalid action. Must be one of {valid_actions}"}

        # Update DB status
        await db.execute_write(
            "INSERT INTO active_swarms (thread_id, status) VALUES (%s, %s) "
            "ON CONFLICT (thread_id) DO UPDATE SET status = EXCLUDED.status, updated_at = now()",
            (thread_id, action)
        )

        try:
            graph = get_compiled_graph()
            thread_config = {"configurable": {"thread_id": thread_id}}

            if action == "cancel":
                # For cancel, we inject an error or flag into the state to halt execution.
                graph.update_state(thread_config, {"error": "Swarm cancelled by user intervention."})
                return {"status": "cancelled", "thread_id": thread_id}
                
            elif action == "override":
                if not new_instruction:
                    return {"error": "new_instruction is required for override."}
                
                # Update the state with the new instruction and clear existing tasks to force replan
                graph.update_state(thread_config, {
                    "user_input": new_instruction,
                    "sub_tasks": [],
                    "worker_results": [],
                    "pending_actions": [],
                    "error": "replan_required"
                })
                # If the graph was paused, we can resume it to force the loop to continue
                # We send a Command to resume and route back to meta_router (requires graph support)
                try:
                    await graph.ainvoke(Command(resume="override"), config=thread_config)
                except Exception as e:
                    log.warning("Override ainvoke failed (graph might not be paused): %s", e)
                
                return {"status": "overridden", "thread_id": thread_id, "new_instruction": new_instruction}

            elif action == "resume":
                # Resume a paused graph
                try:
                    await graph.ainvoke(Command(resume="approve"), config=thread_config)
                    return {"status": "resumed", "thread_id": thread_id}
                except Exception as e:
                    return {"error": f"Failed to resume (graph may not be paused): {e}"}
            
            elif action == "pause":
                # Pause is tricky if not explicitly waiting. 
                # We rely on workers checking the DB status, or we update the state to trigger an interrupt at the next node.
                graph.update_state(thread_config, {"execution_mode": "strict"}) # Force next node to interrupt
                return {"status": "paused_scheduled", "thread_id": thread_id}

        except Exception as e:
            log.exception("Intervention failed")
            return {"error": str(e)}
            
        return {"status": "success", "action": action}

    @staticmethod
    async def get_status(thread_id: str) -> dict[str, Any]:
        """Returns the real-time status of the swarm."""
        row = await db.execute_one(
            "SELECT status, state_json, updated_at FROM active_swarms WHERE thread_id = %s",
            (thread_id,)
        )
        if not row:
            return {"status": "unknown", "thread_id": thread_id}
        
        return {
            "thread_id": thread_id,
            "status": row["status"],
            "last_updated": row["updated_at"].isoformat()
        }
