import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LifeDesignState {
  goals: string[];
  schedule: string;
  learningStyle: string;
  energyPattern: string;
  interests: string[];
  strengths: string[];
  weaknesses: string[];
  onboardingComplete: boolean;
  setGoals: (goals: string[]) => void;
  setSchedule: (schedule: string) => void;
  setLearningStyle: (style: string) => void;
  setEnergyPattern: (pattern: string) => void;
  setInterests: (interests: string[]) => void;
  setStrengths: (strengths: string[]) => void;
  setWeaknesses: (weaknesses: string[]) => void;
  completeOnboarding: () => void;
}

export const useLifeDesignStore = create<LifeDesignState>()(
  persist(
    (set) => ({
      goals: [],
      schedule: '',
      learningStyle: '',
      energyPattern: '',
      interests: [],
      strengths: [],
      weaknesses: [],
      onboardingComplete: false,
      setGoals: (goals) => set({ goals }),
      setSchedule: (schedule) => set({ schedule }),
      setLearningStyle: (style) => set({ learningStyle: style }),
      setEnergyPattern: (pattern) => set({ energyPattern: pattern }),
      setInterests: (interests) => set({ interests }),
      setStrengths: (strengths) => set({ strengths }),
      setWeaknesses: (weaknesses) => set({ weaknesses }),
      completeOnboarding: () => set({ onboardingComplete: true }),
    }),
    { name: 'life-design-storage' }
  )
);
