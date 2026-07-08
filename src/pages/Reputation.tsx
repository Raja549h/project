import { useReputationStore } from '@/stores/useReputationStore';
import { chatCompletion } from '@/lib/ai';
import { useState } from 'react';
import { ShieldCheck, Plus, Sparkles } from 'lucide-react';

export default function Reputation() {
  const { history, addScore, getOverall, getCurrent } = useReputationStore();
  const [reliability, setReliability] = useState(50);
  const [trust, setTrust] = useState(50);
  const [accountability, setAccountability] = useState(50);
  const [consistency, setConsistency] = useState(50);
  const [aiStrategy, setAiStrategy] = useState('');
  const [loading, setLoading] = useState(false);
  const overall = getOverall();
  const current = getCurrent();

  const handleAdd = () => {
    addScore({
      reliability, trust, accountability, consistency,
      date: new Date().toISOString().split('T')[0],
    });
  };

  const getAiStrategy = async () => {
    if (history.length === 0) return;
    setLoading(true);
    try {
      const prompt = `Based on my current reputation and character scores:
- Overall Reputation: ${overall}/100
- Reliability: ${current.reliability}/100
- Trust: ${current.trust}/100
- Accountability: ${current.accountability}/100
- Consistency: ${current.consistency}/100

Give me 3 strict, actionable strategies to build a stronger reputation and character.`;
      
      const res = await chatCompletion([
        { role: 'system', content: 'You are an elite reputation and networking coach. Be direct, actionable, and specific.' },
        { role: 'user', content: prompt }
      ], { maxTokens: 400 });
      setAiStrategy(res);
    } catch {
      setAiStrategy('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-2">
        <ShieldCheck className="text-xp" size={24} />
        <h1 className="text-2xl font-bold">Reputation Engine</h1>
      </div>

      <div className="grid grid-cols-5 gap-3">
        <div className="bg-card p-4 rounded-xl border border-border text-center col-span-1">
          <p className="text-xs text-gray-400">Overall</p>
          <p className="text-2xl font-bold text-xp">{overall}</p>
        </div>
        {[
          { label: 'Reliability', value: current.reliability, color: 'text-business' },
          { label: 'Trust', value: current.trust, color: 'text-deep' },
          { label: 'Accountability', value: current.accountability, color: 'text-intelligence' },
          { label: 'Consistency', value: current.consistency, color: 'text-fitness' },
        ].map(s => (
          <div key={s.label} className="bg-card p-4 rounded-xl border border-border text-center">
            <p className="text-xs text-gray-400">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-card p-4 rounded-xl border border-border">
        <h2 className="text-sm font-semibold text-gray-300 mb-3">Update Scores</h2>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Reliability', value: reliability, set: setReliability },
            { label: 'Trust', value: trust, set: setTrust },
            { label: 'Accountability', value: accountability, set: setAccountability },
            { label: 'Consistency', value: consistency, set: setConsistency },
          ].map(s => (
            <div key={s.label}>
              <p className="text-xs text-gray-400 mb-1">{s.label}</p>
              <input type="number" value={s.value} onChange={e => s.set(Number(e.target.value))} className="w-full bg-surface border border-border rounded-lg p-2 text-sm" min={0} max={100} />
            </div>
          ))}
        </div>
        <button onClick={handleAdd} className="mt-3 px-4 py-2 bg-xp/20 text-xp rounded-lg text-sm hover:bg-xp/30">
          <Plus size={16} className="inline mr-1" /> Log Today's Scores
        </button>
      </div>

      {history.length > 0 && (
        <div className="bg-card p-4 rounded-xl border border-border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-300">AI Reputation Strategy</h2>
            <button onClick={getAiStrategy} disabled={loading} className="text-xs px-2 py-1 bg-intelligence/20 text-intelligence rounded-lg">
              <Sparkles size={12} className="inline mr-1" />{loading ? 'Strategizing...' : 'Get Strategy'}
            </button>
          </div>
          {loading ? (
            <p className="text-sm text-gray-400 animate-pulse">Generating your reputation strategy...</p>
          ) : aiStrategy ? (
            <p className="text-sm text-gray-400 whitespace-pre-wrap">{aiStrategy}</p>
          ) : (
            <p className="text-sm text-gray-500">Click the button to get AI-powered networking and character-building advice.</p>
          )}
        </div>
      )}

      {history.length > 0 && (
        <div className="bg-card p-4 rounded-xl border border-border">
          <h2 className="text-sm font-semibold text-gray-300 mb-3">History</h2>
          <div className="space-y-1">
            {[...history].reverse().slice(0, 10).map(h => (
              <div key={h.date} className="flex justify-between text-sm p-2 bg-surface rounded-lg">
                <span className="text-gray-300">{h.date}</span>
                <div className="text-gray-400 space-x-2">
                  <span className="text-business">R:{h.reliability}</span>
                  <span className="text-deep">T:{h.trust}</span>
                  <span className="text-intelligence">A:{h.accountability}</span>
                  <span className="text-fitness">C:{h.consistency}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
