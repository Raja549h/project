import { useUserStore } from '@/stores/useUserStore';
import { useHabitStore } from '@/stores/useHabitStore';
import { useDeepWorkStore } from '@/stores/useDeepWorkStore';
import { useJeeStore } from '@/stores/useJeeStore';
import { useFitnessStore } from '@/stores/useFitnessStore';
import { useReputationStore } from '@/stores/useReputationStore';
import { useConfidenceStore } from '@/stores/useConfidenceStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { BarChart3 } from 'lucide-react';

export default function Analytics() {
  const { level, xp, lifeScore } = useUserStore();
  const { sessions } = useDeepWorkStore();
  const { physics, chemistry, mathematics } = useJeeStore();
  const { weightLogs } = useFitnessStore();
  const history = useReputationStore(s => s.history);
  const analyses = useConfidenceStore(s => s.analyses);
  const habits = useHabitStore(s => s.habits);

  const deepWorkData = sessions.reduce((acc: any[], s) => {
    const existing = acc.find(a => a.date === s.date);
    if (existing) existing.hours += s.duration;
    else acc.push({ date: s.date, hours: s.duration });
    return acc;
  }, []).slice(-14);

  const jeeRadar = [
    { subject: 'Physics', value: physics.questionsSolved > 0 ? Math.round((physics.correct / physics.questionsSolved) * 100) : 0 },
    { subject: 'Chemistry', value: chemistry.questionsSolved > 0 ? Math.round((chemistry.correct / chemistry.questionsSolved) * 100) : 0 },
    { subject: 'Math', value: mathematics.questionsSolved > 0 ? Math.round((mathematics.correct / mathematics.questionsSolved) * 100) : 0 },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center gap-2">
        <BarChart3 className="text-xp" size={24} />
        <h1 className="text-2xl font-bold">Analytics</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card p-4 rounded-xl border border-border">
          <h2 className="text-sm font-semibold text-gray-300 mb-3">Deep Work Hours</h2>
          {deepWorkData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={deepWorkData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
                <XAxis dataKey="date" stroke="#666" fontSize={10} />
                <YAxis stroke="#666" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #1f1f1f', borderRadius: '8px', color: '#e5e7eb' }} />
                <Bar dataKey="hours" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-gray-500 text-sm">No data yet</div>
          )}
        </div>

        <div className="bg-card p-4 rounded-xl border border-border">
          <h2 className="text-sm font-semibold text-gray-300 mb-3">JEE Subject Accuracy</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={jeeRadar} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
              <XAxis type="number" stroke="#666" fontSize={10} domain={[0, 100]} />
              <YAxis dataKey="subject" type="category" stroke="#666" fontSize={10} />
              <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #1f1f1f', borderRadius: '8px', color: '#e5e7eb' }} />
              <Bar dataKey="value" fill="#f59e0b" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card p-4 rounded-xl border border-border">
          <h2 className="text-sm font-semibold text-gray-300 mb-3">Reputation Score</h2>
          {history.length > 1 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
                <XAxis dataKey="date" stroke="#666" fontSize={10} />
                <YAxis stroke="#666" fontSize={10} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #1f1f1f', borderRadius: '8px', color: '#e5e7eb' }} />
                <Line type="monotone" dataKey="reliability" stroke="#22c55e" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="consistency" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-gray-500 text-sm">No history yet</div>
          )}
        </div>

        <div className="bg-card p-4 rounded-xl border border-border">
          <h2 className="text-sm font-semibold text-gray-300 mb-3">Confidence Trend</h2>
          {analyses.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={analyses}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
                <XAxis dataKey="date" stroke="#666" fontSize={10} />
                <YAxis stroke="#666" fontSize={10} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #1f1f1f', borderRadius: '8px', color: '#e5e7eb' }} />
                <Area type="monotone" dataKey="confidenceScore" stroke="#a855f7" fill="#a855f7" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-gray-500 text-sm">No data yet</div>
          )}
        </div>
      </div>

      <div className="bg-card p-4 rounded-xl border border-border">
        <h2 className="text-sm font-semibold text-gray-300 mb-3">Quick Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div><span className="text-gray-400">Level</span><p className="font-semibold">{level}</p></div>
          <div><span className="text-gray-400">Total XP</span><p className="font-semibold">{xp.toLocaleString()}</p></div>
          <div><span className="text-gray-400">Life Score</span><p className="font-semibold">{lifeScore}</p></div>
          <div><span className="text-gray-400">Deep Work Sessions</span><p className="font-semibold">{sessions.length}</p></div>
          <div><span className="text-gray-400">Physics Qs</span><p className="font-semibold">{physics.questionsSolved}</p></div>
          <div><span className="text-gray-400">Chemistry Qs</span><p className="font-semibold">{chemistry.questionsSolved}</p></div>
          <div><span className="text-gray-400">Math Qs</span><p className="font-semibold">{mathematics.questionsSolved}</p></div>
          <div><span className="text-gray-400">Habits</span><p className="font-semibold">{habits.length}</p></div>
        </div>
      </div>
    </div>
  );
}
