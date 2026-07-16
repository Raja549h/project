"""Background Worker for Nightly Maintenance (Decay and Summarization)."""

import logging
import asyncio
from app import db
from app.llm_gateway import get_gateway

log = logging.getLogger(__name__)

# Decay constant (alpha): dictates how fast a memory cools down.
DECAY_ALPHA = 0.1

async def run_memory_decay() -> None:
    """
    Updates the hotness_score for all memories using continuous time decay.
    Moves memories across HOT -> WARM -> COLD tiers based on thresholds.
    """
    try:
        # hotness = access_count * exp(-alpha * days_since_last_access)
        await db.execute_write(
            f"""
            UPDATE memories
            SET hotness_score = access_count * exp(-{DECAY_ALPHA} * EXTRACT(EPOCH FROM (now() - last_accessed))/86400.0)
            """
        )
        
        # Tier transitions
        # HOT -> WARM if hotness < 0.5
        await db.execute_write(
            "UPDATE memories SET tier = 'WARM' WHERE tier = 'HOT' AND hotness_score < 0.5"
        )
        
        # WARM -> COLD if hotness < 0.1
        await db.execute_write(
            "UPDATE memories SET tier = 'COLD' WHERE tier = 'WARM' AND hotness_score < 0.1"
        )
        
        # WARM -> HOT if hotness >= 0.5 (Reactivation)
        await db.execute_write(
            "UPDATE memories SET tier = 'HOT' WHERE tier IN ('WARM', 'COLD') AND hotness_score >= 0.5"
        )
        
        log.info("Memory decay and tier transitions completed.")
    except Exception as e:
        log.error("Memory decay failed: %s", e)

async def generate_summaries() -> None:
    """
    Uses the Cold Path LLM to generate L0 (1-line) and L1 (overview) summaries 
    for memories that lack them.
    """
    try:
        # Fetch up to 50 memories needing summaries to avoid timeouts
        rows = await db.execute(
            "SELECT id, content FROM memories WHERE l0_summary IS NULL OR l1_summary IS NULL LIMIT 50"
        )
        
        if not rows:
            return
            
        gw = get_gateway()
        # Use cold path (Gemini) to save tokens on the primary hot model
        llm = gw.get_llm("cold")
        
        for row in rows:
            content = row["content"]
            try:
                # Ask LLM for both summaries in a structured format
                prompt = (
                    "Summarize the following memory at two levels:\n"
                    "L0: A single, very short 1-line sentence.\n"
                    "L1: A brief 3-sentence overview.\n\n"
                    f"Memory:\n{content}\n\n"
                    "Format response exactly as:\nL0: [summary]\nL1: [summary]"
                )
                resp = await llm.ainvoke(prompt)
                text = resp.content
                
                l0, l1 = "", ""
                for line in text.split("\n"):
                    if line.startswith("L0:"):
                        l0 = line.replace("L0:", "").strip()
                    elif line.startswith("L1:"):
                        l1 = line.replace("L1:", "").strip()
                
                if l0 and l1:
                    await db.execute_write(
                        "UPDATE memories SET l0_summary = %s, l1_summary = %s WHERE id = %s",
                        (l0, l1, row["id"])
                    )
            except Exception as e:
                log.warning("Failed to summarize memory %s: %s", row["id"], e)
                
        log.info("Generated summaries for %d memories.", len(rows))
    except Exception as e:
        log.error("Summary generation failed: %s", e)

async def trigger_nightly_maintenance() -> None:
    """Convenience wrapper to run all background tasks sequentially."""
    log.info("Starting Nightly Maintenance...")
    await run_memory_decay()
    await generate_summaries()
    log.info("Nightly Maintenance completed.")
