import { useBattleStore } from '@/stores/useBattleStore';
import { useHabitStore } from '@/stores/useHabitStore';
import { useDeepWorkStore } from '@/stores/useDeepWorkStore';
import { useUserStore } from '@/stores/useUserStore';
import { useEffect } from 'react';
import { Sword, TrendingUp, TrendingDown } from 'lucide-react';

function MetricRow({ metric }: { metric: { label: string; current: number; previous: number; unit: string } }) {
  const diff = metric.current - metric.previous;
  const isUp = diff > 0;
  return (
    <div className="flex items-center justify-between p-3 bg-surface rounded-lg">
      <span className="text-sm text-gray-300">{metric.label}</span>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-semibold">{metric.current}{metric.unit}</p>
          <p className="text-xs text-gray-500">vs {metric.previous}{metric.unit}</p>
        </div>
        <div className={`flex items-center gap-1 text-sm font-medium ${isUp ? 'text-business' : diff < 0 ? 'text-fitness' : 'text-gray-400'}`}>
          {isUp ? <TrendingUp size={16} /> : diff < 0 ? <TrendingDown size={16} /> : null}
          {diff !== 0 ? `${isUp ? '+' : ''}${diff}${metric.unit}` : '—'}
        </div>
      </div>
    </div>
  );
}

function BattleCard({ title, metrics }: { title: string; metrics: any[] }) {
  return (
    <div className="bg-card p-4 rounded-xl border border-border">
      <h2 className="text-sm font-semibold text-gray-300 mb-3">{title}</h2>
      <div className="space-y-2">
        {metrics.map(m => <MetricRow key={m.label} metric={m} />)}
        {metrics.length === 0 && <p className="text-xs text-gray-500 text-center py-4">No data yet</p>}
      </div>
    </div>
  );
}

export default function BattleMode() {
  const { todayMetrics, weekMetrics, monthMetrics, setTodayMetrics, setWeekMetrics, setMonthMetrics } = useBattleStore();

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const habits = useHabitStore.getState().habits;
    const sessions = useDeepWorkStore.getState().sessions;
    const user = useUserStore.getState();

    const todayHabits = habits.filter(h => h.completedDates.includes(today)).length;
    const yesterdayHabits = habits.filter(h => h.completedDates.includes(yesterday)).length;
    const todayDW = sessions.filter(s => s.date === today).reduce((sum, s) => sum + s.duration, 0);
    const yesterdayDW = sessions.filter(s => s.date === yesterday).reduce((sum, s) => sum + s.duration, 0);

    setTodayMetrics([
      { label: 'Habits Done', current: todayHabits, previous: yesterdayHabits, unit: '' },
      { label: 'Deep Work', current: Math.round(todayDW * 60), previous: Math.round(yesterdayDW * 60), unit: 'min' },
      { label: 'XP Earned', current: user.xp, previous: user.xp, unit: '' },
    ]);
  }, [setTodayMetrics, setWeekMetrics, setMonthMetrics]);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-2">
        <Sword className="text-xp" size={24} />
        <h1 className="text-2xl font-bold">Battle Mode</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <BattleCard title="Today vs Yesterday" metrics={todayMetrics} />
        <BattleCard title="This Week vs Last Week" metrics={weekMetrics} />
        <BattleCard title="This Month vs Last Month" metrics={monthMetrics} />
      </div>
    </div>
  );
}
