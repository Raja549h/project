"""Provenance and Audit System for LifeOS ASCEND.

Provides cryptographic signing of trajectory logs using HMAC-SHA256 to ensure
tamper-proof records of agent decisions and actions.
"""

from __future__ import annotations

import hmac
import hashlib
import json
from typing import Any

from app.config import get_settings


def generate_provenance_hash(payload: dict[str, Any]) -> str:
    """Generate a HMAC-SHA256 hash for the given payload using the configured secret.
    
    The payload is serialized to a canonical JSON string (sorted keys) before hashing.
    """
    settings = get_settings()
    secret_key = settings.provenance_secret.encode("utf-8")
    
    # Create canonical JSON representation
    message = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")
    
    # Generate HMAC
    signature = hmac.new(secret_key, message, hashlib.sha256).hexdigest()
    
    return f"sha256={signature}"


def verify_provenance_hash(payload: dict[str, Any], provided_hash: str) -> bool:
    """Verify that the provided hash matches the payload's computed HMAC-SHA256."""
    expected_hash = generate_provenance_hash(payload)
    # Use hmac.compare_digest to prevent timing attacks
    return hmac.compare_digest(expected_hash, provided_hash)
