import { useFitnessStore } from '@/stores/useFitnessStore';
import { useState } from 'react';
import { Dumbbell, Plus, Flame, RefreshCw } from 'lucide-react';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const WORKOUT_TYPES = ['Cardio', 'Strength', 'Yoga', 'HIIT', 'Sports', 'Walking', 'Other'];

const getProgressColor = (value: number, target: number) => {
  if (value === 0) return '#ef4444'; // Red for no progress
  if (value >= target) return '#10b981'; // Green for goal achieved
  return '#f59e0b'; // Amber for midway
};

export default function FitnessCenter() {
  const { workouts, weightLogs, stepsToday, sleepHours, addWorkout, logWeight, setSteps, setSleep, getFitnessScore, getWorkoutsThisWeek } = useFitnessStore();
  const [type, setType] = useState('Cardio');
  const [duration, setDuration] = useState(30);
  const [calories, setCalories] = useState(200);
  const [weight, setWeight] = useState(70);
  const fitnessScore = getFitnessScore();
  
  const stepTarget = 10000;
  const sleepTarget = 8;
  const stepColor = getProgressColor(stepsToday, stepTarget);
  const sleepColor = getProgressColor(sleepHours, sleepTarget);

  const simulateSync = () => {
    setSteps(Math.floor(Math.random() * 5000) + 6000); // 6k - 11k steps
    setSleep(Math.floor(Math.random() * 3 * 10) / 10 + 6.5); // 6.5 - 9.5 hours
    setWeight(70 + (Math.random() * 2 - 1));
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Fitness Center</h1>
        <div className="flex items-center gap-2">
          <Flame className="text-fitness" size={20} />
          <span className="text-lg font-semibold text-fitness">Score: {fitnessScore}</span>
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
            <select value={type} onChange={e => setType(e.target.value)} className="w-full bg-surface border border-border rounded-lg p-2 text-sm">
              {WORKOUT_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
            <div className="flex gap-2">
              <input type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} className="w-full bg-surface border border-border rounded-lg p-2 text-sm" placeholder="Duration (min)" />
              <input type="number" value={calories} onChange={e => setCalories(Number(e.target.value))} className="w-full bg-surface border border-border rounded-lg p-2 text-sm" placeholder="Calories" />
            </div>
            <button
              onClick={() => { addWorkout({ date: new Date().toISOString().split('T')[0], type, duration, calories }); }}
              className="w-full p-2 bg-fitness/20 text-fitness rounded-lg hover:bg-fitness/30 text-sm"
            >
              <Plus size={16} className="inline mr-1" /> Log Workout
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
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 w-20">Steps:</span>
              <input type="number" value={stepsToday} onChange={e => setSteps(Number(e.target.value))} className="flex-1 bg-surface border border-border rounded-lg p-2 text-sm" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 w-20">Sleep (h):</span>
              <input type="number" value={sleepHours} onChange={e => setSleep(Number(e.target.value))} className="flex-1 bg-surface border border-border rounded-lg p-2 text-sm" step={0.5} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 w-20">Weight:</span>
              <input type="number" value={weight} onChange={e => setWeight(Number(e.target.value))} className="flex-1 bg-surface border border-border rounded-lg p-2 text-sm" />
              <button onClick={() => logWeight(weight)} className="text-xs px-3 py-2 bg-fitness/20 text-fitness rounded-lg">Log</button>
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
