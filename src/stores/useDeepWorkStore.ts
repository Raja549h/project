import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useUserStore } from './useUserStore';

export interface DeepWorkSession {
  id: string;
  date: string;
  duration: number;
  focusScore: number;
  notes: string;
}

interface DeepWorkState {
  sessions: DeepWorkSession[];
  totalHoursToday: () => number;
  totalHoursThisWeek: () => number;
  addSession: (session: Omit<DeepWorkSession, 'id'>) => void;
  getRecentSessions: (days: number) => DeepWorkSession[];
}

export const useDeepWorkStore = create<DeepWorkState>()(
  persist(
    (set, get) => ({
      sessions: [],
      totalHoursToday: () => {
        const today = new Date().toISOString().split('T')[0];
        return get().sessions
          .filter(s => s.date === today)
          .reduce((sum, s) => sum + s.duration, 0);
      },
      totalHoursThisWeek: () => {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        const startStr = startOfWeek.toISOString().split('T')[0];
        return get().sessions
          .filter(s => s.date >= startStr)
          .reduce((sum, s) => sum + s.duration, 0);
      },
      addSession: (sessionData) => {
        const session: DeepWorkSession = { ...sessionData, id: crypto.randomUUID() };
        set((state) => ({ sessions: [...state.sessions, session] }));
        useUserStore.getState().addXP(Math.round(session.duration * 25));
      },
      getRecentSessions: (days) => {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        const cutoffStr = cutoff.toISOString().split('T')[0];
        return get().sessions.filter(s => s.date >= cutoffStr);
      },
    }),
    { name: 'deepwork-storage' }
  )
);
