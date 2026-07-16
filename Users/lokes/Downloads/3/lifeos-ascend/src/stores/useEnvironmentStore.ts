import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface EnvironmentScore {
  date: string;
  focusScore: number;
  environmentScore: number;
  sleepScore: number;
}

interface EnvironmentState {
  scores: EnvironmentScore[];
  addScore: (score: Omit<EnvironmentScore, 'date'>) => void;
  getLatest: () => EnvironmentScore | null;
}

export const useEnvironmentStore = create<EnvironmentState>()(
  persist(
    (set, get) => ({
      scores: [],
      addScore: (score) => {
        const date = new Date().toISOString().split('T')[0];
        set((state) => ({
          scores: [...state.scores.filter(s => s.date !== date), { ...score, date }],
        }));
      },
      getLatest: () => {
        const s = get().scores;
        return s.length > 0 ? s[s.length - 1] : null;
      },
    }),
    { name: 'environment-storage' }
  )
);
