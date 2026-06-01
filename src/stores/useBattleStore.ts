import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BattleMetric {
  label: string;
  current: number;
  previous: number;
  unit: string;
}

interface BattleState {
  todayMetrics: BattleMetric[];
  weekMetrics: BattleMetric[];
  monthMetrics: BattleMetric[];
  setTodayMetrics: (metrics: BattleMetric[]) => void;
  setWeekMetrics: (metrics: BattleMetric[]) => void;
  setMonthMetrics: (metrics: BattleMetric[]) => void;
}

export const useBattleStore = create<BattleState>()(
  persist(
    (set) => ({
      todayMetrics: [],
      weekMetrics: [],
      monthMetrics: [],
      setTodayMetrics: (metrics) => set({ todayMetrics: metrics }),
      setWeekMetrics: (metrics) => set({ weekMetrics: metrics }),
      setMonthMetrics: (metrics) => set({ monthMetrics: metrics }),
    }),
    { name: 'battle-storage' }
  )
);
