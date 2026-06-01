import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TimeLog {
  date: string;
  productiveHours: number;
  wastedHours: number;
  energyLevel: number;
}

interface LifeAuditState {
  timeLogs: TimeLog[];
  addTimeLog: (log: TimeLog) => void;
  getEfficiencyScore: () => number;
  getLifeROI: () => number;
  getWeeklyReport: () => { productive: number; wasted: number; efficiency: number };
}

export const useLifeAuditStore = create<LifeAuditState>()(
  persist(
    (set, get) => ({
      timeLogs: [],
      addTimeLog: (log) => {
        set((state) => ({
          timeLogs: [...state.timeLogs.filter(t => t.date !== log.date), log],
        }));
      },
      getEfficiencyScore: () => {
        const logs = get().timeLogs;
        if (logs.length === 0) return 0;
        const total = logs.reduce((sum, l) => sum + l.productiveHours + l.wastedHours, 0);
        const productive = logs.reduce((sum, l) => sum + l.productiveHours, 0);
        return total > 0 ? Math.round((productive / total) * 100) : 0;
      },
      getLifeROI: () => {
        const logs = get().timeLogs;
        if (logs.length === 0) return 50;
        const avgEnergy = logs.reduce((sum, l) => sum + l.energyLevel, 0) / logs.length;
        const efficiency = get().getEfficiencyScore();
        return Math.round((avgEnergy * 0.4 + efficiency * 0.6));
      },
      getWeeklyReport: () => {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        const startStr = startOfWeek.toISOString().split('T')[0];
        const weekLogs = get().timeLogs.filter(l => l.date >= startStr);
        const productive = weekLogs.reduce((s, l) => s + l.productiveHours, 0);
        const wasted = weekLogs.reduce((s, l) => s + l.wastedHours, 0);
        const total = productive + wasted;
        return {
          productive,
          wasted,
          efficiency: total > 0 ? Math.round((productive / total) * 100) : 0,
        };
      },
    }),
    { name: 'life-audit-storage' }
  )
);
