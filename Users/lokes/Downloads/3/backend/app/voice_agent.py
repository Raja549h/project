"""Voice Wake Word & Audio Engine (JARVIS)."""

import os
import time
import logging
import asyncio
import numpy as np
from app.config import get_settings

log = logging.getLogger(__name__)

try:
    import sounddevice as sd
    from openwakeword.model import Model
    from faster_whisper import WhisperModel
    import edge_tts
    HAS_VOICE = True
except ImportError as e:
    HAS_VOICE = False
    log.warning(f"Voice libraries not installed: {e}")


class JarvisVoiceAgent:
    def __init__(self):
        self.oww_model = None
        self.whisper_model = None
        self.running = False
        
    async def speak(self, text: str):
        """Speak response using edge-tts and play it."""
        if not HAS_VOICE:
            return
        try:
            communicate = edge_tts.Communicate(text, "en-GB-RyanNeural")
            output_file = "response.mp3"
            await communicate.save(output_file)
            
            # Simple play (depends on OS, windows usually has start)
            if os.name == 'nt':
                os.system(f"start /min {output_file}")
            else:
                os.system(f"mpg123 {output_file} >/dev/null 2>&1")
        except Exception as e:
            log.error("TTS Error: %s", e)

    def record_audio(self, duration: int = 5, fs: int = 16000) -> np.ndarray:
        """Record audio after wake word."""
        log.info("Listening for command...")
        # Play a beep tone
        if os.name == 'nt':
            import winsound
            winsound.Beep(1000, 200)
            
        recording = sd.rec(int(duration * fs), samplerate=fs, channels=1, dtype='float32')
        sd.wait()
        return recording.flatten()

    def transcribe(self, audio_data: np.ndarray) -> str:
        """Transcribe audio using faster-whisper."""
        if self.whisper_model is None:
            log.info("Loading faster-whisper base model...")
            self.whisper_model = WhisperModel("base", device="cpu", compute_type="int8")
        
        # Save temp wav
        import soundfile as sf
        sf.write("temp.wav", audio_data, 16000)
        
        segments, info = self.whisper_model.transcribe("temp.wav", beam_size=5)
        text = " ".join([segment.text for segment in segments]).strip()
        log.info(f"Transcribed: {text}")
        return text

    async def process_command(self, text: str):
        """Send to Meta-Router via local HTTP client."""
        if not text:
            return
        
        import httpx
        try:
            async with httpx.AsyncClient() as client:
                res = await client.post(
                    "http://127.0.0.1:8000/api/v1/agent/invoke",
                    json={
                        "instruction": text,
                        "execution_mode": "strict"
                    },
                    timeout=30.0
                )
                data = res.json()
                response_text = data.get("response", "I could not process that.")
                
                # Speak response
                await self.speak(response_text)
                
        except Exception as e:
            log.error("Failed to route command: %s", e)
            await self.speak("Sir, I am unable to connect to the routing core.")

    def run_loop(self):
        """Blocking loop for openwakeword. Should run in a thread."""
        if not HAS_VOICE:
            log.warning("Voice Agent disabled.")
            return
            
        try:
            # OpenWakeWord runs 100% offline with no signup required.
            # It comes bundled with standard models including "hey_jarvis".
            # We initialize the model.
            log.info("Loading OpenWakeWord model (100% Offline)...")
            self.oww_model = Model(wakeword_models=["hey_jarvis"])
            
            # Use sounddevice InputStream to capture raw 16-bit PCM audio continuously
            CHUNK = 1280
            FORMAT = 'int16'
            CHANNELS = 1
            RATE = 16000
            
            log.info("Jarvis Voice Agent online. Listening for wake word...")
            self.running = True
            
            import queue
            q = queue.Queue()

            def audio_callback(indata, frames, time, status):
                """This is called for each audio block by sounddevice."""
                if status:
                    log.warning(status)
                q.put(indata.copy())
            
            stream = sd.InputStream(
                samplerate=RATE, 
                channels=CHANNELS, 
                dtype=FORMAT, 
                blocksize=CHUNK,
                callback=audio_callback
            )
            
            with stream:
                while self.running:
                    # Get audio data from queue
                    data = q.get()
                    # Convert to numpy array shape expected by openwakeword
                    # We expect shape (1, 1280) or similar
                    audio_frame = np.frombuffer(data, dtype=np.int16)
                    
                    # Feed to model
                    prediction = self.oww_model.predict(audio_frame)
                    
                    # Prediction is a dict of scores per model. E.g. {"hey_jarvis": 0.55}
                    for mdl, score in prediction.items():
                        if score > 0.5:
                            log.info(f"Wake word detected! Score: {score}")
                            
                            # Temporarily stop the stream to record the actual command without overlap
                            stream.stop()
                            
                            # Record the command
                            command_audio = self.record_audio(duration=5)
                            text = self.transcribe(command_audio)
                            
                            # Fire off async command processing in new loop
                            try:
                                loop = asyncio.get_event_loop()
                            except RuntimeError:
                                loop = asyncio.new_event_loop()
                                asyncio.set_event_loop(loop)
                                
                            loop.create_task(self.process_command(text))
                            
                            # Resume the wake word stream
                            stream.start()
                            # Reset the model state so it doesn't instantly re-trigger
                            self.oww_model.reset()

        except Exception as e:
            log.error(f"Voice Agent Error: {e}")
            
voice_agent = JarvisVoiceAgent()

def start_voice_agent_thread():
    """Start the voice agent in a daemon thread."""
    import threading
    t = threading.Thread(target=voice_agent.run_loop, daemon=True)
    t.start()
    return t
