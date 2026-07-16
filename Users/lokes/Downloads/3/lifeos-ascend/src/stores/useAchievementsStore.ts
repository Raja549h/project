import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (state: any) => boolean;
}

interface AchievementsState {
  achievements: Achievement[];
  getAchievementById: (id: string) => Achievement | undefined;
}

// Define achievements as a factory so we can check conditions
export const ACHIEVEMENTS_LIST: Omit<Achievement, 'condition'>[] = [
  { id: 'first-habit', name: 'First Step', description: 'Complete your first habit', icon: '🎯' },
  { id: '7-day-streak', name: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '🔥' },
  { id: '30-day-streak', name: 'Monthly Master', description: 'Maintain a 30-day streak', icon: '💪' },
  { id: 'deep-work-10', name: 'Focus Apprentice', description: 'Complete 10 hours of deep work', icon: '🧠' },
  { id: 'deep-work-50', name: 'Focus Sage', description: 'Complete 50 hours of deep work', icon: '⚡' },
  { id: 'jee-100', name: 'Problem Solver', description: 'Solve 100 JEE questions', icon: '📐' },
  { id: 'jee-500', name: 'Math Warrior', description: 'Solve 500 JEE questions', icon: '🏆' },
  { id: 'fitness-10', name: 'Getting Fit', description: 'Complete 10 workouts', icon: '🏋️' },
  { id: 'fitness-50', name: 'Fitness Enthusiast', description: 'Complete 50 workouts', icon: '💪' },
  { id: 'level-5', name: 'Rising Star', description: 'Reach level 5', icon: '⭐' },
  { id: 'level-10', name: 'Elite Performer', description: 'Reach level 10', icon: '👑' },
  { id: 'project-1', name: 'Project Starter', description: 'Complete your first project milestone', icon: '📦' },
  { id: 'project-5', name: 'Project Master', description: 'Complete 5 project milestones', icon: '🏗️' },
  { id: 'skill-1', name: 'Skill Seeker', description: 'Unlock your first skill node', icon: '🌱' },
  { id: 'skill-5', name: 'Skill Collector', description: 'Unlock 5 skill nodes', icon: '🌳' },
  { id: '1000-xp', name: 'Century', description: 'Earn 1000 total XP', icon: '💎' },
  { id: '5000-xp', name: 'Powerhouse', description: 'Earn 5000 total XP', icon: '💠' },
  { id: 'perfect-day', name: 'Perfect Day', description: 'Complete all habits in a day', icon: '🌟' },
  { id: 'life-score-80', name: 'Life Balanced', description: 'Reach Life Score of 80', icon: '⚖️' },
];

export const useAchievementsStore = create<AchievementsState>()(
  persist(
    (set, get) => ({
      achievements: ACHIEVEMENTS_LIST.map(a => ({
        ...a,
        condition: () => false,
      })),
      getAchievementById: (id) => get().achievements.find(a => a.id === id),
    }),
    { name: 'achievements-storage' }
  )
);
