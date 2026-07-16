"""LifeOS ASCEND store tools for reading/writing Zustand stores."""

from __future__ import annotations

import json
from typing import Any

from langchain_core.tools import tool

# ---------------------------------------------------------------------------
# Execution context – injected at runtime before the agent processes a request
# ---------------------------------------------------------------------------

_execution_context: dict[str, Any] = {}

KNOWN_STORES: set[str] = {
    "user",
    "fitness",
    "habit",
    "jee",
    "confidence",
    "reputation",
    "boundary",
    "deepWork",
    "environment",
    "project",
    "lifeAudit",
    "battle",
    "quests",
    "skills",
    "achievements",
}


def set_execution_context(ctx: dict[str, Any]) -> None:
    """Replace the current execution context with *ctx*.

    The context is a flat dictionary whose keys are store names and values are
    the serialisable state snapshots coming from the frontend.
    """
    global _execution_context  # noqa: PLW0603
    _execution_context = ctx


# ---------------------------------------------------------------------------
# Pending actions – queued writes that the frontend will execute after the
# agent finishes its turn.
# ---------------------------------------------------------------------------

_pending_actions: list[dict[str, Any]] = []


def get_pending_actions() -> list[dict[str, Any]]:
    """Return a shallow copy of the pending-actions queue."""
    return list(_pending_actions)


def clear_pending_actions() -> None:
    """Drain the pending-actions queue."""
    _pending_actions.clear()


# ---------------------------------------------------------------------------
# LangChain tools
# ---------------------------------------------------------------------------


@tool
def read_store(store_name: str) -> str:
    """Read data from a LifeOS ASCEND Zustand store.

    Available stores: user, fitness, habit, jee, confidence, reputation,
    boundary, deepWork, environment, project, lifeAudit, battle, quests,
    skills, achievements.
    """
    if store_name not in KNOWN_STORES:
        return (
            f"Error: Unknown store '{store_name}'. "
            f"Available stores: {', '.join(sorted(KNOWN_STORES))}"
        )

    data = _execution_context.get(store_name)
    if data is None:
        return (
            f"Store '{store_name}' is not present in the current execution "
            "context. It may not have been loaded yet."
        )

    try:
        return json.dumps(data, indent=2, default=str)
    except (TypeError, ValueError) as exc:
        return f"Error serialising store '{store_name}': {exc}"


@tool
def write_store(store_name: str, action: str, payload: str) -> str:
    """Queue a write action to a LifeOS store.

    The action is validated and sent to the frontend for execution.
    Actions: 'addXP', 'setSteps', 'addWorkout', 'toggleHabit', 'addScore',
    'logDistraction', etc.
    """
    if store_name not in KNOWN_STORES:
        return (
            f"Error: Unknown store '{store_name}'. "
            f"Available stores: {', '.join(sorted(KNOWN_STORES))}"
        )

    if not action or not action.strip():
        return "Error: 'action' must be a non-empty string."

    try:
        parsed_payload = json.loads(payload)
    except json.JSONDecodeError as exc:
        return f"Error: Failed to parse payload as JSON – {exc}"

    entry: dict[str, Any] = {
        "store": store_name,
        "action": action.strip(),
        "payload": parsed_payload,
    }
    _pending_actions.append(entry)

    return (
        f"Action queued: {action} on store '{store_name}' with payload "
        f"{json.dumps(parsed_payload, default=str)}. "
        f"Total pending actions: {len(_pending_actions)}."
    )
