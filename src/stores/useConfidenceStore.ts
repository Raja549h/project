import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AnalysisResult {
  date: string;
  speakingSpeed: number;
  fillerWords: number;
  confidenceScore: number;
  eyeContact: number;
  presence: number;
}

interface ConfidenceState {
  analyses: AnalysisResult[];
  addAnalysis: (result: Omit<AnalysisResult, 'date'>) => void;
  getLatestScore: () => number;
  getAverageScore: () => number;
}

export const useConfidenceStore = create<ConfidenceState>()(
  persist(
    (set, get) => ({
      analyses: [],
      addAnalysis: (result) => {
        const date = new Date().toISOString().split('T')[0];
        set((state) => ({
          analyses: [...state.analyses, { ...result, date }],
        }));
      },
      getLatestScore: () => {
        const a = get().analyses;
        return a.length > 0 ? a[a.length - 1].confidenceScore : 0;
      },
      getAverageScore: () => {
        const a = get().analyses;
        if (a.length === 0) return 0;
        return Math.round(a.reduce((s, r) => s + r.confidenceScore, 0) / a.length);
      },
    }),
    { name: 'confidence-storage' }
  )
);
