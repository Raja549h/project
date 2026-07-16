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
  bossHealth: number;
  maxBossHealth: number;
  bossLevel: number;
  setTodayMetrics: (metrics: BattleMetric[]) => void;
  setWeekMetrics: (metrics: BattleMetric[]) => void;
  setMonthMetrics: (metrics: BattleMetric[]) => void;
  damageBoss: (damage: number) => void;
}

export const useBattleStore = create<BattleState>()(
  persist(
    (set) => ({
      todayMetrics: [],
      weekMetrics: [],
      monthMetrics: [],
      bossHealth: 1000,
      maxBossHealth: 1000,
      bossLevel: 1,
      setTodayMetrics: (metrics) => set({ todayMetrics: metrics }),
      setWeekMetrics: (metrics) => set({ weekMetrics: metrics }),
      setMonthMetrics: (metrics) => set({ monthMetrics: metrics }),
      damageBoss: (damage) => set((state) => {
        const newHealth = state.bossHealth - damage;
        if (newHealth <= 0) {
          // Boss defeated, level up boss
          const newMax = state.maxBossHealth + 500;
          return { bossHealth: newMax, maxBossHealth: newMax, bossLevel: state.bossLevel + 1 };
        }
        return { bossHealth: newHealth };
      }),
    }),
    { name: 'battle-storage' }
  )
);
