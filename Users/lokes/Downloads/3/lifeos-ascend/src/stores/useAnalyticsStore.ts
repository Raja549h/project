import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DailySnapshot {
  date: string;
  xp: number;
  lifeScore: number;
  habitsCompleted: number;
  habitsTotal: number;
  deepWorkHours: number;
  fitnessScore: number;
  jeeReadiness: number;
  dopamineScore: number;
}

interface AnalyticsState {
  snapshots: DailySnapshot[];
  addSnapshot: (snapshot: DailySnapshot) => void;
  getXPGrowth: () => { date: string; xp: number }[];
  getLifeScoreHistory: () => { date: string; score: number }[];
}

export const useAnalyticsStore = create<AnalyticsState>()(
  persist(
    (set, get) => ({
      snapshots: [],
      addSnapshot: (snapshot) => {
        set((state) => ({
          snapshots: [...state.snapshots.filter(s => s.date !== snapshot.date), snapshot],
        }));
      },
      getXPGrowth: () => {
        return get().snapshots.map(s => ({ date: s.date, xp: s.xp }));
      },
      getLifeScoreHistory: () => {
        return get().snapshots.map(s => ({ date: s.date, score: s.lifeScore }));
      },
    }),
    { name: 'analytics-storage' }
  )
);
