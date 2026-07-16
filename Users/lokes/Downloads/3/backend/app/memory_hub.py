"""Tiered Semantic Memory Hub (HOT/WARM/COLD) for LifeOS ASCEND."""

import logging
from app import db
from app.llm_gateway import get_gateway
from app.pii_sanitizer import sanitize_text

log = logging.getLogger(__name__)

class TieredMemoryHub:
    """Manages the semantic memory lifecycle across HOT, WARM, and COLD tiers."""

    async def store_memory(self, user_id: str, content: str) -> int | None:
        """
        Sanitizes PII, computes embedding, and inserts memory into the HOT tier.
        Returns the ID of the new memory.
        """
        sanitized_content, mapping = sanitize_text(content)
        
        try:
            gw = get_gateway()
            embedding = await gw.embed(sanitized_content)
            
            # Note: We store the PII mapping in meta or we just discard it.
            # Usually long-term memories should remain anonymized forever.
            
            rows = await db.execute(
                """
                INSERT INTO memories (user_id, content, tier, l2_embedding)
                VALUES (%s, %s, 'HOT', %s)
                RETURNING id
                """,
                (user_id, sanitized_content, embedding)
            )
            return rows[0]["id"] if rows else None
        except Exception as e:
            log.warning("Failed to store memory: %s", e)
            return None

    async def retrieve_memory(self, user_id: str, query: str, limit: int = 5) -> list[dict]:
        """
        Uses pgvector similarity search to fetch relevant memories.
        Retrieves L0/L1 summaries for context to save tokens, only fetching full L2 content if summaries are missing.
        """
        sanitized_query, _ = sanitize_text(query)
        
        try:
            gw = get_gateway()
            embedding = await gw.embed(sanitized_query)
            
            rows = await db.execute(
                """
                SELECT id, tier, hotness_score, l0_summary, l1_summary, content,
                       1 - (l2_embedding <=> %s::vector) AS similarity
                FROM memories
                WHERE user_id = %s AND l2_embedding IS NOT NULL
                ORDER BY l2_embedding <=> %s::vector
                LIMIT %s
                """,
                (embedding, user_id, embedding, limit)
            )
            
            results = []
            for r in rows:
                # Update access count and last accessed time for decay logic
                await self._mark_accessed(r["id"])
                
                # Favor summaries over full content for token efficiency
                display_content = r["l1_summary"] or r["l0_summary"] or r["content"]
                
                results.append({
                    "id": r["id"],
                    "tier": r["tier"],
                    "hotness": r["hotness_score"],
                    "content": display_content,
                    "similarity": round(float(r["similarity"]), 4)
                })
            return results
        except Exception as e:
            log.warning("Failed to retrieve memory: %s", e)
            return []

    async def _mark_accessed(self, memory_id: int) -> None:
        """Increments access count and resets last_accessed timestamp."""
        try:
            await db.execute_write(
                """
                UPDATE memories
                SET access_count = access_count + 1,
                    last_accessed = now()
                WHERE id = %s
                """,
                (memory_id,)
            )
        except Exception as e:
            log.warning("Failed to mark memory accessed: %s", e)

# Singleton accessor
_hub: TieredMemoryHub | None = None

def get_memory_hub() -> TieredMemoryHub:
    global _hub
    if _hub is None:
        _hub = TieredMemoryHub()
    return _hub
