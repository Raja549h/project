"""ZeroGPU Production Hardening & Resilience (Phase 5)."""

import asyncio
import logging
import time
from functools import wraps
from typing import Callable, Any
from fastapi import Request, HTTPException, FastAPI
from fastapi.responses import JSONResponse
from cachetools import TTLCache

log = logging.getLogger(__name__)

# LRU Cache for frequent, semi-static DB reads (Profiles, Presets, Active Plugins)
# Stores up to 1000 items, expires after 60 seconds
_db_cache = TTLCache(maxsize=1000, ttl=60)

def InMemLRUCache(key_prefix: str):
    """Decorator to cache async DB calls in-memory."""
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Create a cache key based on prefix and args
            cache_key = f"{key_prefix}:{hash(str(args) + str(kwargs))}"
            if cache_key in _db_cache:
                return _db_cache[cache_key]
            
            result = await func(*args, **kwargs)
            _db_cache[cache_key] = result
            return result
        return wrapper
    return decorator


# In-Memory sliding window rate limiter
# To prevent ZeroGPU/API quota exhaustion. Max 10 requests per 60s per IP/User.
_rate_limits: dict[str, list[float]] = {}

def rate_limit(user_id: str, limit: int = 10, window: int = 60) -> bool:
    """Returns True if the request is allowed, False if rate-limited."""
    now = time.time()
    if user_id not in _rate_limits:
        _rate_limits[user_id] = []
        
    # Clean old timestamps
    _rate_limits[user_id] = [t for t in _rate_limits[user_id] if now - t < window]
    
    if len(_rate_limits[user_id]) >= limit:
        return False
        
    _rate_limits[user_id].append(now)
    return True


# Global Exception Handlers for ZeroGPU timeouts
async def timeout_exception_handler(request: Request, exc: asyncio.TimeoutError):
    log.warning("ZeroGPU Timeout Exception Caught: %s", exc)
    return JSONResponse(
        status_code=503,
        content={"error": "System is optimizing the agent graph (ZeroGPU constraint). Please try again in 30 seconds."}
    )

async def general_exception_handler(request: Request, exc: Exception):
    # Check if the string "timeout" is in the exception to catch underlying API timeouts
    if "timeout" in str(exc).lower():
        return await timeout_exception_handler(request, asyncio.TimeoutError())
        
    log.error("Unhandled Exception: %s", exc)
    return JSONResponse(
        status_code=500,
        content={"error": "Internal Agent Error. The system encountered an unexpected fault."}
    )

def setup_production_hardening(app: FastAPI):
    """Registers exception handlers onto the FastAPI app."""
    app.add_exception_handler(asyncio.TimeoutError, timeout_exception_handler)
    app.add_exception_handler(Exception, general_exception_handler)
    log.info("Production hardening (ZeroGPU survival kit) applied.")
