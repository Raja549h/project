"""Extensibility Plugin Loader."""

import os
import sys
import importlib.util
import inspect
import logging
from langchain_core.tools import BaseTool

from app import db
from app.tools.registry import ALL_TOOLS, TOOL_MAP, MCPToolWrapper

log = logging.getLogger(__name__)

PLUGIN_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "plugins")

async def load_plugins():
    """Scans the /plugins directory for Python files and registers any @tool functions."""
    if not os.path.exists(PLUGIN_DIR):
        os.makedirs(PLUGIN_DIR, exist_ok=True)
        return

    sys.path.insert(0, PLUGIN_DIR)

    for filename in os.listdir(PLUGIN_DIR):
        if filename.endswith(".py") and not filename.startswith("__"):
            module_name = filename[:-3]
            file_path = os.path.join(PLUGIN_DIR, filename)

            try:
                spec = importlib.util.spec_from_file_location(module_name, file_path)
                if spec and spec.loader:
                    module = importlib.util.module_from_spec(spec)
                    spec.loader.exec_module(module)

                    # Scan for LangChain BaseTools
                    tools_found = 0
                    for name, obj in inspect.getmembers(module):
                        if isinstance(obj, BaseTool):
                            # Wrap in MCP/PII wrapper
                            wrapped_tool = MCPToolWrapper(obj)
                            if wrapped_tool.name not in TOOL_MAP:
                                ALL_TOOLS.append(wrapped_tool)
                                TOOL_MAP[wrapped_tool.name] = wrapped_tool
                                tools_found += 1
                    
                    if tools_found > 0:
                        log.info(f"Loaded {tools_found} tools from plugin '{module_name}'")
                        await db.execute_write(
                            "INSERT INTO plugin_registry (plugin_name, status) VALUES (%s, 'active') ON CONFLICT DO NOTHING",
                            (module_name,)
                        )
            except Exception as e:
                log.error(f"Failed to load plugin {module_name}: {e}")

    # Remove from path to keep clean
    if PLUGIN_DIR in sys.path:
        sys.path.remove(PLUGIN_DIR)
