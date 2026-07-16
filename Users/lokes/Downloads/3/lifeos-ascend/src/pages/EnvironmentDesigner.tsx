import { useEnvironmentStore } from '@/stores/useEnvironmentStore';
import { chatCompletion } from '@/lib/ai';
import { useState } from 'react';
import { Palette, Upload, Sparkles } from 'lucide-react';

export default function EnvironmentDesigner() {
  const { scores, addScore, getLatest } = useEnvironmentStore();
  const hasKey = true;
  const [focusScore, setFocusScore] = useState(70);
  const [environmentScore, setEnvironmentScore] = useState(65);
  const [sleepScore, setSleepScore] = useState(75);
  const [fileName, setFileName] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [loading, setLoading] = useState(false);
  const latest = getLatest();

  const handleAnalyze = () => {
    addScore({ focusScore, environmentScore, sleepScore });
  };

  const generateRecommendation = async () => {
    setLoading(true);
    try {
      const prompt = `Given environment scores:
- Focus readiness: ${focusScore}/100
- Environment quality: ${environmentScore}/100
- Sleep environment: ${sleepScore}/100

Provide 3 specific, actionable tips to improve the workspace environment for better focus and sleep. Be practical and concise.`;
      const res = await chatCompletion([
        { role: 'system', content: 'You are an environment design consultant. Give practical workspace optimization advice.' },
        { role: 'user', content: prompt },
      ], { maxTokens: 300 });
      setRecommendation(res);
    } catch {
      setRecommendation('');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFileName(e.target.files[0].name);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-2">
        <Palette className="text-xp" size={24} />
        <h1 className="text-2xl font-bold">Environment Designer</h1>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Focus Score', value: latest?.focusScore || 0, color: 'text-deep' },
          { label: 'Environment Score', value: latest?.environmentScore || 0, color: 'text-business' },
          { label: 'Sleep Score', value: latest?.sleepScore || 0, color: 'text-intelligence' },
        ].map(s => (
          <div key={s.label} className="bg-card p-4 rounded-xl border border-border text-center">
            <p className="text-xs text-gray-400">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card p-4 rounded-xl border border-border">
          <h2 className="text-sm font-semibold text-gray-300 mb-3">Upload Environment Photo</h2>
          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-xp/30 transition-colors cursor-pointer">
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="env-upload" />
            <label htmlFor="env-upload" className="cursor-pointer">
              <Upload size={32} className="mx-auto mb-2 text-gray-500" />
              <p className="text-sm text-gray-400">{fileName || 'Click to upload photo'}</p>
            </label>
          </div>
        </div>

        <div className="bg-card p-4 rounded-xl border border-border">
          <h2 className="text-sm font-semibold text-gray-300 mb-3">Score Your Environment</h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-400 mb-1">Focus Readiness</p>
              <input type="range" min={0} max={100} value={focusScore} onChange={e => setFocusScore(Number(e.target.value))} className="w-full accent-xp" />
              <span className="text-xs text-gray-500">{focusScore}/100</span>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Environment Quality</p>
              <input type="range" min={0} max={100} value={environmentScore} onChange={e => setEnvironmentScore(Number(e.target.value))} className="w-full accent-xp" />
              <span className="text-xs text-gray-500">{environmentScore}/100</span>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Sleep Environment</p>
              <input type="range" min={0} max={100} value={sleepScore} onChange={e => setSleepScore(Number(e.target.value))} className="w-full accent-xp" />
              <span className="text-xs text-gray-500">{sleepScore}/100</span>
            </div>
            <button onClick={handleAnalyze} className="w-full p-2 bg-xp/20 text-xp rounded-lg hover:bg-xp/30 text-sm">
              Save Scores
            </button>
          </div>
        </div>
      </div>

      <div className="bg-card p-4 rounded-xl border border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-300">Recommendations</h2>
          {hasKey && (
            <button onClick={generateRecommendation} disabled={loading} className="text-xs px-2 py-1 bg-intelligence/20 text-intelligence rounded-lg">
              <Sparkles size={12} className="inline mr-1" />{loading ? 'Generating...' : 'AI Suggestions'}
            </button>
          )}
        </div>
        {loading ? (
          <p className="text-sm text-gray-400 animate-pulse">Analyzing your environment...</p>
        ) : recommendation ? (
          <p className="text-sm text-gray-400 whitespace-pre-wrap">{recommendation}</p>
        ) : scores.length > 0 && !hasKey ? (
          <p className="text-sm text-gray-500">Add your Groq API key in Settings for AI-powered recommendations.</p>
        ) : (
          <p className="text-sm text-gray-500">Save your scores above to see recommendations.</p>
        )}
      </div>
    </div>
  );
}
