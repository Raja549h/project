"""LifeOS ASCEND tool registry – central catalogue of all available tools (MCP enabled)."""

from __future__ import annotations

import json
from typing import Any, Callable

from langchain_core.tools import BaseTool, tool
from pydantic import BaseModel, Field

from app.tools.fitness_planner import analyze_fitness_metrics, create_workout_plan
from app.tools.jee_strategist import analyze_jee_performance, create_jee_study_plan
from app.tools.store_tools import read_store, write_store
from app.tools.web_search import web_search

from app.pii_sanitizer import sanitize_text, restore_pii
try:
    from app.computer_use import computer_use
except ImportError:
    computer_use = None


# ---------------------------------------------------------------------------
# MCP Interface Wrapper
# ---------------------------------------------------------------------------
class MCPToolWrapper(BaseTool):
    """
    Wraps standard LangChain tools in an MCP-compatible interface pattern.
    Ensures that any PII sent to external APIs is sanitized first.
    """
    name: str = ""
    description: str = ""
    base_tool: BaseTool
    
    def __init__(self, base_tool: BaseTool):
        super().__init__(
            name=base_tool.name, 
            description=f"[MCP Enabled] {base_tool.description}",
            base_tool=base_tool
        )
    
    def _run(self, *args, **kwargs) -> str:
        # Sanitize all string inputs before passing to the base tool
        sanitized_kwargs = {}
        mappings = {}
        for k, v in kwargs.items():
            if isinstance(v, str):
                s_text, m = sanitize_text(v)
                sanitized_kwargs[k] = s_text
                mappings.update(m)
            else:
                sanitized_kwargs[k] = v
                
        # Execute the tool
        result = self.base_tool._run(*args, **sanitized_kwargs)
        
        # Restore PII in the result
        return restore_pii(result, mappings)

    async def _arun(self, *args, **kwargs) -> str:
        sanitized_kwargs = {}
        mappings = {}
        for k, v in kwargs.items():
            if isinstance(v, str):
                s_text, m = sanitize_text(v)
                sanitized_kwargs[k] = s_text
                mappings.update(m)
            else:
                sanitized_kwargs[k] = v
                
        if hasattr(self.base_tool, "_arun"):
            result = await self.base_tool._arun(*args, **sanitized_kwargs)
        else:
            result = self.base_tool._run(*args, **sanitized_kwargs)
            
        return restore_pii(result, mappings)

# ---------------------------------------------------------------------------
# Master list & lookup map
# ---------------------------------------------------------------------------

# Wrap all core LifeOS tools in the MCP/PII wrapper
ALL_TOOLS: list[BaseTool] = [
    MCPToolWrapper(read_store),
    MCPToolWrapper(write_store),
    MCPToolWrapper(analyze_jee_performance),
    MCPToolWrapper(create_jee_study_plan),
    MCPToolWrapper(create_workout_plan),
    MCPToolWrapper(analyze_fitness_metrics),
    MCPToolWrapper(web_search),
]

if computer_use:
    ALL_TOOLS.append(MCPToolWrapper(computer_use))

TOOL_MAP: dict[str, BaseTool] = {t.name: t for t in ALL_TOOLS}

# ---------------------------------------------------------------------------
# Intent → tool mapping
# ---------------------------------------------------------------------------

_INTENT_TOOLS: dict[str, list[str]] = {
    "jee": [
        "analyze_jee_performance",
        "create_jee_study_plan",
        "read_store",
        "write_store",
        "web_search",
    ],
    "fitness": [
        "create_workout_plan",
        "analyze_fitness_metrics",
        "read_store",
        "write_store",
    ],
    "general": [
        "read_store",
        "write_store",
        "web_search",
    ],
    "planning": [
        "create_jee_study_plan",
        "create_workout_plan",
        "read_store",
        "write_store",
    ],
    "analysis": [
        "analyze_jee_performance",
        "analyze_fitness_metrics",
        "read_store",
    ],
    "confidence": [
        "read_store",
        "write_store",
    ],
    "reputation": [
        "read_store",
        "write_store",
    ],
    "digital_boundary": [
        "read_store",
        "write_store",
    ],
    "environment": [
        "read_store",
        "write_store",
    ],
    "habits": [
        "read_store",
        "write_store",
    ],
    "os_control": [
        "computer_use",
    ]
}


def get_tools_for_intent(intent: str) -> list[BaseTool]:
    """Return the list of LangChain tools relevant to *intent*."""
    tool_names = _INTENT_TOOLS.get(intent.strip().lower())
    if tool_names is None:
        return list(ALL_TOOLS)

    tools: list[BaseTool] = []
    seen: set[str] = set()
    for name in tool_names:
        if name in TOOL_MAP and name not in seen:
            tools.append(TOOL_MAP[name])
            seen.add(name)
    return tools
