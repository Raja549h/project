# LifeOS ASCEND - Local Desktop Agent

LifeOS ASCEND is a fully autonomous, local Windows desktop agent. It features a robust 5-layer Multi-Agent system powered by Cerebras LLMs, complete with localized computer vision (moondream2) and audio transcription (faster-whisper) engines.

## Architecture

- **Strictly Local**: The agent is designed to run entirely locally as a background `.exe` on Windows, residing in your System Tray (via `pystray`).
- **No Cloud Dependencies**: All features are decoupled from any Hugging Face / Cloud constraints. The Goap Planner uses unbounded A* exploration without artificial timeouts, and background workers run concurrently on an unrestricted event loop.
- **Agent Mesh**: Combines an intent-based Meta-Router with deep reinforcement learning over past trajectories.

## Build Instructions

1. Install requirements:
```bash
pip install -r requirements.txt
```

2. Compile the binary using PyInstaller:
```bash
pyinstaller build.spec --clean
```

The resulting `LifeOS_ASCEND.exe` will run natively and silently in the background on port `8000`.
