import { useState, useEffect, useRef } from 'react';
import { useDeepWorkStore, type DeepWorkSession } from '@/stores/useDeepWorkStore';
import { useUserStore } from '@/stores/useUserStore';
import { Play, Pause, RotateCcw, Plus } from 'lucide-react';

function PomodoroTimer() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [focusScore, setFocusScore] = useState(7);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            clearInterval(intervalRef.current!);
            setIsActive(false);
            const durationHours = isBreak ? 0 : 25 / 60;
            if (!isBreak) {
              useDeepWorkStore.getState().addSession({
                date: new Date().toISOString().split('T')[0],
                duration: durationHours,
                focusScore,
                notes: '',
              });
            }
          } else {
            setMinutes(m => m - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(s => s - 1);
        }
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isActive, minutes, seconds, isBreak, focusScore]);

  const reset = () => {
    setMinutes(25);
    setSeconds(0);
    setIsActive(false);
  };

  return (
    <div className="bg-card p-6 rounded-xl border border-border text-center">
      <h2 className="text-lg font-semibold mb-1">{isBreak ? 'Break Time' : 'Focus Session'}</h2>
      <p className="text-xs text-gray-500 mb-4">{isBreak ? 'Rest and recharge' : 'Stay in the zone'}</p>
      <div className="text-6xl font-mono text-deep mb-4">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
      <div className="flex justify-center gap-3 mb-4">
        <button onClick={() => setIsActive(!isActive)} className="p-3 bg-deep/20 rounded-full hover:bg-deep/30 transition-colors">
          {isActive ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <button onClick={reset} className="p-3 bg-surface rounded-full hover:bg-surface/80 transition-colors">
          <RotateCcw size={20} />
        </button>
      </div>
      <div className="flex items-center justify-center gap-2 mb-3">
        <span className="text-xs text-gray-400">Focus Score:</span>
        {[1,2,3,4,5,6,7,8,9,10].map(n => (
          <button
            key={n}
            onClick={() => setFocusScore(n)}
            className={`w-6 h-6 text-xs rounded-full ${n <= focusScore ? 'bg-deep text-white' : 'bg-surface text-gray-500'}`}
          >
            {n}
          </button>
        ))}
      </div>
      <button
        onClick={() => { setIsBreak(!isBreak); reset(); }}
        className="text-sm text-gray-400 hover:text-gray-300"
      >
        {isBreak ? 'Switch to Focus' : 'Switch to Break'}
      </button>
    </div>
  );
}

export default function DeepWork() {
  const { sessions, totalHoursToday, totalHoursThisWeek } = useDeepWorkStore();
  const recentSessions = [...sessions].reverse().slice(0, 10);

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold">Deep Work Center</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card p-4 rounded-xl border border-border text-center">
          <p className="text-xs text-gray-400">Today</p>
          <p className="text-2xl font-bold text-deep">{totalHoursToday().toFixed(1)}h</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border text-center">
          <p className="text-xs text-gray-400">This Week</p>
          <p className="text-2xl font-bold text-deep">{totalHoursThisWeek().toFixed(1)}h</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border text-center">
          <p className="text-xs text-gray-400">Total Sessions</p>
          <p className="text-2xl font-bold text-deep">{sessions.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PomodoroTimer />

        <div className="bg-card p-4 rounded-xl border border-border">
          <h2 className="text-sm font-semibold text-gray-300 mb-3">Recent Sessions</h2>
          {recentSessions.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No sessions yet. Start your first focus session!</p>
          ) : (
            <div className="space-y-2">
              {recentSessions.map((s: DeepWorkSession) => (
                <div key={s.id} className="flex justify-between text-sm p-2 bg-surface rounded-lg">
                  <div>
                    <span className="text-gray-300">{s.date}</span>
                    <span className="text-gray-500 ml-2">{s.duration.toFixed(1)}h</span>
                  </div>
                  <span className="text-deep">Focus: {s.focusScore}/10</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
