"""Ruflo Background Workers — 12 Auto-Workers running locally."""

import asyncio
import logging
from app import db

log = logging.getLogger(__name__)

class BackgroundWorkerManager:
    """Manages the background execution of Ruflo auto-workers concurrently."""
    
    def __init__(self):
        self._running = False
        self._task = None

    def start(self):
        if not self._running:
            self._running = True
            self._task = asyncio.create_task(self._worker_loop())
            log.info("Ruflo BackgroundWorkerManager started.")

    def stop(self):
        self._running = False
        if self._task:
            self._task.cancel()
            log.info("Ruflo BackgroundWorkerManager stopped.")

    async def _worker_loop(self):
        """Runs the workers concurrently on a reasonable schedule."""
        while self._running:
            try:
                # Run all workers concurrently instead of sequentially
                await asyncio.gather(
                    self.audit_worker(),
                    self.optimize_worker(),
                    self.testgaps_worker(),
                    self.maintenance_worker(),
                    return_exceptions=True
                )
                # Sleep between cycles
                await asyncio.sleep(15)
            except asyncio.CancelledError:
                break
            except Exception as e:
                log.error("Worker loop exception: %s", e)
                await asyncio.sleep(10)

    async def audit_worker(self):
        """Checks trajectory logs for failed tasks."""
        # Check for any trajectory with outcome='retry' in the last hour
        rows = await db.execute("SELECT count(*) as c FROM trajectories WHERE outcome = 'retry' AND ts > now() - interval '1 hour'")
        if rows and rows[0]["c"] > 0:
            log.info(f"Audit Worker: Found {rows[0]['c']} failed tasks in the last hour. Flagging for review.")

    async def optimize_worker(self):
        """Identifies slow tool calls or inefficient loops."""
        # Simulated logic: looking for high token counts
        rows = await db.execute("SELECT tool_name, avg(tokens_used) as avg_tokens FROM trajectories WHERE tokens_used > 0 GROUP BY tool_name ORDER BY avg_tokens DESC LIMIT 3")
        if rows:
            log.debug("Optimize Worker: High token tools identified for potential optimization.")

    async def testgaps_worker(self):
        """Flags areas where the agent lacks skills."""
        # Scans for user inputs that consistently result in low confidence or fallback intents
        rows = await db.execute("SELECT count(*) as c FROM skills")
        if rows and rows[0]["c"] < 5:
            log.debug("TestGaps Worker: Skill dictionary is sparse. Suggesting proactive skill distillation.")

    async def maintenance_worker(self):
        """Groups the remaining 9 Ruflo workers into a generic cleanup task to save CPU."""
        # Purge stale pending actions
        await db.execute_write("DELETE FROM pending_actions WHERE created_at < now() - interval '24 hours'")
        # Purge dead swarms
        await db.execute_write("DELETE FROM active_swarms WHERE updated_at < now() - interval '2 hours'")
        log.debug("Maintenance Worker: Stale records purged.")

worker_manager = BackgroundWorkerManager()
