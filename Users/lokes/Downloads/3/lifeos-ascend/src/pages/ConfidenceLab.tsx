import { useConfidenceStore } from '@/stores/useConfidenceStore';
import { chatCompletion } from '@/lib/ai';
import { useState } from 'react';
import { Video, Upload, TrendingUp, Sparkles } from 'lucide-react';

export default function ConfidenceLab() {
  const { analyses, addAnalysis, getLatestScore, getAverageScore } = useConfidenceStore();
  const [speakingSpeed, setSpeakingSpeed] = useState(140);
  const [fillerWords, setFillerWords] = useState(5);
  const [eyeContact, setEyeContact] = useState(70);
  const [presence, setPresence] = useState(65);
  const [fileName, setFileName] = useState('');
  const [aiFeedback, setAiFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  const confidenceScore = Math.round((eyeContact * 0.3 + presence * 0.3 + Math.max(0, 100 - fillerWords * 5) * 0.2 + Math.max(0, 100 - Math.abs(speakingSpeed - 150) / 2) * 0.2));

  const handleAnalyze = () => {
    addAnalysis({ speakingSpeed, fillerWords, confidenceScore, eyeContact, presence });
    setFileName('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFileName(file.name);
  };

  const getAiFeedback = async () => {
    if (analyses.length === 0) return;
    setLoading(true);
    try {
      const latest = analyses[analyses.length - 1];
      const prompt = `Based on my latest public speaking metrics:
- Confidence Score: ${latest.confidenceScore}/100
- Speaking Speed: ${latest.speakingSpeed} wpm (ideal is ~150)
- Filler Words: ${latest.fillerWords}
- Eye Contact: ${latest.eyeContact}%
- Presence: ${latest.presence}%

Give me 3 strict, highly actionable tips to improve my presentation skills.`;
      
      const res = await chatCompletion([
        { role: 'system', content: 'You are an elite public speaking and charisma coach. Be direct, actionable, and specific.' },
        { role: 'user', content: prompt }
      ], { maxTokens: 400 });
      setAiFeedback(res);
    } catch {
      setAiFeedback('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-2">
        <Video className="text-intelligence" size={24} />
        <h1 className="text-2xl font-bold">Confidence Lab</h1>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card p-4 rounded-xl border border-border text-center">
          <p className="text-xs text-gray-400">Latest Score</p>
          <p className="text-2xl font-bold text-intelligence">{getLatestScore()}</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border text-center">
          <p className="text-xs text-gray-400">Average Score</p>
          <p className="text-2xl font-bold text-deep">{getAverageScore()}</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border text-center">
          <p className="text-xs text-gray-400">Analyses Done</p>
          <p className="text-2xl font-bold text-xp">{analyses.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card p-4 rounded-xl border border-border">
          <h2 className="text-sm font-semibold text-gray-300 mb-3">Upload Recording</h2>
          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-intelligence/30 transition-colors cursor-pointer">
            <input type="file" accept="audio/*,video/*" onChange={handleFileChange} className="hidden" id="file-upload" />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload size={32} className="mx-auto mb-2 text-gray-500" />
              <p className="text-sm text-gray-400">{fileName || 'Click to upload audio/video'}</p>
            </label>
          </div>
        </div>

        <div className="bg-card p-4 rounded-xl border border-border">
          <h2 className="text-sm font-semibold text-gray-300 mb-3">Mock Analysis</h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-400 mb-1">Speaking Speed (words/min)</p>
              <input type="range" min={80} max={250} value={speakingSpeed} onChange={e => setSpeakingSpeed(Number(e.target.value))} className="w-full accent-intelligence" />
              <span className="text-xs text-gray-500">{speakingSpeed} wpm</span>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Filler Words</p>
              <input type="range" min={0} max={30} value={fillerWords} onChange={e => setFillerWords(Number(e.target.value))} className="w-full accent-intelligence" />
              <span className="text-xs text-gray-500">{fillerWords} words</span>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Eye Contact (%)</p>
              <input type="range" min={0} max={100} value={eyeContact} onChange={e => setEyeContact(Number(e.target.value))} className="w-full accent-intelligence" />
              <span className="text-xs text-gray-500">{eyeContact}%</span>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Presence (%)</p>
              <input type="range" min={0} max={100} value={presence} onChange={e => setPresence(Number(e.target.value))} className="w-full accent-intelligence" />
              <span className="text-xs text-gray-500">{presence}%</span>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400">Estimated Confidence: <span className="font-semibold text-intelligence">{confidenceScore}/100</span></p>
            </div>
            <button onClick={handleAnalyze} className="w-full p-2 bg-intelligence/20 text-intelligence rounded-lg hover:bg-intelligence/30">
              <TrendingUp size={16} className="inline mr-1" /> Save Analysis
            </button>
          </div>
        </div>
      </div>

      {analyses.length > 0 && (
        <div className="bg-card p-4 rounded-xl border border-border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-300">AI Feedback</h2>
            <button onClick={getAiFeedback} disabled={loading} className="text-xs px-2 py-1 bg-intelligence/20 text-intelligence rounded-lg">
              <Sparkles size={12} className="inline mr-1" />{loading ? 'Analyzing...' : 'Get AI Feedback'}
            </button>
          </div>
          {loading ? (
            <p className="text-sm text-gray-400 animate-pulse">Analyzing your charisma metrics...</p>
          ) : aiFeedback ? (
            <p className="text-sm text-gray-400 whitespace-pre-wrap">{aiFeedback}</p>
          ) : (
            <p className="text-sm text-gray-500">Click the button to get AI-powered public speaking advice based on your latest analysis.</p>
          )}
        </div>
      )}

      {analyses.length > 0 && (
        <div className="bg-card p-4 rounded-xl border border-border">
          <h2 className="text-sm font-semibold text-gray-300 mb-3">Analysis History</h2>
          <div className="space-y-1">
            {[...analyses].reverse().map((a, i) => (
              <div key={i} className="flex justify-between text-sm p-2 bg-surface rounded-lg">
                <span className="text-gray-300">{a.date}</span>
                <div className="text-gray-400 space-x-2">
                  <span className="text-intelligence">Score: {a.confidenceScore}</span>
                  <span>{a.speakingSpeed}wpm</span>
                  <span>{a.fillerWords} fillers</span>
                  <span>Eye: {a.eyeContact}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
