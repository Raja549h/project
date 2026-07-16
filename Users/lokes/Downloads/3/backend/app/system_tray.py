"""System Tray Manager (JARVIS)."""

import os
import threading
import logging
from PIL import Image, ImageDraw

log = logging.getLogger(__name__)

try:
    import pystray
    from pystray import MenuItem as item
    HAS_TRAY = True
except ImportError:
    HAS_TRAY = False

def create_image(width=64, height=64):
    """Generate a dynamic JARVIS icon if a real one isn't provided."""
    color1 = (20, 20, 20)
    color2 = (0, 150, 255)
    
    image = Image.new('RGB', (width, height), color1)
    dc = ImageDraw.Draw(image)
    dc.ellipse((width//4, height//4, width - width//4, height - height//4), fill=color2)
    return image

class JarvisTray:
    def __init__(self):
        self.icon = None
        self.webview_window = None

    def set_webview(self, window):
        self.webview_window = window

    def show_dashboard(self, icon, item):
        log.info("Opening Dashboard via Tray")
        if self.webview_window:
            self.webview_window.show()
            self.webview_window.restore()

    def pause_agent(self, icon, item):
        log.info("Pausing Agent via Tray")
        # In a full implementation, this calls an API to suspend background_workers.py
        import httpx
        try:
            httpx.post("http://127.0.0.1:7860/api/v1/agent/intervene", json={"action": "pause"}, timeout=5)
        except Exception as e:
            log.warning("Failed to pause agent: %s", e)

    def quit_app(self, icon, item):
        log.info("Quitting Jarvis via Tray")
        icon.stop()
        if self.webview_window:
            self.webview_window.destroy()
        os._exit(0)  # Hard exit to kill all uvicorn/background threads

    def setup_tray(self):
        if not HAS_TRAY:
            log.warning("pystray not installed, skipping system tray.")
            return

        icon_image = create_image()
        
        menu = pystray.Menu(
            item('Open Dashboard', self.show_dashboard, default=True),
            item('Pause Agent', self.pause_agent),
            item('Quit', self.quit_app)
        )
        
        self.icon = pystray.Icon("Jarvis", icon_image, "LifeOS JARVIS", menu)
        log.info("System Tray initialized.")

    def run(self):
        if self.icon:
            # This blocks the thread it runs in
            self.icon.run()

tray_manager = JarvisTray()

def start_system_tray(webview_window=None):
    tray_manager.set_webview(webview_window)
    tray_manager.setup_tray()
    
    # Run in daemon thread so it doesn't block FastAPI boot if called early
    t = threading.Thread(target=tray_manager.run, daemon=True)
    t.start()
    return t
