import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ReputationScores {
  reliability: number;
  trust: number;
  accountability: number;
  consistency: number;
  date: string;
}

interface ReputationState {
  history: ReputationScores[];
  addScore: (score: ReputationScores) => void;
  getOverall: () => number;
  getCurrent: () => ReputationScores;
}

export const useReputationStore = create<ReputationState>()(
  persist(
    (set, get) => ({
      history: [],
      addScore: (score) => {
        set((state) => ({
          history: [...state.history, score],
        }));
      },
      getOverall: () => {
        const h = get().history;
        if (h.length === 0) return 0;
        const last = h[h.length - 1];
        return Math.round((last.reliability + last.trust + last.accountability + last.consistency) / 4);
      },
      getCurrent: () => {
        const h = get().history;
        if (h.length === 0) return { reliability: 0, trust: 0, accountability: 0, consistency: 0, date: '' };
        return h[h.length - 1];
      },
    }),
    { name: 'reputation-storage' }
  )
);
