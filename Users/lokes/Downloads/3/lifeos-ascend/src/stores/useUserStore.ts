import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const RANKS = ['Beginner','Disciplined','Focused','Performer','Achiever','Elite','Master','Titan','Legend','Apex'];

function getRankFromLevel(lvl: number): string {
  if (lvl <= 5) return RANKS[0];
  return RANKS[Math.min(Math.floor(lvl / 10), 9)];
}

interface UserState {
  username: string;
  avatar: string;
  level: number;
  xp: number;
  rank: string;
  currentStreak: number;
  lifeScore: number;
  achievements: string[];
  streakFreezes: number;
  lastActiveDate: string;
  addXP: (amount: number) => void;
  setUsername: (name: string) => void;
  setAvatar: (avatar: string) => void;
  setLifeScore: (score: number) => void;
  setCurrentStreak: (streak: number) => void;
  addAchievement: (id: string) => void;
  resetProgress: () => void;
  addStreakFreeze: () => void;
  checkAndUpdateStreak: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      username: 'raja',
      avatar: '/avatar.png',
      level: 1,
      xp: 0,
      rank: 'Beginner',
      currentStreak: 0,
      lifeScore: 50,
      achievements: [],
      streakFreezes: 2,
      lastActiveDate: new Date().toISOString().split('T')[0],
      addXP: (amount) => {
        const newXP = get().xp + amount;
        const newLevel = Math.floor(Math.cbrt(newXP / 100)) + 1;
        set({
          xp: newXP,
          level: newLevel,
          rank: getRankFromLevel(newLevel),
          lastActiveDate: new Date().toISOString().split('T')[0],
        });
      },
      setUsername: (name) => set({ username: name }),
      setAvatar: (avatar) => set({ avatar }),
      setLifeScore: (score) => set({ lifeScore: score }),
      setCurrentStreak: (streak) => set({ currentStreak: streak }),
      addAchievement: (id) => {
        const { achievements } = get();
        if (!achievements.includes(id)) {
          set({ achievements: [...achievements, id] });
        }
      },
      addStreakFreeze: () => {
        set((state) => ({ streakFreezes: Math.min(state.streakFreezes + 1, 5) }));
      },
      checkAndUpdateStreak: () => {
        const { lastActiveDate, currentStreak, streakFreezes } = get();
        const today = new Date().toISOString().split('T')[0];
        if (lastActiveDate === today) return; // Already active today
        
        const lastDate = new Date(lastActiveDate);
        const todayDate = new Date(today);
        const daysDiff = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
        
        if (daysDiff === 1) {
          // Consecutive day — increment streak
          set({ currentStreak: currentStreak + 1, lastActiveDate: today });
        } else if (daysDiff === 2 && streakFreezes > 0) {
          // Missed 1 day but have a freeze — use it and keep streak
          set({ streakFreezes: streakFreezes - 1, currentStreak: currentStreak + 1, lastActiveDate: today });
        } else {
          // Streak broken
          set({ currentStreak: 1, lastActiveDate: today });
        }
      },
      resetProgress: () => set({
        username: 'raja',
        level: 1,
        xp: 0,
        rank: 'Beginner',
        currentStreak: 0,
        lifeScore: 50,
        achievements: [],
        streakFreezes: 2,
        lastActiveDate: new Date().toISOString().split('T')[0],
      }),
    }),
    { name: 'user-storage' }
  )
);
