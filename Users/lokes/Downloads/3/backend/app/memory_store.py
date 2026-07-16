"""Memory Store — pgvector RAG retrieval + skill distillation engine."""

from __future__ import annotations

import json
import logging
from datetime import datetime

from app import db
from app.llm_gateway import get_gateway

log = logging.getLogger(__name__)


class MemoryStore:
    """Long-term semantic memory backed by Neon pgvector."""

    # ── RAG: Search similar past skills ────────────────────────────────
    async def search_similar_skills(self, query: str, k: int = 5) -> list[dict]:
        """Find the k most similar distilled skills for a given query."""
        try:
            gw = get_gateway()
            embedding = await gw.embed(query)
            rows = await db.execute(
                """
                SELECT id, intent, summary, prompt_template, trajectory_summary,
                       success_count, 1 - (embedding <=> %s::vector) AS similarity
                FROM skills
                WHERE embedding IS NOT NULL
                ORDER BY embedding <=> %s::vector
                LIMIT %s
                """,
                (embedding, embedding, k),
            )
            return [
                {
                    "id": r["id"],
                    "intent": r["intent"],
                    "summary": r["summary"],
                    "prompt_template": r["prompt_template"],
                    "trajectory_summary": r["trajectory_summary"],
                    "success_count": r["success_count"],
                    "similarity": round(float(r["similarity"]), 4),
                }
                for r in rows
            ]
        except Exception as e:
            log.warning("Skill search failed (DB may be empty): %s", e)
            return []

    # ── Trajectory logging ─────────────────────────────────────────────
    async def log_trajectory(
        self,
        session_id: str,
        agent_id: str,
        node_name: str,
        thought: str = "",
        action: str = "",
        tool_name: str = "",
        tool_args: dict | None = None,
        result: str = "",
        tokens_used: int = 0,
        outcome: str = "",
        meta: dict | None = None,
        execution_mode: str = "auto",
        complexity_score: str = "low",
        judge_scores: dict | None = None,
    ) -> None:
        """Record a single trajectory entry with cryptographic provenance."""
        from app.provenance import generate_provenance_hash
        
        payload = {
            "session_id": session_id,
            "agent_id": agent_id,
            "node_name": node_name,
            "action": action,
            "result": result,
        }
        prov_hash = generate_provenance_hash(payload)

        try:
            await db.execute_write(
                """
                INSERT INTO trajectories
                    (session_id, agent_id, node_name, thought, action,
                     tool_name, tool_args, result, tokens_used, outcome, meta,
                     execution_mode, complexity_score, judge_scores, provenance_hash)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    session_id,
                    agent_id,
                    node_name,
                    thought,
                    action,
                    tool_name,
                    json.dumps(tool_args or {}),
                    result,
                    tokens_used,
                    outcome,
                    json.dumps(meta or {}),
                    execution_mode,
                    complexity_score,
                    json.dumps(judge_scores or {}),
                    prov_hash,
                ),
            )
        except Exception as e:
            log.warning("Trajectory log failed: %s", e)

    # ── Session management ─────────────────────────────────────────────
    async def create_session(self, session_id: str, user_context: dict) -> None:
        try:
            await db.execute_write(
                """
                INSERT INTO sessions (id, user_context)
                VALUES (%s, %s)
                ON CONFLICT (id) DO UPDATE SET user_context = EXCLUDED.user_context
                """,
                (session_id, json.dumps(user_context)),
            )
        except Exception as e:
            log.warning("Session creation failed: %s", e)

    async def update_session_tokens(self, session_id: str, tokens: int) -> None:
        try:
            await db.execute_write(
                "UPDATE sessions SET total_tokens = %s WHERE id = %s",
                (tokens, session_id),
            )
        except Exception as e:
            log.warning("Session token update failed: %s", e)

    # ── Skill distillation ─────────────────────────────────────────────
    async def distill_skill(
        self,
        session_id: str,
        intent: str,
        user_input: str,
        final_response: str,
        trajectory: list[dict],
        evaluation_score: float,
    ) -> None:
        """
        Run after a successful graph execution (score >= threshold).
        Compresses the trajectory into a reusable skill and upserts it.
        """
        if evaluation_score < 7.0:
            return  # Only distill high-quality runs

        # Build a compact trajectory summary
        traj_lines = []
        for entry in trajectory:
            node = entry.get("node", "?")
            action = entry.get("action", "")
            result_snippet = (entry.get("result", ""))[:200]
            traj_lines.append(f"[{node}] {action}: {result_snippet}")
        trajectory_summary = "\n".join(traj_lines)

        # Build the skill summary
        summary = (
            f"Intent: {intent}\n"
            f"User asked: {user_input[:300]}\n"
            f"Successful response pattern (score {evaluation_score}/10):\n"
            f"{final_response[:500]}"
        )

        # Build a reusable prompt template
        prompt_template = (
            f"When the user asks about '{intent}' with a similar pattern to: "
            f"'{user_input[:200]}', the following approach worked well "
            f"(scored {evaluation_score}/10):\n\n"
            f"Key strategy: {final_response[:300]}"
        )

        # Embed the summary for future similarity search
        try:
            gw = get_gateway()
            embedding = await gw.embed(summary)

            # Check if a very similar skill already exists (similarity > 0.92)
            existing = await db.execute(
                """
                SELECT id, success_count
                FROM skills
                WHERE embedding IS NOT NULL
                  AND 1 - (embedding <=> %s::vector) > 0.92
                ORDER BY embedding <=> %s::vector
                LIMIT 1
                """,
                (embedding, embedding),
            )

            if existing:
                # Reinforce existing skill
                row = existing[0]
                await db.execute_write(
                    """
                    UPDATE skills
                    SET success_count = success_count + 1,
                        trajectory_summary = %s,
                        prompt_template = %s
                    WHERE id = %s
                    """,
                    (trajectory_summary, prompt_template, row["id"]),
                )
                log.info("Reinforced existing skill #%d (count: %d)", row["id"], row["success_count"] + 1)
            else:
                # Insert new skill
                await db.execute_write(
                    """
                    INSERT INTO skills
                        (intent, summary, prompt_template, trajectory_summary, embedding)
                    VALUES (%s, %s, %s, %s, %s)
                    """,
                    (intent, summary, prompt_template, trajectory_summary, embedding),
                )
                log.info("Distilled new skill for intent '%s'", intent)

        except Exception as e:
            log.warning("Skill distillation failed: %s", e)

    # ── Retrieve full session trajectory ───────────────────────────────
    async def get_session_trajectory(self, session_id: str) -> list[dict]:
        try:
            rows = await db.execute(
                """
                SELECT agent_id, node_name, thought, action,
                       tool_name, tool_args, result, tokens_used, outcome
                FROM trajectories
                WHERE session_id = %s
                ORDER BY ts ASC
                """,
                (session_id,),
            )
            return rows
        except Exception:
            return []


# ── Singleton ──────────────────────────────────────────────────────────
_store: MemoryStore | None = None


def get_memory_store() -> MemoryStore:
    global _store
    if _store is None:
        _store = MemoryStore()
    return _store
