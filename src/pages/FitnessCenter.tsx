import { useFitnessStore } from '@/stores/useFitnessStore';
import { useUserStore } from '@/stores/useUserStore';
import { useState } from 'react';
import { Dumbbell, Plus, Flame, RefreshCw, Shield, Calendar } from 'lucide-react';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const WORKOUT_TYPES = ['Cardio', 'Strength', 'Yoga', 'HIIT', 'Sports', 'Walking', 'Other'];
const DURATION_PRESETS = [15, 30, 45, 60, 90];
const CALORIE_PRESETS = [100, 200, 300, 500];
const SLEEP_PRESETS = [5, 6, 6.5, 7, 7.5, 8, 9];

function getToday() { return new Date().toISOString().split('T')[0]; }
function getYesterday() { const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().split('T')[0]; }

const getProgressColor = (value: number, target: number) => {
  if (value === 0) return '#ef4444';
  if (value >= target) return '#10b981';
  return '#f59e0b';
};

export default function FitnessCenter() {
  const { workouts, weightLogs, stepsToday, sleepHours, addWorkout, logWeight, setSteps, setSleep, getFitnessScore, getWorkoutsThisWeek } = useFitnessStore();
  const { streakFreezes, currentStreak } = useUserStore();
  const [type, setType] = useState('Cardio');
  const [duration, setDuration] = useState(30);
  const [calories, setCalories] = useState(200);
  const [weight, setWeight] = useState(() => weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weight : 70);
  const [logDate, setLogDate] = useState(getToday());
  const fitnessScore = getFitnessScore();

  const stepTarget = 10000;
  const sleepTarget = 8;
  const stepColor = getProgressColor(stepsToday, stepTarget);
  const sleepColor = getProgressColor(sleepHours, sleepTarget);

  const simulateSync = () => {
    setSteps(Math.floor(Math.random() * 5000) + 6000);
    setSleep(Math.floor(Math.random() * 3 * 10) / 10 + 6.5);
    const lastWeight = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weight : 70;
    setWeight(Math.round((lastWeight + (Math.random() * 2 - 1)) * 10) / 10);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Fitness Center</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5" title="Streak Freezes available">
            <Shield size={16} className="text-cyan-400" />
            <span className="text-sm font-semibold text-cyan-400">{streakFreezes}</span>
          </div>
          <div className="flex items-center gap-2">
            <Flame className="text-fitness" size={20} />
            <span className="text-lg font-semibold text-fitness">Score: {fitnessScore}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-card p-4 rounded-xl border border-border text-center flex flex-col justify-center">
          <p className="text-xs text-gray-400 mb-2">Workouts This Week</p>
          <p className="text-3xl font-bold text-fitness">{getWorkoutsThisWeek()}</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border text-center flex flex-col justify-center">
          <p className="text-xs text-gray-400 mb-2">Total Workouts</p>
          <p className="text-3xl font-bold text-fitness">{workouts.length}</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border text-center flex flex-col items-center">
          <p className="text-xs text-gray-400 mb-2">Steps Today</p>
          <div className="w-20 h-20">
            <CircularProgressbar
              value={Math.min((stepsToday / stepTarget) * 100, 100)}
              text={`${(stepsToday / 1000).toFixed(1)}k`}
              styles={{
                path: { stroke: stepColor },
                text: { fill: stepColor, fontSize: '24px', fontWeight: 'bold' },
                trail: { stroke: '#1f1f1f' }
              }}
            />
          </div>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border text-center flex flex-col items-center">
          <p className="text-xs text-gray-400 mb-2">Sleep</p>
          <div className="w-20 h-20">
            <CircularProgressbar
              value={Math.min((sleepHours / sleepTarget) * 100, 100)}
              text={`${sleepHours}h`}
              styles={{
                path: { stroke: sleepColor },
                text: { fill: sleepColor, fontSize: '24px', fontWeight: 'bold' },
                trail: { stroke: '#1f1f1f' }
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card p-4 rounded-xl border border-border">
          <h2 className="text-sm font-semibold text-gray-300 mb-3">Log Workout</h2>
          <div className="space-y-3">
            {/* Date picker with quick toggles */}
            <div>
              <p className="text-xs text-gray-400 mb-1.5">Date</p>
              <div className="flex items-center gap-2">
                <button onClick={() => setLogDate(getToday())} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${logDate === getToday() ? 'bg-fitness/20 text-fitness' : 'bg-surface text-gray-500 hover:text-gray-300'}`}>Today</button>
                <button onClick={() => setLogDate(getYesterday())} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${logDate === getYesterday() ? 'bg-fitness/20 text-fitness' : 'bg-surface text-gray-500 hover:text-gray-300'}`}>Yesterday</button>
                <div className="relative flex items-center">
                  <Calendar size={14} className="absolute left-2 text-gray-500 pointer-events-none" />
                  <input type="date" value={logDate} onChange={e => setLogDate(e.target.value)} max={getToday()} className="bg-surface border border-border rounded-lg pl-7 pr-2 py-1.5 text-xs w-36" />
                </div>
              </div>
            </div>

            <select value={type} onChange={e => setType(e.target.value)} className="w-full bg-surface border border-border rounded-lg p-2 text-sm">
              {WORKOUT_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>

            {/* Duration presets */}
            <div>
              <p className="text-xs text-gray-400 mb-1.5">Duration (min)</p>
              <div className="flex gap-1.5 flex-wrap mb-1.5">
                {DURATION_PRESETS.map(d => (
                  <button key={d} onClick={() => setDuration(d)} className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${duration === d ? 'bg-fitness/20 text-fitness' : 'bg-surface text-gray-500 hover:text-gray-300'}`}>{d}m</button>
                ))}
              </div>
              <input type="range" min={5} max={180} value={duration} onChange={e => setDuration(Number(e.target.value))} className="w-full accent-fitness" />
              <span className="text-xs text-gray-500">{duration} min</span>
            </div>

            {/* Calorie presets */}
            <div>
              <p className="text-xs text-gray-400 mb-1.5">Calories</p>
              <div className="flex gap-1.5 flex-wrap mb-1.5">
                {CALORIE_PRESETS.map(c => (
                  <button key={c} onClick={() => setCalories(c)} className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${calories === c ? 'bg-fitness/20 text-fitness' : 'bg-surface text-gray-500 hover:text-gray-300'}`}>{c}</button>
                ))}
              </div>
              <input type="range" min={50} max={1000} step={10} value={calories} onChange={e => setCalories(Number(e.target.value))} className="w-full accent-fitness" />
              <span className="text-xs text-gray-500">{calories} kcal</span>
            </div>

            <button
              onClick={() => { addWorkout({ date: logDate, type, duration, calories }); }}
              className="w-full p-2 bg-fitness/20 text-fitness rounded-lg hover:bg-fitness/30 text-sm"
            >
              <Plus size={16} className="inline mr-1" /> Log Workout {logDate !== getToday() && <span className="text-fitness/60 text-xs ml-1">({logDate})</span>}
            </button>
          </div>
        </div>

        <div className="bg-card p-4 rounded-xl border border-border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-300">Quick Logs</h2>
            <button onClick={simulateSync} className="text-xs flex items-center gap-1 text-intelligence hover:text-intelligence/80">
              <RefreshCw size={12} /> Sync Device
            </button>
          </div>
          <div className="space-y-4">
            {/* Steps with slider */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">Steps</span>
                <span className="text-xs text-gray-500">{stepsToday.toLocaleString()}</span>
              </div>
              <input type="range" min={0} max={25000} step={100} value={stepsToday} onChange={e => setSteps(Number(e.target.value))} className="w-full accent-fitness" />
            </div>

            {/* Sleep with preset chips */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">Sleep (hours)</span>
                <span className="text-xs text-gray-500">{sleepHours}h</span>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {SLEEP_PRESETS.map(h => (
                  <button key={h} onClick={() => setSleep(h)} className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${sleepHours === h ? 'bg-deep/20 text-deep' : 'bg-surface text-gray-500 hover:text-gray-300'}`}>{h}h</button>
                ))}
              </div>
            </div>

            {/* Weight auto-filled from last log */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">Weight (kg)</span>
                <span className="text-xs text-gray-500">{weight} kg</span>
              </div>
              <div className="flex items-center gap-2">
                <input type="range" min={40} max={150} step={0.1} value={weight} onChange={e => setWeight(Number(e.target.value))} className="flex-1 accent-fitness" />
                <button onClick={() => logWeight(weight)} className="text-xs px-3 py-2 bg-fitness/20 text-fitness rounded-lg">Log</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {workouts.length > 0 && (
        <div className="bg-card p-4 rounded-xl border border-border">
          <h2 className="text-sm font-semibold text-gray-300 mb-3">Recent Workouts</h2>
          <div className="space-y-1">
            {[...workouts].reverse().slice(0, 10).map(w => (
              <div key={w.id} className="flex justify-between text-sm p-2 bg-surface rounded-lg">
                <div>
                  <span className="text-gray-300">{w.type}</span>
                  <span className="text-gray-500 ml-2">{w.date}</span>
                </div>
                <div className="text-gray-400">
                  {w.duration}min &bull; {w.calories}cal
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
