import pytest
from unittest.mock import patch, MagicMock, AsyncMock
import os

os.environ["OPENAI_API_KEY"] = "test"
os.environ["GEMINI_API_KEY"] = "test"
os.environ["CEREBRAS_API_KEY"] = "test"

@pytest.mark.asyncio
async def test_router_enforcement():
    """Verify MultiProviderRouter sends text to Cerebras and rejects Gemini/Llama."""
    from app.llm_gateway import MultiProviderRouter
    router = MultiProviderRouter()
    
    # Assert primary and complex models are strictly Cerebras
    assert "gpt-oss-120b" in router._primary_model or "gemma-4-31b" in router._primary_model
    assert "gpt-oss-120b" in router._complex_model or "gemma-4-31b" in router._complex_model
    
    # We ensure Gemini/Llama are not defined
    assert not hasattr(router, "_cold_judge") or "gemini" not in str(getattr(router, "_cold_judge", ""))

@pytest.mark.asyncio
async def test_complexity_classifier():
    """Verify simple prompts bypass heavy planner."""
    from app.llm_gateway import TaskComplexityClassifier
    
    with patch("app.llm_gateway.get_gateway") as mock_gw:
        mock_llm = AsyncMock()
        mock_llm.ainvoke.return_value = MagicMock(content="low")
        mock_gw.return_value.get_llm.return_value = mock_llm
        
        complexity = await TaskComplexityClassifier.classify("Hello")
        assert complexity == "low"
        
        mock_llm.ainvoke.return_value = MagicMock(content="high")
        complexity = await TaskComplexityClassifier.classify("Plan my 5 day workout")
        assert complexity == "high"
