"""Local Desktop Wrapper (JARVIS)."""

import time
import logging
import threading
import uvicorn
from urllib.request import urlopen
from urllib.error import URLError

log = logging.getLogger(__name__)

def run_uvicorn():
    """Run FastAPI app on 8000."""
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, log_level="warning")

def wait_for_server(url, timeout=15):
    """Poll the server until it responds, or timeout."""
    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            urlopen(url)
            log.info(f"Server is up at {url}!")
            return True
        except URLError:
            time.sleep(0.5)
    log.error(f"Server at {url} did not start in time.")
    return False

def main():
    # 1. Start FastAPI in a background thread
    server_thread = threading.Thread(target=run_uvicorn, daemon=True)
    server_thread.start()

    # 2. Start System Tray
    try:
        from app.system_tray import start_system_tray
        start_system_tray() # Starts in its own daemon thread
    except ImportError:
        pass

    # 3. Start Voice Agent (Wake Word)
    try:
        from app.voice_agent import start_voice_agent_thread
        start_voice_agent_thread()
    except ImportError:
        pass

    # 4. Wait for FastAPI to be fully up
    app_url = "http://127.0.0.1:8000"
    if not wait_for_server(f"{app_url}/docs", timeout=15):
        # We try to load anyway or exit
        pass

    # 5. Launch pywebview
    try:
        import webview
        from app.system_tray import tray_manager
        
        # We point it to the React app which will be mounted by FastAPI at /
        window = webview.create_window(
            'LifeOS ASCEND - JARVIS', 
            app_url,
            width=1280,
            height=800,
            frameless=False
        )
        
        # Link the window to the tray manager so tray can show/hide it
        if tray_manager:
            tray_manager.set_webview(window)
            
        # Run the webview main loop. This blocks the main thread.
        webview.start(private_mode=False)
        
    except ImportError:
        log.error("pywebview not installed. Desktop UI failed. Keeping server running in background.")
        while True:
            time.sleep(1)

if __name__ == "__main__":
    main()
