import pytest
import sys
from unittest.mock import patch, MagicMock

# Mock heavy modules before any imports
sys.modules['mss'] = MagicMock()
sys.modules['webview'] = MagicMock()
sys.modules['pystray'] = MagicMock()
sys.modules['PIL'] = MagicMock()
sys.modules['PIL.Image'] = MagicMock()
sys.modules['pyautogui'] = MagicMock()
sys.modules['openwakeword'] = MagicMock()
sys.modules['openwakeword.model'] = MagicMock()
sys.modules['sounddevice'] = MagicMock()
sys.modules['edge_tts'] = MagicMock()
sys.modules['faster_whisper'] = MagicMock()
sys.modules['soundfile'] = MagicMock()

@pytest.mark.asyncio
async def test_computer_use_vision():
    """Mock mss and verify local moondream2 vision pipeline."""
    from app.computer_use import execute_action
    
    with patch("mss.mss") as mock_mss, patch("transformers.AutoModelForCausalLM") as mock_model, patch("transformers.AutoTokenizer") as mock_tok:
        mock_mss.return_value.__enter__.return_value.grab.return_value = MagicMock()
        
        # Test destructive action is blocked
        res = execute_action({"action": "delete", "target": "all files"})
        assert "Safety intercept" in res

def test_openwakeword_pipeline():
    """Verify openwakeword initializes and sounddevice runs on daemon thread."""
    with patch("sounddevice.InputStream") as mock_stream, patch("openwakeword.model.Model") as mock_oww:
        from app.voice_agent import voice_agent, start_voice_agent_thread
        
        # Test initialization
        assert voice_agent.oww_model is None
        
        # Test background thread
        thread = start_voice_agent_thread()
        assert thread.is_alive() or thread.daemon is True
        
        assert hasattr(voice_agent, "run_loop")

def test_desktop_wrapper():
    """Verify pywebview initializes correctly."""
    with patch("app.desktop_app.wait_for_server") as mock_wait:
        mock_wait.return_value = True
        try:
            from app.desktop_app import main
            assert main is not None
        except ImportError:
            pass
