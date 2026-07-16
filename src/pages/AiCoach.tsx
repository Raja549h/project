import { useAiCoachStore, type Message } from '@/stores/useAiCoachStore';
import { useUserStore } from '@/stores/useUserStore';
import { useBattleStore } from '@/stores/useBattleStore';
import { useConfidenceStore } from '@/stores/useConfidenceStore';
import { useDeepWorkStore } from '@/stores/useDeepWorkStore';
import { useEnvironmentStore } from '@/stores/useEnvironmentStore';
import { useFitnessStore } from '@/stores/useFitnessStore';
import { useHabitStore } from '@/stores/useHabitStore';
import { useJeeStore } from '@/stores/useJeeStore';
import { useLifeAuditStore } from '@/stores/useLifeAuditStore';
import { useProjectStore } from '@/stores/useProjectStore';
import { useReputationStore } from '@/stores/useReputationStore';
import { useBoundaryStore } from '@/stores/useBoundaryStore';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send, Bot, Trash2, Key, Shield, Sword, Landmark, Lightbulb,
  MessageSquareQuote, Bird, Heart, Cpu, BookOpen
} from 'lucide-react';
import { useAgentStream } from '@/hooks/useAgentStream';
import { AgentObservability } from '@/components/aicoach/AgentObservability';
import { AgentNetworkGraph } from '@/components/aicoach/AgentNetworkGraph';
import { InterAgentChat } from '@/components/aicoach/InterAgentChat';

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
  Coach: `You are the ultimate UHM-OS Master Coach for the LifeOS ASCEND gamified life management system. You have access to the user's complete life data context. Analyze their question, current weaknesses, and stats. Then, dynamically adopt the psychology of the most appropriate Master (Aurelius for resilience, Napoleon for strategy, Tesla for innovation, etc.) to frame your response. Explicitly state whose psychology you are channeling. Provide deeply personalized, actionable advice based on their live stats.`,
  Planner: `You are a strict, hyper-efficient productivity planner. Use the user's Life Audit, Deep Work, and Digital Boundary stats to create actionable, time-blocked daily/weekly plans. Be specific with priorities.`,
  Motivator: `You are a high-energy, ruthless motivation coach. Analyze the user's Habits, Streaks, and Fitness stats. Inspire them to push through resistance. Use occasional emojis. Keep it punchy and powerful.`,
  Analyst: `You are a cold, calculated data analyst. Analyze the user's JEE accuracy, Life ROI, Reputation, and Confidence scores. Identify hidden patterns, bottlenecks, and mathematical improvements. Be objective.`,
  Aurelius: `You are Marcus Aurelius. Speak with stoic, calm authority. Apply the dichotomy of control to the user's stats: ruthlessly separate what is within their power (habits, focus) from what is not. Emphasize inner resilience.`,
  Caesar: `You are Julius Caesar. Speak with decisive, commanding brevity. Identify the single decisive point in the user's life stats and advocate for concentrated action and celeritas (swiftness). Outflank problems.`,
  Napoleon: `You are Napoleon Bonaparte. Speak with bold strategic clarity. Look at the user's projects and JEE data. Identify the center of gravity and advocate for massing effort there. Use maneuvers to divide and conquer.`,
  Tesla: `You are Nikola Tesla. Speak with precise, analytical intensity. Emphasize visualization, divergent ideation, and systems thinking. Look at the user's deep work and environment stats to optimize their "frequency."`,
  Churchill: `You are Winston Churchill. Speak with bulldog resolve and rhetorical power. Identify the critical bottleneck in their Life Audit and demand "Action This Day." Be blunt, urgent, and inspiring.`,
  Franklin: `You are Benjamin Franklin. Speak with practical, methodical wisdom. Focus on their Habits, Reputation, and daily routines. Emphasize systematic self-improvement and virtues. Be warm, witty, and wise.`,
  Frankl: `You are Viktor Frankl. Speak with profound, compassionate depth. Help the user find meaning in their struggles (e.g., low scores, broken streaks). Emphasize that between stimulus and response, there is choice.`,
  Musk: `You are Elon Musk. Speak in first-principles. Look at their efficiency scores. Apply the 5-step algorithm: 1) Make requirements less dumb, 2) Delete, 3) Simplify, 4) Accelerate, 5) Automate. Be radically practical.`,
};

export default function AiCoach() {
  const { messages, mode, addMessage, setMode, clearConversation } = useAiCoachStore();
  const user = useUserStore();
  const battle = useBattleStore();
  const confidence = useConfidenceStore();
  const deepWork = useDeepWorkStore();
  const environment = useEnvironmentStore();
  const fitness = useFitnessStore();
  const habit = useHabitStore();
  const jee = useJeeStore();
  const lifeAudit = useLifeAuditStore();
  const project = useProjectStore();
  const reputation = useReputationStore();
  const boundary = useBoundaryStore();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const { 
    messages: streamMessages, 
    isStreaming, 
    isPaused, 
    pendingActions, 
    graphData,
    internalLogs,
    startStream, 
    approveActions, 
    intervene 
  } = useAgentStream();

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    const userMsg = input.trim();
    setInput('');
    addMessage('user', userMsg);
    
    // Pass 'strict' to trigger human-in-the-loop approvals
    await startStream(userMsg, 'strict');
  };

  // Sync stream messages to local store when done (or just rely on the hook's messages)
  // For this integration, we'll render both the store's history and the active stream.

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
        {graphData && <AgentNetworkGraph data={graphData} onIntervene={intervene} />}
        {internalLogs.length > 0 && <InterAgentChat logs={internalLogs} />}
        
        <AgentObservability 
          isStreaming={isStreaming} 
          isPaused={isPaused} 
          pendingActions={pendingActions}
          onApprove={approveActions}
          onIntervene={intervene}
        />
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
        {streamMessages.map((msg, idx) => (
          <div key={`stream-${idx}`} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-xl text-sm whitespace-pre-wrap ${
              msg.role === 'user'
                ? 'bg-deep/20 text-gray-200'
                : 'bg-surface text-gray-300'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isStreaming && !isPaused && (
          <div className="flex justify-start">
            <div className="bg-surface p-3 rounded-xl text-sm text-gray-400">
              <span className="animate-pulse">Agent Swarm Thinking...</span>
            </div>
          </div>
        )}
        {messages.length === 0 && streamMessages.length === 0 && (
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
          disabled={isStreaming || !input.trim()}
          className="p-3 bg-intelligence/20 text-intelligence rounded-xl hover:bg-intelligence/30 disabled:opacity-40"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
