"""Policy Engine — hard governance constraints that wrap tool execution."""

from __future__ import annotations

import logging
from dataclasses import dataclass, field

from app.config import get_settings

log = logging.getLogger(__name__)


# ── Policy rules ───────────────────────────────────────────────────────

BLOCKED_ACTIONS = frozenset(
    {
        "resetProgress",      # Never wipe user progress
        "deleteAllHabits",    # Never mass-delete
        "deleteAllProjects",
        "clearConversation",  # Don't clear AI chat history via agent
    }
)

ALLOWED_STORES = frozenset(
    {
        "user", "fitness", "habit", "jee", "confidence",
        "reputation", "boundary", "deepWork", "environment",
        "project", "lifeAudit", "battle", "quests", "skills",
        "achievements", "analytics",
    }
)

WRITE_REQUIRES_APPROVAL = frozenset(
    {
        "resetProgress",
        "deleteHabit",
        "removeProject",
    }
)


# ── Token budget tracker ──────────────────────────────────────────────

@dataclass
class TokenBudget:
    limit: int = 50_000
    used: int = 0

    @property
    def remaining(self) -> int:
        return max(0, self.limit - self.used)

    @property
    def exhausted(self) -> bool:
        return self.used >= self.limit

    def consume(self, tokens: int) -> None:
        self.used += tokens
        if self.exhausted:
            raise TokenBudgetExhausted(
                f"Token budget exhausted: {self.used}/{self.limit}"
            )

    def reset(self) -> None:
        self.used = 0


class TokenBudgetExhausted(RuntimeError):
    pass


# ── Violation record ──────────────────────────────────────────────────

@dataclass
class PolicyViolation:
    rule: str
    detail: str
    severity: str = "block"  # 'block' | 'warn' | 'require_approval'


# ── Main engine ───────────────────────────────────────────────────────

class PolicyEngine:
    """Enforces hard constraints before any agent action is executed."""

    def __init__(self) -> None:
        s = get_settings()
        self.budget = TokenBudget(limit=s.max_tokens_per_session)
        self._violations: list[PolicyViolation] = []

    # ── Tool-call validation ───────────────────────────────────────────
    def validate_tool_call(self, tool_name: str, args: dict) -> PolicyViolation | None:
        """Check if a tool call is allowed. Returns a violation or None."""

        # 1. Blocked actions
        action = args.get("action", "")
        if action in BLOCKED_ACTIONS:
            v = PolicyViolation(
                rule="BLOCKED_ACTION",
                detail=f"Action '{action}' is permanently blocked by policy",
                severity="block",
            )
            self._violations.append(v)
            return v

        # 2. Store validation (for store_reader / store_writer)
        store = args.get("store_name", "")
        if store and store not in ALLOWED_STORES:
            v = PolicyViolation(
                rule="UNKNOWN_STORE",
                detail=f"Store '{store}' is not a recognized LifeOS store",
                severity="block",
            )
            self._violations.append(v)
            return v

        # 3. Approval-required actions
        if action in WRITE_REQUIRES_APPROVAL:
            v = PolicyViolation(
                rule="REQUIRES_APPROVAL",
                detail=f"Action '{action}' requires human approval before execution",
                severity="require_approval",
            )
            self._violations.append(v)
            return v

        return None

    # ── Iteration guard ────────────────────────────────────────────────
    def check_iteration_limit(self, current: int) -> PolicyViolation | None:
        s = get_settings()
        if current >= s.max_agent_iterations:
            v = PolicyViolation(
                rule="MAX_ITERATIONS",
                detail=f"Agent loop reached maximum iterations ({current}/{s.max_agent_iterations})",
                severity="block",
            )
            self._violations.append(v)
            return v
        return None

    # ── Token tracking ─────────────────────────────────────────────────
    def consume_tokens(self, count: int) -> PolicyViolation | None:
        try:
            self.budget.consume(count)
            return None
        except TokenBudgetExhausted as e:
            v = PolicyViolation(
                rule="TOKEN_BUDGET",
                detail=str(e),
                severity="block",
            )
            self._violations.append(v)
            return v

    # ── Output validation ──────────────────────────────────────────────
    def validate_output(self, response: str) -> PolicyViolation | None:
        """Basic safety checks on generated output."""
        dangerous_patterns = [
            "rm -rf", "DROP TABLE", "DELETE FROM", "FORMAT C:",
            "sudo ", "chmod 777",
        ]
        lower = response.lower()
        for pat in dangerous_patterns:
            if pat.lower() in lower:
                v = PolicyViolation(
                    rule="DANGEROUS_OUTPUT",
                    detail=f"Response contains dangerous pattern: '{pat}'",
                    severity="warn",
                )
                self._violations.append(v)
                return v
        return None

    # ── Inspection ─────────────────────────────────────────────────────
    @property
    def violations(self) -> list[PolicyViolation]:
        return list(self._violations)

    def reset(self) -> None:
        self._violations.clear()
        self.budget.reset()

    def summary(self) -> dict:
        return {
            "tokens_used": self.budget.used,
            "tokens_remaining": self.budget.remaining,
            "violations_count": len(self._violations),
            "violations": [
                {"rule": v.rule, "detail": v.detail, "severity": v.severity}
                for v in self._violations
            ],
        }
