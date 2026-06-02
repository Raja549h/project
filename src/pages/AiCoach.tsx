import { useAiCoachStore, type Message } from '@/stores/useAiCoachStore';
import { useAiConfigStore } from '@/stores/useAiConfigStore';
import { chatCompletion, hasValidKey } from '@/lib/ai';
import { useState, useRef, useEffect } from 'react';
import { Send, Bot, Trash2, Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const COACH_MODES = ['Coach', 'Planner', 'Motivator', 'Analyst'] as const;

const SYSTEM_PROMPTS: Record<string, string> = {
  Coach: `You are a life coach for LifeOS ASCEND, a gamified life management system. Help the user improve their habits, productivity, and life score. Be practical, encouraging, and specific. Keep responses concise (2-4 sentences).`,
  Planner: `You are a productivity planner for LifeOS ASCEND. Create actionable daily/weekly plans based on the user's goals and current stats. Be specific with time blocks and priorities. Keep responses concise.`,
  Motivator: `You are a high-energy motivation coach. Inspire the user to take action, maintain streaks, and push through resistance. Use occasional emojis. Keep responses punchy and powerful.`,
  Analyst: `You are a data analyst for LifeOS ASCEND. Analyze the user's stats, identify patterns, and suggest data-driven improvements. Be objective and specific. Keep responses concise.`,
};

export default function AiCoach() {
  const { messages, mode, addMessage, setMode, clearConversation } = useAiCoachStore();
  const hasKey = hasValidKey();
  const apiKey = useAiConfigStore(s => s.apiKey);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    if (!hasKey) {
      navigate('/settings');
      return;
    }

    const userMsg = input.trim();
    setInput('');
    addMessage('user', userMsg);
    setLoading(true);

    try {
      const systemPrompt = SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.Coach;
      const conversation = [
        { role: 'system' as const, content: systemPrompt },
        ...messages.slice(-10).map(m => ({ role: m.role === 'coach' ? 'assistant' as const : 'user' as const, content: m.content })),
        { role: 'user' as const, content: userMsg },
      ];
      const reply = await chatCompletion(conversation, { maxTokens: 512 });
      addMessage('coach', reply);
    } catch (err: any) {
      addMessage('coach', `Error: ${err.message || 'Failed to get response'}`);
    } finally {
      setLoading(false);
    }
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

      <div className="flex items-center justify-between">
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
        {!apiKey && (
          <button onClick={() => navigate('/settings')} className="text-xs text-fitness flex items-center gap-1">
            <Key size={12} /> API Key Required
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 bg-card rounded-xl border border-border p-4 max-h-[60vh]">
        {messages.map((msg: Message) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-xl text-sm whitespace-pre-wrap ${
              msg.role === 'user'
                ? 'bg-deep/20 text-gray-200'
                : 'bg-surface text-gray-300'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-surface p-3 rounded-xl text-sm text-gray-400">
              <span className="animate-pulse">Thinking...</span>
            </div>
          </div>
        )}
        {messages.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Bot size={40} className="mx-auto mb-2 text-intelligence/40" />
            <p className="text-sm">Ask me anything about your life system</p>
            {!apiKey && (
              <p className="text-xs text-fitness mt-2">Go to Settings to add your Groq API key</p>
            )}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder={apiKey ? 'Ask your coach...' : 'Add API key in Settings first...'}
          disabled={!apiKey}
          className="flex-1 bg-surface border border-border rounded-xl p-3 text-sm outline-none focus:border-intelligence/50 disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="p-3 bg-intelligence/20 text-intelligence rounded-xl hover:bg-intelligence/30 disabled:opacity-40"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
