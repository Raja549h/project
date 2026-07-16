"""Zoey OS Secure Portal Sharing (JWT based)."""

import os
import jwt
import logging
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, HTTPException
from typing import Any
from app import db

log = logging.getLogger(__name__)

router = APIRouter()

# Secret key for JWT generation. Default to a dev string if not in env.
SECRET_KEY = os.getenv("PORTAL_SECRET_KEY", "lifeos-ascend-super-secret-key-39281")
ALGORITHM = "HS256"

async def generate_portal_link(user_id: str, resource_type: str, resource_id: str, expiry_hours: int = 24) -> str:
    """Generates a cryptographically signed JWT for secure read-only access."""
    expiration = datetime.now(timezone.utc) + timedelta(hours=expiry_hours)
    
    payload = {
        "sub": user_id,
        "res_type": resource_type,
        "res_id": resource_id,
        "exp": expiration
    }
    
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    
    # Track the token in the database for auditing or revocation
    await db.execute_write(
        "INSERT INTO portal_tokens (token_id, user_id, resource, expires_at) VALUES (%s, %s, %s, %s)",
        (token, user_id, f"{resource_type}:{resource_id}", expiration)
    )
    
    return token

@router.get("/{token}")
async def view_portal(token: str):
    """Public endpoint that validates the JWT and returns a read-only JSON view of the requested resource."""
    try:
        # Decode validates the expiration implicitly
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        res_type = payload.get("res_type")
        res_id = payload.get("res_id")
        
        # Verify token hasn't been revoked
        db_token = await db.execute_one("SELECT * FROM portal_tokens WHERE token_id = %s", (token,))
        if not db_token:
            raise HTTPException(status_code=403, detail="Token revoked or invalid.")
            
        # Fetch the requested resource safely (read-only)
        if res_type == "skill":
            data = await db.execute_one("SELECT intent, summary, success_rate FROM skills WHERE id = %s", (res_id,))
        elif res_type == "profile_blueprint":
            from app.harness_hub import HarnessHub
            data = await HarnessHub.publish_profile(user_id)
        else:
            raise HTTPException(status_code=400, detail="Unsupported resource type.")
            
        if not data:
            raise HTTPException(status_code=404, detail="Resource not found.")
            
        return {
            "status": "success",
            "owner_id": user_id,
            "resource_type": res_type,
            "data": data
        }
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Portal link has expired.")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid portal link.")
    except Exception as e:
        log.error("Portal error: %s", e)
        raise HTTPException(status_code=500, detail="Internal server error")
