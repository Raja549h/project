"""LLM Gateway — strictly Cerebras API and local Hugging Face."""

from __future__ import annotations

import logging
import time
from collections import deque
from typing import Literal

from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage

from app.config import get_settings

log = logging.getLogger(__name__)


class MultiProviderRouter:
    """Singleton gateway that manages model routing, rate-limiting, and token budgets."""

    def __init__(self) -> None:
        s = get_settings()

        # ── HOT PATH / COLD PATH: Cerebras STRICTLY ────────────────
        self._primary_model = "gpt-oss-120b"
        self._complex_model = "gemma-4-31b"
        self._fallback_model = "qwen3-235b-a22b"
        
        self.api_key = s.cerebras_api_key
        self.base_url = s.cerebras_base_url or "https://api.cerebras.ai/v1"
        
        self._fast = self._create_client(self._primary_model, 0.7, 2048)
        self._complex = self._create_client(self._complex_model, 0.4, 4096)
        self._fallback = self._create_client(self._fallback_model, 0.4, 4096)

        # ── LOCAL EMBEDDINGS ────────────────────────
        # Lazy loading to avoid blocking init
        self._embedding_model = None

        # ── Rate limiter (sliding-window) ──────────────────────────────
        self._call_times: deque[float] = deque(maxlen=s.max_api_calls_per_minute)
        self._session_tokens = 0

    def _create_client(self, model: str, temp: float, max_tokens: int) -> ChatOpenAI:
        return ChatOpenAI(
            model=model,
            api_key=self.api_key,
            base_url=self.base_url,
            temperature=temp,
            max_tokens=max_tokens,
        )

    # ── Public API ─────────────────────────────────────────────────────
    def get_llm(self, tier: str = "fast") -> ChatOpenAI:
        """Return the LangChain LLM for the requested tier."""
        self._enforce_rate_limit()
        # Fallback mechanism wrapped around the caller is tricky in LangChain unless we use fallbacks natively.
        # ChatOpenAI supports .with_fallbacks([self._fallback])
        primary_client = self._complex if tier == "complex" else self._fast
        return primary_client.with_fallbacks([self._fallback])

    async def embed(self, text: str) -> list[float]:
        """Embed a single text string locally via sentence-transformers."""
        if not self._embedding_model:
            log.info("Loading local BAAI/bge-small-en-v1.5 embedding model...")
            from sentence_transformers import SentenceTransformer
            self._embedding_model = SentenceTransformer("BAAI/bge-small-en-v1.5", device="cpu")
        
        # sentence-transformers encode returns numpy arrays
        vector = self._embedding_model.encode(text, normalize_embeddings=True)
        return vector.tolist()

    async def embed_batch(self, texts: list[str]) -> list[list[float]]:
        """Embed multiple texts in one call locally."""
        if not self._embedding_model:
            log.info("Loading local BAAI/bge-small-en-v1.5 embedding model...")
            from sentence_transformers import SentenceTransformer
            self._embedding_model = SentenceTransformer("BAAI/bge-small-en-v1.5", device="cpu")
            
        vectors = self._embedding_model.encode(texts, normalize_embeddings=True)
        return vectors.tolist()

    # ── Token budget ───────────────────────────────────────────────────
    def track_tokens(self, count: int) -> None:
        self._session_tokens += count
        s = get_settings()
        if self._session_tokens > s.max_tokens_per_session:
            raise TokenBudgetExceeded(
                f"Session budget exceeded: {self._session_tokens}/{s.max_tokens_per_session}"
            )

    def reset_session_tokens(self) -> None:
        self._session_tokens = 0

    @property
    def session_tokens(self) -> int:
        return self._session_tokens

    # ── Internals ──────────────────────────────────────────────────────
    def _enforce_rate_limit(self) -> None:
        now = time.time()
        s = get_settings()
        while self._call_times and now - self._call_times[0] > 60:
            self._call_times.popleft()
        if len(self._call_times) >= s.max_api_calls_per_minute:
            raise RateLimitExceeded("LLM rate limit exceeded — try again shortly")
        self._call_times.append(now)


class TaskComplexityClassifier:
    """Analyzes the user prompt to determine if it requires heavy processing."""

    @staticmethod
    async def classify(prompt: str) -> Literal["low", "high"]:
        """Determine if a prompt is low or high complexity using the fast hot model."""
        gateway = get_gateway()
        llm = gateway.get_llm("fast")
        
        system_prompt = (
            "You are a Task Complexity Classifier for an AI system. "
            "Analyze the user's input and reply with exactly one word: 'low' or 'high'.\n"
            "Criteria for 'low': simple questions, greetings, small clarifications, single tool requests.\n"
            "Criteria for 'high': requests requiring multi-step planning, heavy reasoning, coding, analysis, or multiple tools."
        )
        
        try:
            resp = await llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=prompt)
            ])
            text = resp.content.strip().lower()
            return "high" if "high" in text else "low"
        except Exception as e:
            log.warning("Complexity classification failed, defaulting to 'high': %s", e)
            return "high"


# ── Exceptions ─────────────────────────────────────────────────────────
class RateLimitExceeded(RuntimeError):
    pass


class TokenBudgetExceeded(RuntimeError):
    pass


# ── Singleton accessor ─────────────────────────────────────────────────
_gw: MultiProviderRouter | None = None


def get_gateway() -> MultiProviderRouter:
    global _gw
    if _gw is None:
        _gw = MultiProviderRouter()
    return _gw


def reset_gateway() -> None:
    global _gw
    _gw = None
