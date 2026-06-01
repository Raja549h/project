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
  addXP: (amount: number) => void;
  setUsername: (name: string) => void;
  setAvatar: (avatar: string) => void;
  setLifeScore: (score: number) => void;
  setCurrentStreak: (streak: number) => void;
  addAchievement: (id: string) => void;
  resetProgress: () => void;
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
      addXP: (amount) => {
        const newXP = get().xp + amount;
        const newLevel = Math.floor(Math.cbrt(newXP / 100)) + 1;
        set({
          xp: newXP,
          level: newLevel,
          rank: getRankFromLevel(newLevel),
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
      resetProgress: () => set({
        username: 'raja',
        level: 1,
        xp: 0,
        rank: 'Beginner',
        currentStreak: 0,
        lifeScore: 50,
        achievements: [],
      }),
    }),
    { name: 'user-storage' }
  )
);
