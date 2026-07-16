from __future__ import annotations
import json
import logging
from typing import Any
from langchain_core.messages import SystemMessage, HumanMessage

log = logging.getLogger(__name__)


class MetaRouter:
    """Classifies user intent, determines complexity, and decomposes multi-domain requests into sub-tasks."""

    INTENT_CATEGORIES: dict[str, str] = {
        'jee': 'JEE exam preparation, study plans, subject analysis',
        'fitness': 'Workout plans, nutrition, health metrics, steps, sleep',
        'habits': 'Habit tracking, streak management, daily routines',
        'confidence': 'Public speaking, presentation skills, charisma',
        'reputation': 'Trust, reliability, networking, character building',
        'digital_boundary': 'Screen time, focus management, distraction control',
        'environment': 'Workspace optimization, focus environment, sleep environment',
        'planning': 'Multi-domain planning that spans multiple life areas',
        'analysis': 'Data analysis across all metrics, patterns, insights',
        'motivation': 'Emotional support, encouragement, dealing with setbacks',
        'general': 'General life advice, questions that do not fit other categories',
    }

    async def classify_and_decompose(
        self, user_input: str, user_context: dict, llm
    ) -> dict:
        """Classify the user's intent, assess complexity, and decompose into sub-tasks.

        Returns a dict with keys:
            intent   – primary intent category string
            complexity – 'simple' or 'complex'
            sub_tasks  – list of dicts each with 'description' and 'intent'
        """
        intent_list = "\n".join(
            f"  - {key}: {desc}" for key, desc in self.INTENT_CATEGORIES.items()
        )

        context_keys = ", ".join(user_context.keys()) if user_context else "none"

        system_prompt = (
            "You are the MetaRouter for the LifeOS ASCEND system. "
            "Your job is to classify a user's request, determine its complexity, "
            "and decompose it into actionable sub-tasks.\n\n"
            "Respond ONLY with a valid JSON object — no markdown fences, no extra text."
        )

        user_prompt = f"""Classify the following user input and decompose it into sub-tasks.

AVAILABLE INTENT CATEGORIES:
{intent_list}

USER CONTEXT DOMAINS AVAILABLE: {context_keys}

USER INPUT:
\"{user_input}\"

Return a JSON object with exactly these keys:
{{
  "intent": "<primary intent from the list above>",
  "complexity": "<'simple' if single-domain and straightforward, 'complex' if multi-domain or requires planning>",
  "sub_tasks": [
    {{
      "description": "<specific actionable sub-task description>",
      "intent": "<intent category for this sub-task>"
    }}
  ]
}}

Rules:
1. If the request touches only ONE domain, set complexity to "simple" and create a single sub-task.
2. If the request spans MULTIPLE domains or needs significant planning, set complexity to "complex" and create multiple sub-tasks.
3. Each sub-task must have a clear, specific description and a valid intent from the list.
4. The primary intent should be the MOST relevant category. Use "planning" if the request genuinely spans 3+ domains.
"""

        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_prompt),
        ]

        response = await llm.ainvoke(messages)
        raw = response.content.strip()

        # Strip markdown code fences if present
        if raw.startswith("```"):
            lines = raw.split("\n")
            # Remove first and last fence lines
            lines = [l for l in lines if not l.strip().startswith("```")]
            raw = "\n".join(lines).strip()

        try:
            parsed = json.loads(raw)
            intent = parsed.get("intent", "general")
            if intent not in self.INTENT_CATEGORIES:
                intent = "general"

            complexity = parsed.get("complexity", "simple")
            if complexity not in ("simple", "complex"):
                complexity = "simple"

            sub_tasks = parsed.get("sub_tasks", [])
            if not isinstance(sub_tasks, list) or len(sub_tasks) == 0:
                sub_tasks = [{"description": user_input, "intent": intent}]

            # Validate each sub-task
            validated: list[dict[str, str]] = []
            for st in sub_tasks:
                if isinstance(st, dict) and "description" in st:
                    st_intent = st.get("intent", intent)
                    if st_intent not in self.INTENT_CATEGORIES:
                        st_intent = intent
                    validated.append(
                        {"description": st["description"], "intent": st_intent}
                    )
            if not validated:
                validated = [{"description": user_input, "intent": intent}]

            return {
                "intent": intent,
                "complexity": complexity,
                "sub_tasks": validated,
            }

        except (json.JSONDecodeError, TypeError, KeyError) as exc:
            log.warning("MetaRouter failed to parse LLM response: %s — raw: %s", exc, raw[:200])
            return {
                "intent": "general",
                "complexity": "simple",
                "sub_tasks": [{"description": user_input, "intent": "general"}],
            }
