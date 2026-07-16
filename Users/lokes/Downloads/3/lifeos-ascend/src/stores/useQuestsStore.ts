import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useUserStore } from './useUserStore';

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly';
  xpReward: number;
  progress: number;
  target: number;
  completed: boolean;
  claimed: boolean;
}

const DAILY_TEMPLATES = [
  { title: 'Habit Hero', description: 'Complete all today\'s habits', target: 1, xpReward: 20 },
  { title: 'Deep Work Sprint', description: 'Complete 1 hour of deep work', target: 60, xpReward: 30 },
  { title: 'Step Master', description: 'Walk 5000 steps today', target: 5000, xpReward: 15 },
  { title: 'Study Session', description: 'Study for 2 hours', target: 120, xpReward: 25 },
  { title: 'Mindful Moment', description: 'Meditate for 10 minutes', target: 10, xpReward: 10 },
];

const WEEKLY_TEMPLATES = [
  { title: 'Weekly Warrior', description: 'Complete 5 daily quests this week', target: 5, xpReward: 100 },
  { title: 'Consistency King', description: '7-day streak maintained', target: 7, xpReward: 150 },
  { title: 'Project Progress', description: 'Complete 3 project tasks', target: 3, xpReward: 80 },
];

const MONTHLY_TEMPLATES = [
  { title: '30-Day Champion', description: 'Complete all daily quests for 30 days', target: 30, xpReward: 500 },
  { title: 'Level Up', description: 'Gain 3 levels this month', target: 3, xpReward: 300 },
  { title: 'Skill Collector', description: 'Unlock 3 skill nodes', target: 3, xpReward: 200 },
];

function generateQuests(type: 'daily' | 'weekly' | 'monthly', templates: typeof DAILY_TEMPLATES, count: number): Quest[] {
  const shuffled = [...templates].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(t => ({
    id: crypto.randomUUID(),
    title: t.title,
    description: t.description,
    type,
    xpReward: t.xpReward,
    progress: 0,
    target: t.target,
    completed: false,
    claimed: false,
  }));
}

interface QuestsState {
  dailyQuests: Quest[];
  weeklyQuests: Quest[];
  monthlyQuests: Quest[];
  generateDaily: () => void;
  generateWeekly: () => void;
  generateMonthly: () => void;
  updateProgress: (questId: string, amount: number) => void;
  claimReward: (questId: string, type: 'daily' | 'weekly' | 'monthly') => void;
}

export const useQuestsStore = create<QuestsState>()(
  persist(
    (set, get) => ({
      dailyQuests: [],
      weeklyQuests: [],
      monthlyQuests: [],
      generateDaily: () => {
        set({ dailyQuests: generateQuests('daily', DAILY_TEMPLATES, 3) });
      },
      generateWeekly: () => {
        set({ weeklyQuests: generateQuests('weekly', WEEKLY_TEMPLATES, 1) });
      },
      generateMonthly: () => {
        set({ monthlyQuests: generateQuests('monthly', MONTHLY_TEMPLATES, 1) });
      },
      updateProgress: (questId, amount) => {
        set((state) => {
          const updateQuest = (q: Quest) =>
            q.id === questId
              ? { ...q, progress: Math.min(q.progress + amount, q.target), completed: q.progress + amount >= q.target }
              : q;
          return {
            dailyQuests: state.dailyQuests.map(updateQuest),
            weeklyQuests: state.weeklyQuests.map(updateQuest),
            monthlyQuests: state.monthlyQuests.map(updateQuest),
          };
        });
      },
      claimReward: (questId, type) => {
        const quest = get()[type === 'daily' ? 'dailyQuests' : type === 'weekly' ? 'weeklyQuests' : 'monthlyQuests']
          .find(q => q.id === questId);
        if (!quest || !quest.completed || quest.claimed) return;
        useUserStore.getState().addXP(quest.xpReward);
        set((state) => {
          const markClaimed = (q: Quest) => q.id === questId ? { ...q, claimed: true } : q;
          return {
            dailyQuests: state.dailyQuests.map(markClaimed),
            weeklyQuests: state.weeklyQuests.map(markClaimed),
            monthlyQuests: state.monthlyQuests.map(markClaimed),
          };
        });
      },
    }),
    { name: 'quests-storage' }
  )
);
