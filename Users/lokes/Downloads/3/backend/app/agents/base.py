from __future__ import annotations
import logging
import uuid
from typing import Any
from langchain_core.messages import SystemMessage, HumanMessage

log = logging.getLogger(__name__)

class WorkerAgent:
    """Base class for all LifeOS worker agents. Implements the perceive→think→act loop."""

    def __init__(self, agent_id: str | None = None, role: str = "worker", tools: list | None = None):
        self.agent_id = agent_id or f"{role}-{uuid.uuid4().hex[:8]}"
        self.role = role
        self.tools = tools or []
        self.memory: list[dict] = []

    async def execute(self, task: dict, llm, user_context: dict) -> dict:
        """Run the perceive→think→act cognitive loop for a single task."""
        # Build system prompt with role context
        system_prompt = self._build_system_prompt(user_context)
        task_prompt = self._build_task_prompt(task)

        # If we have tools, bind them to LLM and run tool-calling loop
        if self.tools:
            llm_with_tools = llm.bind_tools(self.tools)
            messages = [SystemMessage(content=system_prompt), HumanMessage(content=task_prompt)]
            response = await llm_with_tools.ainvoke(messages)

            # Execute any tool calls
            tool_results = []
            if response.tool_calls:
                for tc in response.tool_calls:
                    tool_fn = next((t for t in self.tools if t.name == tc['name']), None)
                    if tool_fn:
                        try:
                            result = await tool_fn.ainvoke(tc['args'])
                            tool_results.append({'tool': tc['name'], 'args': tc['args'], 'result': str(result)})
                        except Exception as e:
                            tool_results.append({'tool': tc['name'], 'args': tc['args'], 'result': f'Error: {e}'})

            return {
                'agent_id': self.agent_id,
                'role': self.role,
                'thought': response.content or '',
                'tool_calls': tool_results,
                'raw_response': response.content or '',
            }
        else:
            # No tools — just reason
            messages = [SystemMessage(content=system_prompt), HumanMessage(content=task_prompt)]
            response = await llm.ainvoke(messages)
            return {
                'agent_id': self.agent_id,
                'role': self.role,
                'thought': response.content,
                'tool_calls': [],
                'raw_response': response.content,
            }

    def _build_system_prompt(self, user_context: dict) -> str:
        ctx_summary = self._summarize_context(user_context)
        return f"""You are a specialized {self.role} agent in the LifeOS ASCEND system.
You have access to the user's complete life data.

CURRENT USER STATS:
{ctx_summary}

Be specific, actionable, and reference the user's actual numbers. Never be generic."""

    def _build_task_prompt(self, task: dict) -> str:
        return f"""Task: {task.get('description', '')}
Intent: {task.get('intent', 'general')}
Priority: {task.get('priority', 'normal')}

Provide a thorough, data-driven response."""

    def _summarize_context(self, ctx: dict) -> str:
        lines = []
        if 'user' in ctx:
            u = ctx['user']
            lines.append(f"- RPG: Level {u.get('level',1)}, {u.get('xp',0)} XP, Rank {u.get('rank','Beginner')}, Streak {u.get('currentStreak',0)}d")
        if 'fitness' in ctx:
            f = ctx['fitness']
            lines.append(f"- Fitness: {f.get('stepsToday',0)} steps, {f.get('sleepHours',0)}h sleep, {len(f.get('workouts',[]))} workouts")
        if 'jee' in ctx:
            j = ctx['jee']
            total_q = sum(j.get(s,{}).get('questionsSolved',0) for s in ['physics','chemistry','mathematics'])
            lines.append(f"- JEE: {total_q} total questions solved")
        if 'confidence' in ctx:
            c = ctx['confidence']
            analyses = c.get('analyses', [])
            latest = analyses[-1].get('confidenceScore', 0) if analyses else 0
            lines.append(f"- Confidence: {latest}/100 latest score, {len(analyses)} analyses")
        if 'reputation' in ctx:
            r = ctx['reputation']
            history = r.get('history', [])
            if history:
                last = history[-1]
                overall = round((last.get('reliability',0) + last.get('trust',0) + last.get('accountability',0) + last.get('consistency',0)) / 4)
                lines.append(f"- Reputation: {overall}/100 overall")
        if 'habit' in ctx:
            h = ctx['habit']
            habits = h.get('habits', [])
            max_streak = max((hb.get('streak',0) for hb in habits), default=0)
            lines.append(f"- Habits: {len(habits)} tracked, max streak {max_streak}d")
        if 'deepWork' in ctx:
            d = ctx['deepWork']
            sessions = d.get('sessions', [])
            total_h = sum(s.get('duration',0) for s in sessions)
            lines.append(f"- Deep Work: {len(sessions)} sessions, {total_h:.1f}h total")
        if 'boundary' in ctx:
            b = ctx['boundary']
            lines.append(f"- Digital: {len(b.get('focusWindows',[]))} focus windows, {len(b.get('distractionLogs',[]))} distraction logs")
        if 'project' in ctx:
            p = ctx['project']
            projects = p.get('projects', [])
            lines.append(f"- Projects: {len(projects)} total")
        if 'battle' in ctx:
            bt = ctx['battle']
            lines.append(f"- Battle: Boss Lv{bt.get('bossLevel',1)}, HP {bt.get('bossHealth',100)}/{bt.get('maxBossHealth',100)}")
        return '\n'.join(lines) if lines else 'No user data available'
