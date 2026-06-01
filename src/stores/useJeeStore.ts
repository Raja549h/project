import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useUserStore } from './useUserStore';

export interface SubjectProgress {
  questionsSolved: number;
  correct: number;
  studyHours: number;
  chaptersCompleted: string[];
  weakTopics: string[];
  strongTopics: string[];
  revisionStatus: number;
}

interface JeeState {
  physics: SubjectProgress;
  chemistry: SubjectProgress;
  mathematics: SubjectProgress;
  addQuestions: (subject: 'physics' | 'chemistry' | 'mathematics', count: number, correct: number) => void;
  addStudyHours: (subject: 'physics' | 'chemistry' | 'mathematics', hours: number) => void;
  completeChapter: (subject: 'physics' | 'chemistry' | 'mathematics', chapter: string) => void;
  getReadiness: () => number;
}

const defaultSubject: SubjectProgress = {
  questionsSolved: 0,
  correct: 0,
  studyHours: 0,
  chaptersCompleted: [],
  weakTopics: [],
  strongTopics: [],
  revisionStatus: 0,
};

export const useJeeStore = create<JeeState>()(
  persist(
    (set, get) => ({
      physics: { ...defaultSubject },
      chemistry: { ...defaultSubject },
      mathematics: { ...defaultSubject },
      addQuestions: (subject, count, correct) => {
        set((state) => ({
          [subject]: {
            ...state[subject],
            questionsSolved: state[subject].questionsSolved + count,
            correct: state[subject].correct + correct,
          }
        }));
        useUserStore.getState().addXP(count * 2);
      },
      addStudyHours: (subject, hours) => {
        set((state) => ({
          [subject]: {
            ...state[subject],
            studyHours: state[subject].studyHours + hours,
          }
        }));
        useUserStore.getState().addXP(Math.round(hours * 15));
      },
      completeChapter: (subject, chapter) => {
        set((state) => ({
          [subject]: {
            ...state[subject],
            chaptersCompleted: [...state[subject].chaptersCompleted, chapter],
          }
        }));
        useUserStore.getState().addXP(30);
      },
      getReadiness: () => {
        const { physics, chemistry, mathematics } = get();
        const pScore = (physics.correct / Math.max(physics.questionsSolved, 1)) * 0.3
          + (physics.chaptersCompleted.length * 0.1);
        const cScore = (chemistry.correct / Math.max(chemistry.questionsSolved, 1)) * 0.3
          + (chemistry.chaptersCompleted.length * 0.1);
        const mScore = (mathematics.correct / Math.max(mathematics.questionsSolved, 1)) * 0.3
          + (mathematics.chaptersCompleted.length * 0.1);
        return Math.min(100, Math.round((pScore + cScore + mScore) * 100));
      },
    }),
    { name: 'jee-storage' }
  )
);
