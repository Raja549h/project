import pytest
import os
import json
from unittest.mock import patch, MagicMock

@pytest.mark.asyncio
async def test_store_writer_updates_state():
    from app.tools.store_tools import write_store, _pending_actions, set_execution_context
    _pending_actions.clear()
    res = write_store.invoke({"store_name": "habit", "action": "update", "payload": '{"id": "workout", "completed": true}'})
    assert "queued" in res.lower()
    assert len(_pending_actions) == 1
    assert _pending_actions[0]["store"] == "habit"

def test_leveling_and_xp():
    def calculate_level(current_xp, added_xp):
        new_xp = current_xp + added_xp
        return new_xp // 100 + 1, new_xp
    
    level, xp = calculate_level(90, 20)
    assert level == 2
    assert xp == 110
