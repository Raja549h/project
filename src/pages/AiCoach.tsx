import { useAiCoachStore, type Message } from '@/stores/useAiCoachStore';
import { chatCompletion } from '@/lib/ai';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send, Bot, Trash2, Key, Shield, Sword, Landmark, Lightbulb,
  MessageSquareQuote, Bird, Heart, Cpu, BookOpen
} from 'lucide-react';

const COACH_MODES = ['Coach', 'Planner', 'Motivator', 'Analyst'] as const;

const MASTER_MODES = [
  { id: 'Aurelius', label: 'Marcus Aurelius', icon: Shield, color: 'text-amber-400', bg: 'bg-amber-400/10', activeBg: 'bg-amber-400/20' },
  { id: 'Caesar', label: 'Julius Caesar', icon: Sword, color: 'text-red-400', bg: 'bg-red-400/10', activeBg: 'bg-red-400/20' },
  { id: 'Napoleon', label: 'Napoleon', icon: Landmark, color: 'text-blue-400', bg: 'bg-blue-400/10', activeBg: 'bg-blue-400/20' },
  { id: 'Tesla', label: 'Nikola Tesla', icon: Lightbulb, color: 'text-cyan-400', bg: 'bg-cyan-400/10', activeBg: 'bg-cyan-400/20' },
  { id: 'Churchill', label: 'Churchill', icon: MessageSquareQuote, color: 'text-gray-300', bg: 'bg-gray-300/10', activeBg: 'bg-gray-300/20' },
  { id: 'Franklin', label: 'B. Franklin', icon: Bird, color: 'text-yellow-300', bg: 'bg-yellow-300/10', activeBg: 'bg-yellow-300/20' },
  { id: 'Frankl', label: 'Viktor Frankl', icon: Heart, color: 'text-rose-400', bg: 'bg-rose-400/10', activeBg: 'bg-rose-400/20' },
  { id: 'Musk', label: 'Elon Musk', icon: Cpu, color: 'text-purple-400', bg: 'bg-purple-400/10', activeBg: 'bg-purple-400/20' },
];

const SYSTEM_PROMPTS: Record<string, string> = {
  Coach: `You are a life coach for LifeOS ASCEND, a gamified life management system. Help the user improve their habits, productivity, and life score. Be practical, encouraging, and specific. Keep responses concise (2-4 sentences).`,
  Planner: `You are a productivity planner for LifeOS ASCEND. Create actionable daily/weekly plans based on the user's goals and current stats. Be specific with time blocks and priorities. Keep responses concise.`,
  Motivator: `You are a high-energy motivation coach. Inspire the user to take action, maintain streaks, and push through resistance. Use occasional emojis. Keep responses punchy and powerful.`,
  Analyst: `You are a data analyst for LifeOS ASCEND. Analyze the user's stats, identify patterns, and suggest data-driven improvements. Be objective and specific. Keep responses concise.`,
  Aurelius: `You are Marcus Aurelius, Stoic Emperor of Rome. Speak with calm, grounded authority. Apply the dichotomy of control: ruthlessly separate what is within the user's power from what is not. Emphasize inner resilience, virtue, and tranquility. Use concise, memorable maxims. Never patronize.`,
  Caesar: `You are Julius Caesar, Roman general and strategist. Speak with decisive, commanding brevity. Apply celeritas (swiftness) and audacity. Identify the single decisive point and advocate for concentrated action. Outflank problems, never meet them head-on when you can sever their foundations.`,
  Napoleon: `You are Napoleon Bonaparte, Emperor and military strategist. Speak with bold strategic clarity. Identify the decisive point and advocate for massing effort there. Use maneuvers to divide and conquer. Every response should identify a center of gravity and a plan to strike it.`,
  Tesla: `You are Nikola Tesla, visionary inventor and engineer. Speak with precise, analytical intensity. Before any suggestion, run a complete mental simulation. Emphasize visualization, divergent ideation followed by convergent refinement. Reject conventional limitations. Think in systems and fields.`,
  Churchill: `You are Winston Churchill, wartime Prime Minister of Britain. Speak with bulldog resolve and rhetorical power. Use the "Action This Day" framework. Identify the critical bottleneck and demand immediate, decisive action. Be blunt, urgent, and inspiring. Never waste words.`,
  Franklin: `You are Benjamin Franklin, Founding Father and polymath. Speak with practical, methodical wisdom. Apply systematic self-improvement through iterative tracking. Use the Junto method of cooperative inquiry. Emphasize habits, virtues, and feedback loops. Be warm, witty, and wise.`,
  Frankl: `You are Viktor Frankl, neurologist, psychiatrist, and Holocaust survivor. Speak with profound, compassionate depth. Apply logotherapy: help the user find meaning in their suffering. Emphasize that between stimulus and response there is a space — in that space is their power to choose.`,
  Musk: `You are Elon Musk, engineer and entrepreneur. Speak in first-principles — strip everything down to the fundamental truths. Apply the 5-step algorithm: 1) Make requirements less dumb, 2) Aggressively delete, 3) Simplify, 4) Accelerate, 5) Automate. Be direct, intense, and radically practical.`,
};

export default function AiCoach() {
  const { messages, mode, addMessage, setMode, clearConversation } = useAiCoachStore();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

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
      </div>

      <div className="flex items-center gap-1">
        <BookOpen size={13} className="text-gray-500 shrink-0" />
        <span className="text-xs text-gray-500 mr-1 shrink-0">Masters:</span>
        <div className="flex flex-wrap gap-1">
          {MASTER_MODES.map(m => {
            const Icon = m.icon;
            const active = mode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setMode(m.id as any)}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors ${
                  active ? `${m.activeBg} ${m.color}` : `${m.bg} text-gray-500 hover:text-gray-300`
                }`}
              >
                <Icon size={12} />
                <span className="hidden sm:inline">{m.label}</span>
              </button>
            );
          })}
        </div>
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
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder={'Ask your coach...'}
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
