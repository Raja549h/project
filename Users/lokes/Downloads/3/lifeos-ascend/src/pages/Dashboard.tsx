import { useUserStore } from '@/stores/useUserStore';
import { useHabitStore } from '@/stores/useHabitStore';
import { useDeepWorkStore } from '@/stores/useDeepWorkStore';
import { useJeeStore } from '@/stores/useJeeStore';
import { useFitnessStore } from '@/stores/useFitnessStore';
import { useSkillStore } from '@/stores/useSkillStore';
import { useQuestsStore } from '@/stores/useQuestsStore';
import { useBattleStore } from '@/stores/useBattleStore';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Target, Zap } from 'lucide-react';

function LevelProgress() {
  const { level, xp } = useUserStore();
  const currentLevelXP = Math.max(0, Math.pow(level - 1, 3) * 100);
  const nextLevelXP = Math.max(1, Math.pow(level, 3) * 100);
  const progress = Math.min(100, ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100);

  return (
    <div className="w-24 h-24">
      <CircularProgressbar
        value={Math.max(0, progress)}
        text={`Lv.${level}`}
        styles={{
          path: { stroke: '#f59e0b' },
          text: { fill: '#f59e0b', fontSize: '22px', fontWeight: 'bold' },
          trail: { stroke: '#1f1f1f' }
        }}
      />
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: any; color: string }) {
  return (
    <div className="bg-card p-4 rounded-xl border border-border flex items-center gap-3">
      <div className={`p-2 rounded-lg ${color}/20`}>
        <Icon size={20} className={color} />
      </div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-lg font-semibold">{value}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { username, level, xp, lifeScore, currentStreak } = useUserStore();
  const getTodayCompletion = useHabitStore(s => s.getTodayCompletion);
  const totalHoursToday = useDeepWorkStore(s => s.totalHoursToday);
  const totalHoursThisWeek = useDeepWorkStore(s => s.totalHoursThisWeek);
  const getReadiness = useJeeStore(s => s.getReadiness);
  const getWorkoutsThisWeek = useFitnessStore(s => s.getWorkoutsThisWeek);
  const getProgressByDomain = useSkillStore(s => s.getProgressByDomain);
  const dailyQuests = useQuestsStore(s => s.dailyQuests);
  const todayMetrics = useBattleStore(s => s.todayMetrics);
  const habitPct = getTodayCompletion();
  const dwHours = totalHoursToday();
  const dwWeek = totalHoursThisWeek();
  const jeeReadiness = getReadiness();
  const workouts = getWorkoutsThisWeek();

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {username}</h1>
          <p className="text-gray-400 text-sm">Here's your life overview</p>
        </div>
        <LevelProgress />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Life Score" value={`${lifeScore}/100`} icon={Zap} color="text-xp" />
        <StatCard label="Habits Today" value={`${habitPct}%`} icon={Target} color="text-deep" />
        <StatCard label="Deep Work Today" value={`${dwHours.toFixed(1)}h`} icon={TrendingUp} color="text-intelligence" />
        <StatCard label="Current Streak" value={`${currentStreak} days`} icon={Sparkles} color="text-fitness" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card p-4 rounded-xl border border-border">
          <h2 className="text-sm font-semibold text-gray-300 mb-3">Domain Progress</h2>
          <div className="space-y-3">
            {[
              { label: 'Deep Work', value: getProgressByDomain('deep-work'), color: 'bg-intelligence' },
              { label: 'Fitness', value: getProgressByDomain('fitness'), color: 'bg-fitness' },
              { label: 'Business', value: getProgressByDomain('business'), color: 'bg-business' },
              { label: 'Discipline', value: getProgressByDomain('discipline'), color: 'bg-xp' },
            ].map(d => (
              <div key={d.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">{d.label}</span>
                  <span className="text-gray-300">{d.value}%</span>
                </div>
                <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${d.value}%` }}
                    className={`h-full rounded-full ${d.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card p-4 rounded-xl border border-border">
          <h2 className="text-sm font-semibold text-gray-300 mb-3">Quick Stats</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-400">JEE Readiness</span><span>{jeeReadiness}%</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Workouts This Week</span><span>{workouts}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Deep Work (Week)</span><span>{dwWeek.toFixed(1)}h</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Total XP</span><span>{xp.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Level</span><span>{level}</span></div>
          </div>
        </div>

        <div className="bg-card p-4 rounded-xl border border-border">
          <h2 className="text-sm font-semibold text-gray-300 mb-3">Daily Quests</h2>
          <div className="space-y-2">
            {dailyQuests.slice(0, 3).map(q => (
              <div key={q.id} className="flex items-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${q.completed ? 'bg-business' : 'bg-gray-500'}`} />
                <span className={q.completed ? 'text-gray-400 line-through' : 'text-gray-300'}>{q.title}</span>
              </div>
            ))}
            {dailyQuests.length === 0 && <p className="text-xs text-gray-500">No quests yet</p>}
          </div>
        </div>
      </div>

      {todayMetrics.length > 0 && (
        <div className="bg-card p-4 rounded-xl border border-border">
          <h2 className="text-sm font-semibold text-gray-300 mb-3">Today vs Yesterday</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {todayMetrics.map(m => (
              <div key={m.label} className="text-center">
                <p className="text-xs text-gray-400">{m.label}</p>
                <p className="text-lg font-semibold">{m.current}{m.unit}</p>
                <p className={`text-xs ${m.current >= m.previous ? 'text-business' : 'text-fitness'}`}>
                  {m.current >= m.previous ? '↑' : '↓'} {Math.abs(m.current - m.previous)}{m.unit}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
