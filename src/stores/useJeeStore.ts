import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useUserStore } from './useUserStore';

export interface ChapterDetail {
  id: string;
  name: string;
  weightage: 'High' | 'Medium' | 'Low';
  nextReviewDate: string; // ISO date string
}

export interface SubjectProgress {
  questionsSolved: number;
  correct: number;
  studyHours: number;
  chaptersCompleted: (string | ChapterDetail)[];
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
  completeChapter: (subject: 'physics' | 'chemistry' | 'mathematics', chapter: string, weightage: 'High' | 'Medium' | 'Low') => void;
  reviewChapter: (subject: 'physics' | 'chemistry' | 'mathematics', chapterId: string, success: boolean) => void;
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
      completeChapter: (subject, name, weightage = 'Medium') => {
        const newChapter: ChapterDetail = {
          id: Math.random().toString(36).substring(7),
          name,
          weightage,
          nextReviewDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Review tomorrow
        };
        set((state) => ({
          [subject]: {
            ...state[subject],
            chaptersCompleted: [...state[subject].chaptersCompleted, newChapter],
          }
        }));
        useUserStore.getState().addXP(weightage === 'High' ? 50 : 30);
      },
      reviewChapter: (subject, chapterId, success) => {
        set((state) => {
          const updatedChapters = state[subject].chaptersCompleted.map((ch) => {
            if (typeof ch === 'string') return ch;
            if (ch.id === chapterId) {
              const daysToAdd = success ? 3 : 1;
              return {
                ...ch,
                nextReviewDate: new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000).toISOString(),
              };
            }
            return ch;
          });
          return {
            [subject]: { ...state[subject], chaptersCompleted: updatedChapters }
          };
        });
        if (success) useUserStore.getState().addXP(20);
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
