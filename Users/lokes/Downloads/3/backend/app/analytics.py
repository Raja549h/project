"""Advanced Analytics API — Phase 6."""

import logging
import json
from fastapi import APIRouter, HTTPException
from typing import Any
from app import db

log = logging.getLogger(__name__)

router = APIRouter()

@router.get("/memories/embeddings")
async def get_memory_embeddings(user_id: str = "default_user"):
    """
    Returns a mathematically projected 3D coordinate [x, y, z] for each memory
    to power the 3D WebGL frontend visualization, preventing 768-dim network bloat.
    """
    try:
        # We extract content, tier, hotness_score, and l2_embedding
        # Note: In postgres, pgvector returns embeddings as a string like "[0.1, 0.2, ...]"
        rows = await db.execute(
            "SELECT id, content, tier, hotness_score, l2_embedding::text as emb_str FROM memories WHERE user_id = %s LIMIT 200",
            (user_id,)
        )
        
        results = []
        for row in rows:
            # Parse the embedding array string
            emb_str = row.get("emb_str")
            x, y, z = 0.0, 0.0, 0.0
            
            if emb_str and emb_str != "None":
                # Clean the string "[0.1, 0.2]" -> "0.1, 0.2"
                clean_str = emb_str.strip("[]")
                if clean_str:
                    try:
                        vec = [float(v) for v in clean_str.split(",") if v.strip()]
                        if len(vec) >= 3:
                            # A simple deterministic projection: 
                            # Take the sum of slices to represent x, y, z 
                            # OR just take the first 3 dimensions multiplied by a scale factor.
                            # Let's take chunks to give it a bit more distribution
                            chunk = len(vec) // 3
                            x = sum(vec[0:chunk]) * 10
                            y = sum(vec[chunk:chunk*2]) * 10
                            z = sum(vec[chunk*2:]) * 10
                    except Exception as e:
                        log.warning(f"Error parsing embedding for memory {row['id']}: {e}")
            else:
                # Fallback deterministic pseudo-random scatter if no embedding exists
                h = hash(str(row["id"]) + row["content"])
                x = (h % 100) / 10.0 - 5.0
                y = ((h >> 8) % 100) / 10.0 - 5.0
                z = ((h >> 16) % 100) / 10.0 - 5.0

            results.append({
                "id": row["id"],
                "content": row["content"][:50] + "...",
                "tier": row["tier"],
                "hotness": row["hotness_score"],
                "position": [x, y, z]
            })
            
        return {"memories": results}
        
    except Exception as e:
        log.error("Failed to fetch memory embeddings: %s", e)
        raise HTTPException(status_code=500, detail="Internal server error")
