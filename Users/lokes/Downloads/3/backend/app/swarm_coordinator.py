"""Swarm Coordinator — Mesh Topology Execution Engine."""

import asyncio
import logging
from typing import Any

from app.llm_gateway import get_gateway
from app.agents.base import WorkerAgent
from app.tools.registry import get_tools_for_intent
from app.policy_engine import PolicyEngine

log = logging.getLogger(__name__)

class SwarmCoordinator:
    """
    Executes a GOAP DAG concurrently using a mesh topology.
    Workers are spawned in parallel via asyncio.gather() for independent tasks.
    """

    def __init__(self, policy: PolicyEngine):
        self.policy = policy

    async def execute_swarm(
        self, 
        dag: list[dict], 
        user_context: dict, 
        complexity: str, 
        session_id: str
    ) -> list[dict]:
        """
        Executes the DAG respecting dependencies.
        Returns the combined results of all worker agents.
        """
        gw = get_gateway()
        llm = gw.get_llm("complex" if complexity == "high" else "fast")
        
        results: dict[str, Any] = {}
        events = []
        
        # Build dependency tracking
        # For simplicity in this async mesh, we create asyncio.Event for each node
        events_map = {node["id"]: asyncio.Event() for node in dag}
        
        async def run_worker(node: dict):
            # Wait for dependencies
            for dep in node.get("depends_on", []):
                if dep in events_map:
                    await events_map[dep].wait()
            
            # Execute Worker
            intent = node.get("intent", "general")
            tools = get_tools_for_intent(intent)
            worker = WorkerAgent(role=f"worker-{node['id']}", tools=tools)
            
            res = await worker.execute(node, llm, user_context)
            
            # Policy Validation
            for tc in res.get("tool_calls", []):
                violation = self.policy.validate_tool_call(tc["tool"], tc.get("args", {}))
                if violation and violation.severity == "block":
                    res["tool_calls"] = [t for t in res["tool_calls"] if t["tool"] != tc["tool"]]
            
            res["node_id"] = node["id"]
            results[node["id"]] = res
            
            # Signal completion for dependents
            events_map[node["id"]].set()
            return res

        # Run all workers concurrently
        # The internal awaits on events_map[dep].wait() ensure correct topological execution order!
        tasks = [asyncio.create_task(run_worker(node)) for node in dag]
        
        # Wait for entire swarm to finish
        completed = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Filter out exceptions
        valid_results = []
        for res in completed:
            if isinstance(res, Exception):
                log.error("Swarm worker failed: %s", res)
            else:
                valid_results.append(res)
                
        return valid_results
