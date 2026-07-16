from __future__ import annotations
import logging
from typing import Any
from langchain_core.messages import SystemMessage, HumanMessage

log = logging.getLogger(__name__)


class SynthesizerAgent:
    """Combines multiple worker agent outputs into a single unified, coherent response."""

    async def synthesize(
        self,
        worker_results: list[dict],
        user_input: str,
        intent: str,
        llm,
        critique: str = "",
    ) -> str:
        """Merge all worker results into one polished response.

        Args:
            worker_results: List of dicts from WorkerAgent.execute(), each containing
                            'agent_id', 'role', 'thought', 'tool_calls', 'raw_response'.
            user_input:     The original user query.
            intent:         The classified intent category.
            llm:            LangChain LLM instance.
            critique:       Optional evaluator critique for retry-based improvement.

        Returns:
            A single synthesized response string ready for the user.
        """
        # Format each worker's output into a readable block
        worker_sections: list[str] = []
        for i, wr in enumerate(worker_results, 1):
            section_lines = [
                f"--- Worker {i} (role: {wr.get('role', 'unknown')}, id: {wr.get('agent_id', 'n/a')}) ---",
                f"Thought:\n{wr.get('thought', '')}",
            ]
            tool_calls = wr.get("tool_calls", [])
            if tool_calls:
                section_lines.append("Tool Results:")
                for tc in tool_calls:
                    section_lines.append(
                        f"  • {tc.get('tool', '?')}({tc.get('args', {})}) → {tc.get('result', 'n/a')}"
                    )
            worker_sections.append("\n".join(section_lines))

        combined_workers = "\n\n".join(worker_sections)

        critique_block = ""
        if critique:
            critique_block = f"""

IMPORTANT — PREVIOUS EVALUATION CRITIQUE (address these issues):
{critique}
"""

        system_prompt = (
            "You are the Synthesizer for the LifeOS ASCEND system. "
            "Your job is to take outputs from multiple specialized worker agents "
            "and combine them into a single, polished, user-facing response.\n\n"
            "Guidelines:\n"
            "- Eliminate all redundancy and repetition across workers.\n"
            "- Maintain a consistent, encouraging but honest tone throughout.\n"
            "- Prioritize actionable advice with specific next steps.\n"
            "- Reference the user's actual metrics and data points whenever possible.\n"
            "- Structure the response logically with clear sections if covering multiple topics.\n"
            "- Do NOT mention that multiple agents were involved — speak as one unified assistant.\n"
            "- Keep the response concise but comprehensive."
        )

        user_prompt = f"""ORIGINAL USER REQUEST:
\"{user_input}\"

CLASSIFIED INTENT: {intent}

WORKER AGENT OUTPUTS:
{combined_workers}
{critique_block}
Synthesize these worker outputs into a single, cohesive, high-quality response for the user.
The response should feel like it comes from one knowledgeable assistant, not a committee.
Be specific, reference real numbers, and provide clear action items."""

        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_prompt),
        ]

        response = await llm.ainvoke(messages)
        synthesized = response.content

        if not synthesized or not synthesized.strip():
            log.warning("Synthesizer received empty LLM response, falling back to raw concatenation")
            fallback_parts = [
                wr.get("raw_response", wr.get("thought", ""))
                for wr in worker_results
                if wr.get("raw_response") or wr.get("thought")
            ]
            synthesized = "\n\n".join(fallback_parts) if fallback_parts else "I'm sorry, I was unable to generate a response. Please try again."

        return synthesized
