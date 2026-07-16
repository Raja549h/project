import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useUserStore } from './useUserStore';

interface Workout {
  id: string;
  date: string;
  type: string;
  duration: number;
  calories: number;
}

interface WeightLog {
  date: string;
  weight: number;
}

interface FitnessState {
  workouts: Workout[];
  weightLogs: WeightLog[];
  stepsToday: number;
  sleepHours: number;
  addWorkout: (workout: Omit<Workout, 'id'>) => void;
  logWeight: (weight: number) => void;
  setSteps: (steps: number) => void;
  setSleep: (hours: number) => void;
  getFitnessScore: () => number;
  getWorkoutsThisWeek: () => number;
}

export const useFitnessStore = create<FitnessState>()(
  persist(
    (set, get) => ({
      workouts: [],
      weightLogs: [],
      stepsToday: 0,
      sleepHours: 7,
      addWorkout: (workoutData) => {
        const workout: Workout = { ...workoutData, id: crypto.randomUUID() };
        set((state) => ({ workouts: [...state.workouts, workout] }));
        useUserStore.getState().addXP(20);
      },
      logWeight: (weight) => {
        const date = new Date().toISOString().split('T')[0];
        set((state) => ({
          weightLogs: [...state.weightLogs.filter(w => w.date !== date), { date, weight }],
        }));
      },
      setSteps: (steps) => set({ stepsToday: steps }),
      setSleep: (hours) => set({ sleepHours: hours }),
      getFitnessScore: () => {
        const { workouts, stepsToday, sleepHours } = get();
        const workoutScore = Math.min(100, workouts.length * 10);
        const stepScore = Math.min(100, stepsToday / 100);
        const sleepScore = Math.min(100, (sleepHours / 8) * 100);
        return Math.round((workoutScore + stepScore + sleepScore) / 3);
      },
      getWorkoutsThisWeek: () => {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        const startStr = startOfWeek.toISOString().split('T')[0];
        return get().workouts.filter(w => w.date >= startStr).length;
      },
    }),
    { name: 'fitness-storage' }
  )
);
