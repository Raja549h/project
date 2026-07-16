from __future__ import annotations

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """All config is pulled from local .env vars."""

    # ── LLM provider keys ──────────────────────────────────────────────
    cerebras_api_key: str = ""
    cerebras_base_url: str = "https://api.cerebras.ai/v1"
    gemini_api_key: str = ""

    # ── Security & Provenance ──────────────────────────────────────────
    provenance_secret: str = "super-secret-default-key-change-in-prod"

    # ── Neon Postgres ──────────────────────────────────────────────────
    neon_database_url: str = ""

    # ── Model routing ──────────────────────────────────────────────────
    fast_model: str = "gemma-4-31b"
    complex_model: str = "gpt-oss-120b"
    embedding_model: str = "all-MiniLM-L6-v2"

    # ── Governance policy limits ───────────────────────────────────────
    max_tokens_per_session: int = 50_000
    max_api_calls_per_minute: int = 30
    max_agent_iterations: int = 3
    evaluator_threshold: float = 7.0

    # ── Server ─────────────────────────────────────────────────────────
    port: int = 8000
    log_level: str = "info"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


@lru_cache()
def get_settings() -> Settings:
    return Settings()
