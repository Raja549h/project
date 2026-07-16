import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FocusWindow {
  id: string;
  startTime: string;
  endTime: string;
}

interface DistractionLog {
  date: string;
  interruptions: number;
  screenTimeMinutes: number;
}

interface BoundaryState {
  focusWindows: FocusWindow[];
  distractionLogs: DistractionLog[];
  notificationsBlocked: number;
  addFocusWindow: (window: Omit<FocusWindow, 'id'>) => void;
  removeFocusWindow: (id: string) => void;
  logDistraction: (log: Omit<DistractionLog, 'date'>) => void;
  getTodayScreenTime: () => number;
  getAttentionSaved: () => number;
}

export const useBoundaryStore = create<BoundaryState>()(
  persist(
    (set, get) => ({
      focusWindows: [],
      distractionLogs: [],
      notificationsBlocked: 0,
      addFocusWindow: (windowData) => {
        const window: FocusWindow = { ...windowData, id: crypto.randomUUID() };
        set((state) => ({ focusWindows: [...state.focusWindows, window] }));
      },
      removeFocusWindow: (id) => {
        set((state) => ({ focusWindows: state.focusWindows.filter(w => w.id !== id) }));
      },
      logDistraction: (log) => {
        const date = new Date().toISOString().split('T')[0];
        set((state) => ({
          distractionLogs: [...state.distractionLogs.filter(l => l.date !== date), { ...log, date }],
        }));
      },
      getTodayScreenTime: () => {
        const today = new Date().toISOString().split('T')[0];
        const log = get().distractionLogs.find(l => l.date === today);
        return log?.screenTimeMinutes || 0;
      },
      getAttentionSaved: () => {
        const logs = get().distractionLogs;
        return logs.reduce((sum, l) => sum + l.interruptions * 5, 0);
      },
    }),
    { name: 'boundary-storage' }
  )
);
