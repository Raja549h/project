import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useUserStore } from './useUserStore';

export type HabitCategory = 'Study' | 'Fitness' | 'Health' | 'Business' | 'Mindset' | 'Custom';

export interface Habit {
  id: string;
  name: string;
  category: HabitCategory;
  streak: number;
  completedDates: string[];
}

function calculateStreak(dates: string[]): number {
  if (!dates.length) return 0;
  const sorted = [...dates].sort().reverse();
  const today = new Date().toISOString().split('T')[0];
  if (sorted[0] !== today && sorted[0] !== getYesterday()) return 0;
  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i-1]);
    const curr = new Date(sorted[i]);
    const diff = (prev.getTime() - curr.getTime()) / (1000*3600*24);
    if (Math.round(diff) === 1) streak++;
    else break;
  }
  return streak;
}

function getYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

interface HabitState {
  habits: Habit[];
  addHabit: (habit: Omit<Habit, 'id' | 'streak' | 'completedDates'>) => void;
  toggleComplete: (id: string, date: string) => void;
  deleteHabit: (id: string) => void;
  getTodayCompletion: () => number;
}

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      habits: [],
      addHabit: (habitData) => {
        const newHabit: Habit = {
          ...habitData,
          id: crypto.randomUUID(),
          streak: 0,
          completedDates: [],
        };
        set({ habits: [...get().habits, newHabit] });
      },
      toggleComplete: (id, date) => {
        set((state) => ({
          habits: state.habits.map((h) => {
            if (h.id !== id) return h;
            const alreadyDone = h.completedDates.includes(date);
            const newDates = alreadyDone
              ? h.completedDates.filter((d) => d !== date)
              : [...h.completedDates, date];
            const newStreak = calculateStreak(newDates);
            if (!alreadyDone) {
              useUserStore.getState().addXP(10);
            }
            return { ...h, completedDates: newDates, streak: newStreak };
          }),
        }));
      },
      deleteHabit: (id) => set((state) => ({ habits: state.habits.filter(h => h.id !== id) })),
      getTodayCompletion: () => {
        const today = new Date().toISOString().split('T')[0];
        const habits = get().habits;
        if (habits.length === 0) return 0;
        const done = habits.filter(h => h.completedDates.includes(today)).length;
        return Math.round((done / habits.length) * 100);
      },
    }),
    { name: 'habits-storage' }
  )
);
