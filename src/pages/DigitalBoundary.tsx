import { useBoundaryStore } from '@/stores/useBoundaryStore';
import { useState } from 'react';
import { Lock, Plus, Trash2 } from 'lucide-react';

export default function DigitalBoundary() {
  const { focusWindows, distractionLogs, addFocusWindow, removeFocusWindow, logDistraction, getTodayScreenTime, getAttentionSaved } = useBoundaryStore();
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('12:00');
  const [interruptions, setInterruptions] = useState(5);
  const [screenTime, setScreenTime] = useState(120);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-2">
        <Lock className="text-fitness" size={24} />
        <h1 className="text-2xl font-bold">Digital Boundary Manager</h1>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card p-4 rounded-xl border border-border text-center">
          <p className="text-xs text-gray-400">Today's Screen Time</p>
          <p className="text-2xl font-bold text-fitness">{getTodayScreenTime()}min</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border text-center">
          <p className="text-xs text-gray-400">Focus Windows</p>
          <p className="text-2xl font-bold text-deep">{focusWindows.length}</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border text-center">
          <p className="text-xs text-gray-400">Attention Saved</p>
          <p className="text-2xl font-bold text-business">{getAttentionSaved()}min</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card p-4 rounded-xl border border-border">
          <h2 className="text-sm font-semibold text-gray-300 mb-3">Focus Windows</h2>
          <div className="flex gap-2 mb-3">
            <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="bg-surface border border-border rounded-lg p-2 text-sm" />
            <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="bg-surface border border-border rounded-lg p-2 text-sm" />
            <button onClick={() => addFocusWindow({ startTime, endTime })} className="p-2 bg-deep/20 text-deep rounded-lg">
              <Plus size={16} />
            </button>
          </div>
          <div className="space-y-1">
            {focusWindows.map(w => (
              <div key={w.id} className="flex justify-between text-sm p-2 bg-surface rounded-lg">
                <span className="text-gray-300">{w.startTime} - {w.endTime}</span>
                <button onClick={() => removeFocusWindow(w.id)} className="text-gray-500 hover:text-fitness">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {focusWindows.length === 0 && <p className="text-xs text-gray-500 text-center py-4">No focus windows set</p>}
          </div>
        </div>

        <div className="bg-card p-4 rounded-xl border border-border">
          <h2 className="text-sm font-semibold text-gray-300 mb-3">Log Distractions</h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-400 mb-1">Interruptions</p>
              <input type="number" value={interruptions} onChange={e => setInterruptions(Number(e.target.value))} className="w-full bg-surface border border-border rounded-lg p-2 text-sm" min={0} />
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Screen Time (minutes)</p>
              <input type="number" value={screenTime} onChange={e => setScreenTime(Number(e.target.value))} className="w-full bg-surface border border-border rounded-lg p-2 text-sm" min={0} />
            </div>
            <button onClick={() => logDistraction({ interruptions, screenTimeMinutes: screenTime })} className="w-full p-2 bg-fitness/20 text-fitness rounded-lg text-sm">
              Log Today
            </button>
          </div>
        </div>
      </div>

      {distractionLogs.length > 0 && (
        <div className="bg-card p-4 rounded-xl border border-border">
          <h2 className="text-sm font-semibold text-gray-300 mb-3">Distraction History</h2>
          <div className="space-y-1">
            {[...distractionLogs].reverse().slice(0, 10).map(log => (
              <div key={log.date} className="flex justify-between text-sm p-2 bg-surface rounded-lg">
                <span className="text-gray-300">{log.date}</span>
                <div className="text-gray-400">
                  {log.interruptions} interruptions &bull; {log.screenTimeMinutes}min screen time
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
