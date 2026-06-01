import { useAiCoachStore, type Message } from '@/stores/useAiCoachStore';
import { useUserStore } from '@/stores/useUserStore';
import { useHabitStore } from '@/stores/useHabitStore';
import { useDeepWorkStore } from '@/stores/useDeepWorkStore';
import { useState, useRef, useEffect } from 'react';
import { Send, Bot, Trash2 } from 'lucide-react';

const COACH_MODES = ['Coach', 'Planner', 'Motivator', 'Analyst'] as const;

function generateResponse(userMessage: string, mode: string): string {
  const { level, xp, lifeScore, currentStreak } = useUserStore.getState();
  const habits = useHabitStore.getState().habits;
  const dwSessions = useDeepWorkStore.getState().sessions;

  const templates: Record<string, string[]> = {
    Coach: [
      `Based on your stats (Level ${level}, ${xp} XP), I recommend focusing on your habits. You have ${habits.length} habits set up. Try to maintain your ${currentStreak}-day streak.`,
      `Great progress! Your life score is ${lifeScore}/100. To improve, consider adding more deep work sessions. You've done ${dwSessions.length} sessions total.`,
      `I notice you're level ${level}. The next milestone is level ${level + 1}. Stay consistent with your daily habits.`,
    ],
    Planner: [
      `Here's your suggested plan: 1) Morning habits (30min), 2) Deep work session (1hr), 3) Study session (2hrs), 4) Workout (30min), 5) Evening review (15min).`,
      `For this week: Focus on building a consistent sleep schedule, complete all daily habits, and aim for 5 deep work sessions.`,
      `Monthly suggestion: Increase your study hours gradually. Focus on your weak topics in JEE prep.`,
    ],
    Motivator: [
      `You're doing amazing! Level ${level} with ${xp} XP shows real dedication. Keep pushing forward! 🔥`,
      `Remember why you started. Every habit completed, every question solved brings you closer to your goals.`,
      `A ${currentStreak}-day streak is impressive! Imagine where you'll be in 30 days if you keep this up.`,
    ],
    Analyst: [
      `Analysis: Your habit completion affects your life score. Deep work sessions correlate with XP growth. Focus on consistency.`,
      `Looking at your data: ${habits.filter(h => h.completedDates.includes(new Date().toISOString().split('T')[0])).length}/${habits.length} habits done today. ${dwSessions.length} total deep work sessions.`,
      `Trend: ${currentStreak > 0 ? 'Positive - you are on a streak' : 'Room for improvement - start a new streak today'}. Life score: ${lifeScore}/100.`,
    ],
  };

  const modeTemplates = templates[mode] || templates.Coach;
  return modeTemplates[Math.floor(Math.random() * modeTemplates.length)];
}

export default function AiCoach() {
  const { messages, mode, addMessage, setMode, clearConversation } = useAiCoachStore();
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    addMessage('user', input.trim());
    setTimeout(() => {
      const response = generateResponse(input.trim(), mode);
      addMessage('coach', response);
    }, 500);
    setInput('');
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="text-intelligence" size={24} />
          <h1 className="text-2xl font-bold">AI Coach</h1>
        </div>
        <button onClick={clearConversation} className="text-xs text-gray-500 hover:text-fitness flex items-center gap-1">
          <Trash2 size={14} /> Clear
        </button>
      </div>

      <div className="flex gap-2">
        {COACH_MODES.map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              mode === m ? 'bg-intelligence/20 text-intelligence' : 'bg-surface text-gray-400 hover:text-gray-300'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 bg-card rounded-xl border border-border p-4 max-h-[60vh]">
        {messages.map((msg: Message) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-xl text-sm ${
              msg.role === 'user'
                ? 'bg-deep/20 text-gray-200'
                : 'bg-surface text-gray-300'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Bot size={40} className="mx-auto mb-2 text-intelligence/40" />
            <p className="text-sm">Ask me anything about your life system</p>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Ask your coach..."
          className="flex-1 bg-surface border border-border rounded-xl p-3 text-sm outline-none focus:border-intelligence/50"
        />
        <button onClick={handleSend} className="p-3 bg-intelligence/20 text-intelligence rounded-xl hover:bg-intelligence/30">
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
