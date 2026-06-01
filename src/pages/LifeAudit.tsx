import { useLifeAuditStore } from '@/stores/useLifeAuditStore';
import { useState } from 'react';
import { FileText, Plus } from 'lucide-react';

export default function LifeAudit() {
  const { timeLogs, addTimeLog, getEfficiencyScore, getLifeROI, getWeeklyReport } = useLifeAuditStore();
  const [productive, setProductive] = useState(6);
  const [wasted, setWasted] = useState(2);
  const [energy, setEnergy] = useState(7);
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
          <h2 className="text-sm font-semibold text-gray-300 mb-3">Weekly Report</h2>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div><span className="text-gray-400">Productive Hours</span><p className="font-semibold text-business">{weekly.productive.toFixed(1)}h</p></div>
            <div><span className="text-gray-400">Wasted Hours</span><p className="font-semibold text-fitness">{weekly.wasted.toFixed(1)}h</p></div>
            <div><span className="text-gray-400">Efficiency</span><p className="font-semibold text-xp">{weekly.efficiency}%</p></div>
          </div>
        </div>
      )}

      <div className="bg-card p-4 rounded-xl border border-border">
        <h2 className="text-sm font-semibold text-gray-300 mb-3">Log Today's Time</h2>
        <div className="flex gap-3 items-end">
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

      {timeLogs.length > 0 && (
        <div className="bg-card p-4 rounded-xl border border-border">
          <h2 className="text-sm font-semibold text-gray-300 mb-3">Recent Logs</h2>
          <div className="space-y-1">
            {[...timeLogs].reverse().slice(0, 10).map(log => (
              <div key={log.date} className="flex justify-between text-sm p-2 bg-surface rounded-lg">
                <span className="text-gray-300">{log.date}</span>
                <div className="text-gray-400">
                  <span className="text-business">{log.productiveHours}h productive</span>
                  {' | '}
                  <span className="text-fitness">{log.wastedHours}h wasted</span>
                  {' | '}
                  <span>Energy: {log.energyLevel}/10</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
