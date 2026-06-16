import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAiCoachStore } from '@/stores/useAiCoachStore';
import {
  Landmark, Sword, Rocket, Lightbulb, MessageSquareQuote,
  Bird, Heart, Cpu, ArrowRight, ExternalLink, BookOpen,
  Divide, Target, Zap, Shield
} from 'lucide-react';

const MASTERS = [
  {
    id: 'Aurelius',
    name: 'Marcus Aurelius',
    title: 'Stoic Emperor',
    icon: Shield,
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
    border: 'border-amber-400/30',
    desc: 'Dichotomy of control, resilience, and inner tranquility.',
  },
  {
    id: 'Caesar',
    name: 'Julius Caesar',
    title: 'Strategic General',
    icon: Sword,
    color: 'text-red-400',
    bg: 'bg-red-400/10',
    border: 'border-red-400/30',
    desc: 'Celeritas, audacity, and outflanking every obstacle.',
  },
  {
    id: 'Napoleon',
    name: 'Napoleon Bonaparte',
    title: 'Grand Tactician',
    icon: Landmark,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    border: 'border-blue-400/30',
    desc: 'Concentrated force at the decisive point.',
  },
  {
    id: 'Tesla',
    name: 'Nikola Tesla',
    title: 'Master Inventor',
    icon: Lightbulb,
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/10',
    border: 'border-cyan-400/30',
    desc: 'Complete mental simulation before any execution.',
  },
  {
    id: 'Churchill',
    name: 'Winston Churchill',
    title: 'Wartime Leader',
    icon: MessageSquareQuote,
    color: 'text-gray-300',
    bg: 'bg-gray-300/10',
    border: 'border-gray-300/30',
    desc: '"Action This Day" — triage and destroy bottlenecks.',
  },
  {
    id: 'Franklin',
    name: 'Benjamin Franklin',
    title: 'System Builder',
    icon: Bird,
    color: 'text-yellow-300',
    bg: 'bg-yellow-300/10',
    border: 'border-yellow-300/30',
    desc: 'Iterative virtues, feedback loops, and systematic self-correction.',
  },
  {
    id: 'Frankl',
    name: 'Viktor Frankl',
    title: 'Existential Psychiatrist',
    icon: Heart,
    color: 'text-rose-400',
    bg: 'bg-rose-400/10',
    border: 'border-rose-400/30',
    desc: 'Will to meaning — turn suffering into fuel.',
  },
  {
    id: 'Musk',
    name: 'Elon Musk',
    title: 'First-Principles Engineer',
    icon: Rocket,
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
    border: 'border-purple-400/30',
    desc: '5-step design algorithm: delete, simplify, optimize, accelerate, automate.',
  },
];

const TOOLS = [
  {
    id: 'first-principles',
    name: 'First-Principles Engine',
    master: 'Musk',
    icon: Divide,
    desc: 'Apply Musk\'s 5-step algorithm to any problem. Strip assumptions, delete waste, simplify.',
  },
  {
    id: 'dichotomy',
    name: 'Stoic Compass',
    master: 'Aurelius & Frankl',
    icon: Target,
    desc: 'Ruthlessly separate what you control from what you don\'t. Find meaning in the gap.',
  },
  {
    id: 'strategic-triage',
    name: 'Strategic Triage',
    master: 'Churchill',
    icon: Zap,
    desc: '"Action This Day" — identify the critical bottleneck and destroy it with extreme priority.',
  },
  {
    id: 'mental-sim',
    name: 'Mental Simulator',
    master: 'Tesla',
    icon: Cpu,
    desc: 'Run a complete mental simulation. Visualize the system, find latent flaws, iterate in-memory.',
  },
  {
    id: 'maneuver',
    name: 'War Room',
    master: 'Caesar & Napoleon',
    icon: Sword,
    desc: 'Outflank the problem. Concentrate effort at the decisive point. Move with velocity.',
  },
];

function useToolState() {
  const [problem, setProblem] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  return { problem, setProblem, result, setResult, running, setRunning };
}

function FirstPrinciplesTool() {
  const { problem, setProblem, result, setResult, running, setRunning } = useToolState();

  const run = () => {
    if (!problem.trim()) return;
    setRunning(true);
    const p = problem.trim();
    const output = [
      `═══ FIRST-PRINCIPLES DECONSTRUCTION ═══`,
      `Problem: "${p}"`,
      ``,
      `STEP 1 — Make Requirements Less Dumb`,
      `Q: Who said this was required? What assumptions are baked in?`,
      `→ Challenge every stated requirement. Ask "why?" 5 times.`,
      ``,
      `STEP 2 — Aggressively Delete`,
      `Q: If I removed this entirely, what breaks?`,
      `→ Aim to delete until you MUST add back at least 10%.`,
      ``,
      `STEP 3 — Simplify & Optimize`,
      `Q: What remains after deletion? Can it be simpler?`,
      `→ Optimize what survives, not what was there before.`,
      ``,
      `STEP 4 — Accelerate Cycle Time`,
      `Q: Can we iterate faster? What's the feedback loop?`,
      `→ Speed up the loop, not the individual steps.`,
      ``,
      `STEP 5 — Automate`,
      `Q: Once stable, what can run without humans?`,
      `→ Only now consider automation. Never before step 2.`,
    ].join('\n');
    setResult(output);
    setRunning(false);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Divide size={18} className="text-purple-400" />
        <h3 className="font-semibold">First-Principles Engine</h3>
        <span className="text-xs text-purple-400/60 ml-auto">Musk</span>
      </div>
      <p className="text-xs text-gray-500 mb-3">Describe a problem or system to deconstruct.</p>
      <textarea value={problem} onChange={e => setProblem(e.target.value)} rows={3}
        className="w-full bg-surface border border-border rounded-lg p-3 text-sm outline-none focus:border-purple-400/50 resize-none"
        placeholder="e.g. Our morning routine is too slow..." />
      <button onClick={run} disabled={!problem.trim() || running}
        className="mt-2 px-4 py-2 bg-purple-400/20 text-purple-400 rounded-lg text-sm hover:bg-purple-400/30 disabled:opacity-40 flex items-center gap-2">
        {running ? 'Processing...' : <>Run Algorithm <ArrowRight size={14} /></>}
      </button>
      {result && <pre className="mt-3 text-xs text-gray-400 bg-surface rounded-lg p-3 whitespace-pre-wrap font-mono">{result}</pre>}
    </div>
  );
}

function StoicCompassTool() {
  const { problem, setProblem, result, setResult, running, setRunning } = useToolState();

  const run = () => {
    if (!problem.trim()) return;
    setRunning(true);
    const p = problem.trim();
    const output = [
      `═══ STOIC COMPASS ═══`,
      `Situation: "${p}"`,
      ``,
      `WITHIN MY CONTROL:`,
      `• My judgments about this`,
      `• My choices and actions`,
      `• My attitude and response`,
      `• My effort and focus`,
      ``,
      `OUTSIDE MY CONTROL:`,
      `• Other people's opinions and actions`,
      `• Outcomes and results`,
      `• Timing and luck`,
      `• The past (already determined)`,
      ``,
      `WILL TO MEANING (Frankl):`,
      `Ask yourself: What meaning can I extract from this?`,
      `How does this challenge make me stronger?`,
      `What would the future version of me thank me for enduring?`,
      ``,
      `ACTION: Focus entirely on the "Within My Control" column.`,
      `Release attachment to the rest.`,
    ].join('\n');
    setResult(output);
    setRunning(false);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Target size={18} className="text-amber-400" />
        <h3 className="font-semibold">Stoic Compass</h3>
        <span className="text-xs text-amber-400/60 ml-auto">Aurelius & Frankl</span>
      </div>
      <p className="text-xs text-gray-500 mb-3">Describe a challenge or worry to gain clarity.</p>
      <textarea value={problem} onChange={e => setProblem(e.target.value)} rows={3}
        className="w-full bg-surface border border-border rounded-lg p-3 text-sm outline-none focus:border-amber-400/50 resize-none"
        placeholder="e.g. I'm stressed about my exam results..." />
      <button onClick={run} disabled={!problem.trim() || running}
        className="mt-2 px-4 py-2 bg-amber-400/20 text-amber-400 rounded-lg text-sm hover:bg-amber-400/30 disabled:opacity-40 flex items-center gap-2">
        {running ? 'Processing...' : <>Find Clarity <ArrowRight size={14} /></>}
      </button>
      {result && <pre className="mt-3 text-xs text-gray-400 bg-surface rounded-lg p-3 whitespace-pre-wrap font-mono">{result}</pre>}
    </div>
  );
}

function StrategicTriageTool() {
  const { problem, setProblem, result, setResult, running, setRunning } = useToolState();

  const run = () => {
    if (!problem.trim()) return;
    setRunning(true);
    const p = problem.trim();
    const urgent = p.split(' ').slice(0, 3).join(' ') + '...';
    const output = [
      `═══ STRATEGIC TRIAGE (Action This Day) ═══`,
      `Bottleneck Identified: "${p}"`,
      ``,
      `CRITICAL PRIORITY — Must Act Today:`,
      `1. What single action would reduce the most pressure? → ${urgent}`,
      `2. What is the bottleneck holding everything else back?`,
      `3. What happens if we do nothing for 24 hours?`,
      ``,
      `HIGH PRIORITY — This Week:`,
      `• Break the bottleneck into 3 sub-tasks`,
      `• Assign ownership and a hard deadline`,
      `• Remove all dependencies on others`,
      ``,
      `LOW PRIORITY — Defer or Delete:`,
      `• Anything that doesn't directly impact the mission`,
      `• Meetings without a clear deliverable`,
      `• Perfectionism disguised as diligence`,
      ``,
      `ACTION THIS DAY:`,
      `▶ Do ONE thing RIGHT NOW that moves this forward.`,
      `▶ Put the "Action This Day" label on it. No delays.`,
    ].join('\n');
    setResult(output);
    setRunning(false);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Zap size={18} className="text-gray-300" />
        <h3 className="font-semibold">Strategic Triage</h3>
        <span className="text-xs text-gray-300/60 ml-auto">Churchill</span>
      </div>
      <p className="text-xs text-gray-500 mb-3">Name the bottleneck or blocker you need to destroy.</p>
      <textarea value={problem} onChange={e => setProblem(e.target.value)} rows={3}
        className="w-full bg-surface border border-border rounded-lg p-3 text-sm outline-none focus:border-gray-300/50 resize-none"
        placeholder="e.g. I keep procrastinating on the main project..." />
      <button onClick={run} disabled={!problem.trim() || running}
        className="mt-2 px-4 py-2 bg-gray-300/20 text-gray-300 rounded-lg text-sm hover:bg-gray-300/30 disabled:opacity-40 flex items-center gap-2">
        {running ? 'Processing...' : <>Triage Now <ArrowRight size={14} /></>}
      </button>
      {result && <pre className="mt-3 text-xs text-gray-400 bg-surface rounded-lg p-3 whitespace-pre-wrap font-mono">{result}</pre>}
    </div>
  );
}

export default function Masters() {
  const navigate = useNavigate();
  const setMode = useAiCoachStore(s => s.setMode);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="text-intelligence" size={24} />
          <h1 className="text-2xl font-bold">UHM-OS War Room</h1>
        </div>
      </div>

      <p className="text-sm text-gray-500">
        Eight masters, one unified operating system. Select a persona to consult in{' '}
        <button onClick={() => navigate('/ai-coach')} className="text-intelligence hover:underline">AI Coach</button>,
        or use the strategic tools below.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {MASTERS.map(m => (
          <button
            key={m.id}
            onClick={() => { setMode(m.id as any); navigate('/ai-coach'); }}
            className={`${m.bg} ${m.border} border rounded-xl p-4 text-left hover:scale-[1.02] transition-transform`}
          >
            <div className="flex items-center gap-2 mb-2">
              <m.icon size={18} className={m.color} />
              <span className={`text-xs font-medium ${m.color}`}>{m.title}</span>
            </div>
            <div className="text-sm font-semibold text-gray-200">{m.name}</div>
            <p className="text-xs text-gray-500 mt-1">{m.desc}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FirstPrinciplesTool />
        <StoicCompassTool />
        <StrategicTriageTool />
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquareQuote size={18} className="text-intelligence" />
          <h3 className="font-semibold">Consult Any Master</h3>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Each master is available as a persona in the AI Coach. They bring their full cognitive framework
          to every conversation — no generic advice, only sharp, historically-grounded counsel.
        </p>
        <div className="flex flex-wrap gap-2">
          {MASTERS.map(m => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                onClick={() => { setMode(m.id as any); navigate('/ai-coach'); }}
                className={`${m.bg} ${m.border} border px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 hover:scale-105 transition-transform`}
              >
                <Icon size={12} className={m.color} />
                <span className={m.color}>{m.name}</span>
                <ExternalLink size={10} className="text-gray-500" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
