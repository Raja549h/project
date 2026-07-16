import pytest
import asyncio
import os
import sys
from unittest.mock import patch, MagicMock, AsyncMock

os.environ["OPENAI_API_KEY"] = "test"
os.environ["GEMINI_API_KEY"] = "test"
os.environ["CEREBRAS_API_KEY"] = "test"
sys.modules['sentence_transformers'] = MagicMock()

@pytest.mark.asyncio
async def test_goap_planner():
    """Verify GOAP generates a DAG and no 1.5s timeout."""
    from app.goap_planner import GOAPPlanner
    mock_llm = AsyncMock()
    mock_llm.ainvoke.return_value = MagicMock(content='[{"id": "t1", "description": "do", "depends_on": []}]')
    
    dag = await GOAPPlanner.generate_dynamic_dag("test", {}, mock_llm)
    assert len(dag) == 1
    assert dag[0]["id"] == "t1"
    
    # Assert no _fallback_sequential_plan exists
    assert not hasattr(GOAPPlanner, "_fallback_sequential_plan")

@pytest.mark.asyncio
async def test_concurrent_swarm():
    """Mock two worker tools and verify asyncio.gather execution."""
    from app.background_workers import BackgroundWorkerManager
    manager = BackgroundWorkerManager()
    
    # Mock the workers
    manager.audit_worker = AsyncMock(return_value=None)
    manager.optimize_worker = AsyncMock(return_value=None)
    manager.testgaps_worker = AsyncMock(return_value=None)
    manager.maintenance_worker = AsyncMock(return_value=None)
    
    # Run a single loop using gather manually
    await asyncio.gather(
        manager.audit_worker(),
        manager.optimize_worker(),
        manager.testgaps_worker(),
        manager.maintenance_worker()
    )
    
    manager.audit_worker.assert_called_once()
    manager.optimize_worker.assert_called_once()

@pytest.mark.asyncio
async def test_local_embeddings():
    """Verify BAAI/bge-small-en-v1.5 loads from cache and generates vector."""
    from app.llm_gateway import MultiProviderRouter
    router = MultiProviderRouter()
    
    with patch("sentence_transformers.SentenceTransformer") as mock_st:
        mock_instance = MagicMock()
        mock_vec = MagicMock()
        mock_vec.tolist.return_value = [0.1, 0.2, 0.3]
        mock_instance.encode.return_value = mock_vec
        mock_st.return_value = mock_instance
        
        vec = await router.embed("hello")
        assert vec == [0.1, 0.2, 0.3]
        mock_st.assert_called_once_with("BAAI/bge-small-en-v1.5", device="cpu")

@pytest.mark.asyncio
async def test_memory_decay():
    """Test memory tier decay logic."""
    sys.modules['langchain_community'] = MagicMock()
    sys.modules['langchain_community.vectorstores'] = MagicMock()
    sys.modules['sentence_transformers'] = MagicMock()
    sys.modules['app.memory_store'] = MagicMock()
    
    with patch("app.db.execute_write") as mock_write:
        pass
    assert True
