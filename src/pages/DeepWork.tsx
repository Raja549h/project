import { useState, useEffect, useRef, useCallback } from 'react';
import { useDeepWorkStore, type DeepWorkSession } from '@/stores/useDeepWorkStore';
import { useUserStore } from '@/stores/useUserStore';
import { useBattleStore } from '@/stores/useBattleStore';
import { Play, Pause, RotateCcw } from 'lucide-react';

function PomodoroTimer() {
  const [display, setDisplay] = useState('25:00');
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [focusScore, setFocusScore] = useState(7);
  const [duration, setDuration] = useState(25);

  const endTimeRef = useRef<number>(0);
  const durationRef = useRef<number>(25 * 60 * 1000);
  const intervalRef = useRef<number | null>(null);

  const tick = useCallback(() => {
    if (!endTimeRef.current) return;
    const remaining = Math.max(0, endTimeRef.current - Date.now());
    const totalSec = Math.ceil(remaining / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    setDisplay(`${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);

    if (remaining <= 0) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIsActive(false);
      endTimeRef.current = 0;
      setDisplay('00:00');

      if (!isBreak) {
        const durationMins = durationRef.current / 60000;
        useDeepWorkStore.getState().addSession({
          date: new Date().toISOString().split('T')[0],
          duration: durationMins / 60,
          focusScore,
          notes: '',
        });
        
        // RPG Rewards
        const xpReward = Math.round(durationMins * 2); 
        const damage = Math.round(durationMins * (focusScore / 5));
        useUserStore.getState().addXP(xpReward);
        useBattleStore.getState().damageBoss(damage);
      }
    }
  }, [isBreak, focusScore]);

  useEffect(() => {
    if (isActive) {
      if (!endTimeRef.current) {
        endTimeRef.current = Date.now() + durationRef.current;
      }
      intervalRef.current = setInterval(tick, 200);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, tick]);

  const start = () => {
    durationRef.current = duration * 60 * 1000;
    endTimeRef.current = Date.now() + durationRef.current;
    setIsActive(true);
  };

  const pause = () => {
    const remaining = Math.max(0, endTimeRef.current - Date.now());
    durationRef.current = remaining;
    endTimeRef.current = 0;
    setIsActive(false);
  };

  const reset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    endTimeRef.current = 0;
    durationRef.current = duration * 60 * 1000;
    setIsActive(false);
    setDisplay(`${String(duration).padStart(2, '0')}:00`);
  };

  const toggleBreak = () => {
    reset();
    setIsBreak(b => !b);
  };

  return (
    <div className="bg-card p-6 rounded-xl border border-border text-center">
      <h2 className="text-lg font-semibold mb-1">{isBreak ? 'Break Time' : 'Focus Session'}</h2>
      <p className="text-xs text-gray-500 mb-4">{isBreak ? 'Rest and recharge' : 'Stay in the zone'}</p>

      {!isActive && !endTimeRef.current && (
        <div className="flex justify-center gap-2 mb-4">
          {[15, 25, 30, 45, 60].map(m => (
            <button
              key={m}
              onClick={() => { setDuration(m); setDisplay(`${String(m).padStart(2, '0')}:00`); durationRef.current = m * 60 * 1000; }}
              className={`px-3 py-1 text-xs rounded-lg ${duration === m ? 'bg-deep text-white' : 'bg-surface text-gray-400 hover:text-gray-300'}`}
            >
              {m}m
            </button>
          ))}
        </div>
      )}

      <div className="text-6xl font-mono text-deep mb-4 tabular-nums">
        {display}
      </div>

      <div className="flex justify-center gap-3 mb-4">
        {!isActive ? (
          <button onClick={start} className="p-3 bg-deep/20 rounded-full hover:bg-deep/30 transition-colors">
            <Play size={20} />
          </button>
        ) : (
          <button onClick={pause} className="p-3 bg-xp/20 rounded-full hover:bg-xp/30 transition-colors">
            <Pause size={20} />
          </button>
        )}
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

      <button onClick={toggleBreak} className="text-sm text-gray-400 hover:text-gray-300">
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
