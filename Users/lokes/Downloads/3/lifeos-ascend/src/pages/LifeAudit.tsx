import { useLifeAuditStore } from '@/stores/useLifeAuditStore';
import { chatCompletion } from '@/lib/ai';
import { useState } from 'react';
import { FileText, Plus, Sparkles } from 'lucide-react';

export default function LifeAudit() {
  const { timeLogs, addTimeLog, getEfficiencyScore, getLifeROI, getWeeklyReport } = useLifeAuditStore();
  const hasKey = true;
  const [productive, setProductive] = useState(6);
  const [wasted, setWasted] = useState(2);
  const [energy, setEnergy] = useState(7);
  const [recommendation, setRecommendation] = useState('');
  const [loading, setLoading] = useState(false);
  const efficiency = getEfficiencyScore();
  const lifeROI = getLifeROI();
  const weekly = getWeeklyReport();

  const handleLog = () => {
    addTimeLog({
      date: new Date().toISOString().split('T')[0],
      productiveHours: productive,
      wastedHours: wasted,
      energyLevel: energy,
    });
  };

  const generateRecommendation = async () => {
    setLoading(true);
    try {
      const prompt = `Based on this life audit data:
- Efficiency: ${efficiency}%
- Life ROI: ${lifeROI}/100
- Weekly productive hours: ${weekly.productive.toFixed(1)}h
- Weekly wasted hours: ${weekly.wasted.toFixed(1)}h
- Weekly efficiency: ${weekly.efficiency}%

Give 2-3 specific, actionable recommendations to improve efficiency and reduce wasted time. Keep it concise.`;
      const res = await chatCompletion([
        { role: 'system', content: 'You are a productivity auditor. Give concise, actionable advice.' },
        { role: 'user', content: prompt },
      ], { maxTokens: 300 });
      setRecommendation(res);
    } catch {
      setRecommendation('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-2">
        <FileText className="text-xp" size={24} />
        <h1 className="text-2xl font-bold">Life Audit Engine</h1>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card p-4 rounded-xl border border-border text-center">
          <p className="text-xs text-gray-400">Efficiency Score</p>
          <p className="text-2xl font-bold text-business">{efficiency}%</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border text-center">
          <p className="text-xs text-gray-400">Life ROI</p>
          <p className="text-2xl font-bold text-deep">{lifeROI}</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border text-center">
          <p className="text-xs text-gray-400">Days Logged</p>
          <p className="text-2xl font-bold text-xp">{timeLogs.length}</p>
        </div>
      </div>

      {timeLogs.length > 0 && (
        <div className="bg-card p-4 rounded-xl border border-border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-300">Weekly Report</h2>
            {hasKey && (
              <button onClick={generateRecommendation} disabled={loading} className="text-xs px-2 py-1 bg-intelligence/20 text-intelligence rounded-lg">
                <Sparkles size={12} className="inline mr-1" />AI Recommendations
              </button>
            )}
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm mb-3">
            <div><span className="text-gray-400">Productive Hours</span><p className="font-semibold text-business">{weekly.productive.toFixed(1)}h</p></div>
            <div><span className="text-gray-400">Wasted Hours</span><p className="font-semibold text-fitness">{weekly.wasted.toFixed(1)}h</p></div>
            <div><span className="text-gray-400">Efficiency</span><p className="font-semibold text-xp">{weekly.efficiency}%</p></div>
          </div>
          {loading && <p className="text-sm text-gray-400 animate-pulse">Analyzing your data...</p>}
          {recommendation && (
            <div className="bg-surface p-3 rounded-lg text-sm text-gray-400">
              <p className="text-intelligence font-medium mb-1">AI Recommendations:</p>
              <p className="whitespace-pre-wrap">{recommendation}</p>
            </div>
          )}
        </div>
      )}

      <div className="bg-card p-4 rounded-xl border border-border">
        <h2 className="text-sm font-semibold text-gray-300 mb-3">Log Today's Time</h2>
        <div className="flex gap-3 items-end flex-wrap">
          <div>
            <p className="text-xs text-gray-400 mb-1">Productive Hours</p>
            <input type="number" value={productive} onChange={e => setProductive(Number(e.target.value))} className="w-24 bg-surface border border-border rounded-lg p-2 text-sm" min={0} max={24} />
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Wasted Hours</p>
            <input type="number" value={wasted} onChange={e => setWasted(Number(e.target.value))} className="w-24 bg-surface border border-border rounded-lg p-2 text-sm" min={0} max={24} />
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Energy Level (1-10)</p>
            <input type="number" value={energy} onChange={e => setEnergy(Number(e.target.value))} className="w-24 bg-surface border border-border rounded-lg p-2 text-sm" min={1} max={10} />
          </div>
          <button onClick={handleLog} className="p-2 bg-xp/20 text-xp rounded-lg hover:bg-xp/30">
            <Plus size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
