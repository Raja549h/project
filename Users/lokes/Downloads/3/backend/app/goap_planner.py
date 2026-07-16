"""GOAP Planner — Dynamic DAG Generation using heuristic-guided LLM search."""

import asyncio
import json
import logging
from typing import Any

log = logging.getLogger(__name__)

class GOAPPlanner:
    """
    Goal-Oriented Action Planning Engine.
    Generates a Directed Acyclic Graph (DAG) of tasks to achieve the user's intent.
    """

    @staticmethod
    async def generate_dynamic_dag(user_input: str, user_context: dict, llm) -> list[dict]:
        """
        Attempts to generate a DAG. No artificial timeouts.
        """
        try:
            dag = await GOAPPlanner._run_a_star_heuristic(user_input, user_context, llm)
            return dag
        except Exception as e:
            log.error("GOAP Planner failed: %s. Returning simple plan.", e)
            return [
                {
                    "id": "task_1",
                    "description": user_input,
                    "intent": "general",
                    "depends_on": []
                }
            ]

    @staticmethod
    async def _run_a_star_heuristic(user_input: str, user_context: dict, llm) -> list[dict]:
        """
        Instead of a literal node-by-node A* expansion (which takes too many API calls),
        we use the LLM as the heuristic engine to output the optimized DAG path directly.
        Max 5 nodes constraint.
        """
        prompt = (
            "You are a Goal-Oriented Action Planner (GOAP) using A* heuristics. "
            "Given the user's goal, determine the most efficient sequence of actions to reach the goal state.\n"
            "Represent the plan as a Directed Acyclic Graph (DAG) in JSON.\n"
            "CRITICAL CONSTRAINTS:\n"
            "1. Max 5 nodes total.\n"
            "2. Identify independent tasks that can be executed in parallel.\n\n"
            "Format exactly as a JSON array of nodes:\n"
            "[\n"
            "  { \"id\": \"task_1\", \"description\": \"...\", \"intent\": \"...\", \"depends_on\": [] },\n"
            "  { \"id\": \"task_2\", \"description\": \"...\", \"intent\": \"...\", \"depends_on\": [\"task_1\"] }\n"
            "]\n\n"
            f"User Goal: {user_input}\n"
        )
        
        resp = await llm.ainvoke(prompt)
        raw = resp.content.strip()
        
        if raw.startswith("```"):
            lines = raw.split("\n")
            lines = [l for l in lines if not l.strip().startswith("```")]
            raw = "\n".join(lines).strip()
            
        dag = json.loads(raw)
        
        # Enforce max 5 nodes
        if len(dag) > 5:
            dag = dag[:5]
            
        # Validate schema
        for node in dag:
            if "id" not in node:
                node["id"] = f"task_{hash(node.get('description', ''))}"
            if "depends_on" not in node:
                node["depends_on"] = []
                
        return dag


