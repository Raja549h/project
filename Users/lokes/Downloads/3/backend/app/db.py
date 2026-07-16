"""Neon Postgres async pool + auto-migrations (pgvector enabled)."""

from __future__ import annotations

import logging
from psycopg_pool import AsyncConnectionPool
from pgvector.psycopg import register_vector_async

from app.config import get_settings

log = logging.getLogger(__name__)

_pool: AsyncConnectionPool | None = None


# ── Pool lifecycle ─────────────────────────────────────────────────────
async def init_pool() -> None:
    global _pool
    s = get_settings()
    if not s.neon_database_url:
        log.warning("NEON_DATABASE_URL not set — database features disabled")
        return
    _pool = AsyncConnectionPool(
        conninfo=s.neon_database_url,
        min_size=1,
        max_size=5,
        open=False,
    )
    await _pool.open()
    log.info("Neon connection pool opened")


async def close_pool() -> None:
    global _pool
    if _pool:
        await _pool.close()
        _pool = None
        log.info("Neon connection pool closed")


def get_pool() -> AsyncConnectionPool:
    if _pool is None:
        raise RuntimeError("Database pool not initialised — set NEON_DATABASE_URL")
    return _pool


# ── Migrations (run on every container start) ──────────────────────────
_MIGRATIONS = [
    # 1. pgvector extension
    "CREATE EXTENSION IF NOT EXISTS vector;",

    # 2. Sessions
    """
    CREATE TABLE IF NOT EXISTS sessions (
        id              TEXT PRIMARY KEY,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
        user_context    JSONB       NOT NULL DEFAULT '{}'::jsonb,
        total_tokens    INTEGER     NOT NULL DEFAULT 0,
        status          TEXT        NOT NULL DEFAULT 'active'
    );
    """,

    # 3. Trajectory log — every agent thought / action / outcome
    """
    CREATE TABLE IF NOT EXISTS trajectories (
        id               SERIAL      PRIMARY KEY,
        session_id       TEXT        NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
        agent_id         TEXT        NOT NULL,
        node_name        TEXT,
        ts               TIMESTAMPTZ NOT NULL DEFAULT now(),
        thought          TEXT,
        action           TEXT,
        tool_name        TEXT,
        tool_args        JSONB       DEFAULT '{}'::jsonb,
        result           TEXT,
        tokens_used      INTEGER     DEFAULT 0,
        outcome          TEXT,
        meta             JSONB       DEFAULT '{}'::jsonb,
        execution_mode   TEXT        DEFAULT 'auto',
        complexity_score TEXT        DEFAULT 'low',
        judge_scores     JSONB       DEFAULT '{}'::jsonb,
        provenance_hash  TEXT
    );
    """,
    "ALTER TABLE trajectories ADD COLUMN IF NOT EXISTS execution_mode TEXT DEFAULT 'auto';",
    "ALTER TABLE trajectories ADD COLUMN IF NOT EXISTS complexity_score TEXT DEFAULT 'low';",
    "ALTER TABLE trajectories ADD COLUMN IF NOT EXISTS judge_scores JSONB DEFAULT '{}'::jsonb;",
    "ALTER TABLE trajectories ADD COLUMN IF NOT EXISTS provenance_hash TEXT;",
    "CREATE INDEX IF NOT EXISTS idx_traj_session ON trajectories(session_id);",

    # 4. Distilled skills with pgvector embedding
    """
    CREATE TABLE IF NOT EXISTS skills (
        id                  SERIAL      PRIMARY KEY,
        created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
        intent              TEXT        NOT NULL,
        summary             TEXT        NOT NULL,
        prompt_template     TEXT,
        trajectory_summary  TEXT,
        success_count       INTEGER     NOT NULL DEFAULT 1,
        embedding           vector(384),
        meta                JSONB       DEFAULT '{}'::jsonb
    );
    """,
    "ALTER TABLE skills ADD COLUMN IF NOT EXISTS name TEXT;",
    "ALTER TABLE skills ADD COLUMN IF NOT EXISTS description TEXT;",
    "ALTER TABLE skills ADD COLUMN IF NOT EXISTS trigger_conditions JSONB DEFAULT '{}'::jsonb;",
    "ALTER TABLE skills ADD COLUMN IF NOT EXISTS provenance_hash TEXT;",
    "ALTER TABLE skills ADD COLUMN IF NOT EXISTS success_rate FLOAT DEFAULT 0.0;",

    # 5. HNSW index for cosine similarity (works even on empty tables)
    """
    CREATE INDEX IF NOT EXISTS idx_skills_embedding
    ON skills USING hnsw (embedding vector_cosine_ops);
    """,

    # 5b. Memories (Tiered Storage)
    """
    CREATE TABLE IF NOT EXISTS memories (
        id              SERIAL      PRIMARY KEY,
        user_id         TEXT        NOT NULL,
        content         TEXT        NOT NULL,
        tier            TEXT        NOT NULL DEFAULT 'HOT',
        hotness_score   FLOAT       NOT NULL DEFAULT 1.0,
        access_count    INTEGER     NOT NULL DEFAULT 1,
        last_accessed   TIMESTAMPTZ NOT NULL DEFAULT now(),
        l0_summary      TEXT,
        l1_summary      TEXT,
        l2_embedding    vector(768)
    );
    """,
    "CREATE INDEX IF NOT EXISTS idx_memories_user ON memories(user_id);",
    "CREATE INDEX IF NOT EXISTS idx_memories_tier ON memories(tier);",

    # 5c. User Profiles
    """
    CREATE TABLE IF NOT EXISTS user_profiles (
        user_id         TEXT        PRIMARY KEY,
        preferences     JSONB       DEFAULT '{}'::jsonb,
        behavioral_data JSONB       DEFAULT '{}'::jsonb,
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    """,

    # 6. Pending actions (sandbox queue for frontend execution)
    """
    CREATE TABLE IF NOT EXISTS pending_actions (
        id          SERIAL      PRIMARY KEY,
        session_id  TEXT        NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
        store_name  TEXT        NOT NULL,
        action      TEXT        NOT NULL,
        payload     JSONB       NOT NULL DEFAULT '{}'::jsonb,
        status      TEXT        NOT NULL DEFAULT 'pending',
        approved_by TEXT
    );
    """,

    # 7. Active Swarms for Intervention API
    """
    CREATE TABLE IF NOT EXISTS active_swarms (
        thread_id   TEXT        PRIMARY KEY,
        state_json  JSONB       DEFAULT '{}'::jsonb,
        status      TEXT        NOT NULL DEFAULT 'running',
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    """,

    # 8. Soul Presets (Harness Hub)
    """
    CREATE TABLE IF NOT EXISTS soul_presets (
        preset_id   TEXT        PRIMARY KEY,
        category    TEXT        NOT NULL,
        name        TEXT        NOT NULL,
        prompt      TEXT        NOT NULL,
        metadata    JSONB       DEFAULT '{}'::jsonb
    );
    """,

    # 9. Portal Tokens (Zoey OS Sharing)
    """
    CREATE TABLE IF NOT EXISTS portal_tokens (
        token_id    TEXT        PRIMARY KEY,
        user_id     TEXT        NOT NULL,
        resource    TEXT        NOT NULL,
        expires_at  TIMESTAMPTZ NOT NULL,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    """,

    # 10. Plugin Registry (Extensibility)
    """
    CREATE TABLE IF NOT EXISTS plugin_registry (
        plugin_name TEXT        PRIMARY KEY,
        status      TEXT        NOT NULL DEFAULT 'active',
        loaded_at   TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    """
]


async def run_migrations() -> None:
    """Execute all migrations inside a single transaction."""
    pool = get_pool()
    async with pool.connection() as conn:
        await register_vector_async(conn)
        async with conn.transaction():
            for stmt in _MIGRATIONS:
                await conn.execute(stmt)
    log.info("Database migrations completed (%d statements)", len(_MIGRATIONS))


# ── Helpers ────────────────────────────────────────────────────────────
async def execute(query: str, params: tuple | list | None = None) -> list[dict]:
    pool = get_pool()
    async with pool.connection() as conn:
        await register_vector_async(conn)
        cur = await conn.execute(query, params)
        if cur.description:
            cols = [d.name for d in cur.description]
            return [dict(zip(cols, row)) for row in await cur.fetchall()]
        return []


async def execute_one(query: str, params: tuple | list | None = None) -> dict | None:
    rows = await execute(query, params)
    return rows[0] if rows else None


async def execute_write(query: str, params: tuple | list | None = None) -> None:
    pool = get_pool()
    async with pool.connection() as conn:
        await register_vector_async(conn)
        await conn.execute(query, params)
        await conn.commit()
