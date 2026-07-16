import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useUserStore } from './useUserStore';

export interface SkillNode {
  id: string;
  name: string;
  domain: 'deep-work' | 'fitness' | 'business' | 'intelligence' | 'discipline';
  xpCost: number;
  unlocked: boolean;
  prerequisites: string[];
  level: number;
}

interface SkillState {
  skillNodes: SkillNode[];
  unlockNode: (id: string) => void;
  getNodesByDomain: (domain: string) => SkillNode[];
  getProgressByDomain: (domain: string) => number;
}

const defaultNodes: SkillNode[] = [
  { id: 'dw-1', name: 'Focus Foundation', domain: 'deep-work', xpCost: 50, unlocked: false, prerequisites: [], level: 1 },
  { id: 'dw-2', name: 'Pomodoro Master', domain: 'deep-work', xpCost: 100, unlocked: false, prerequisites: ['dw-1'], level: 1 },
  { id: 'dw-3', name: 'Flow State', domain: 'deep-work', xpCost: 200, unlocked: false, prerequisites: ['dw-2'], level: 1 },
  { id: 'ft-1', name: 'Bodyweight Basics', domain: 'fitness', xpCost: 50, unlocked: false, prerequisites: [], level: 1 },
  { id: 'ft-2', name: 'Strength Builder', domain: 'fitness', xpCost: 100, unlocked: false, prerequisites: ['ft-1'], level: 1 },
  { id: 'ft-3', name: 'Endurance Elite', domain: 'fitness', xpCost: 200, unlocked: false, prerequisites: ['ft-2'], level: 1 },
  { id: 'bz-1', name: 'Market Basics', domain: 'business', xpCost: 50, unlocked: false, prerequisites: [], level: 1 },
  { id: 'bz-2', name: 'Startup Mindset', domain: 'business', xpCost: 100, unlocked: false, prerequisites: ['bz-1'], level: 1 },
  { id: 'int-1', name: 'Memory Palace', domain: 'intelligence', xpCost: 50, unlocked: false, prerequisites: [], level: 1 },
  { id: 'int-2', name: 'Speed Reading', domain: 'intelligence', xpCost: 100, unlocked: false, prerequisites: ['int-1'], level: 1 },
  { id: 'dsc-1', name: 'Morning Ritual', domain: 'discipline', xpCost: 50, unlocked: false, prerequisites: [], level: 1 },
  { id: 'dsc-2', name: 'Habit Stacking', domain: 'discipline', xpCost: 100, unlocked: false, prerequisites: ['dsc-1'], level: 1 },
];

export const useSkillStore = create<SkillState>()(
  persist(
    (set, get) => ({
      skillNodes: defaultNodes,
      unlockNode: (id) => {
        const node = get().skillNodes.find(n => n.id === id);
        if (!node || node.unlocked) return;
        const userStore = useUserStore.getState();
        if (userStore.xp < node.xpCost) return;
        userStore.addXP(-node.xpCost);
        set((state) => ({
          skillNodes: state.skillNodes.map(n =>
            n.id === id ? { ...n, unlocked: true } : n
          ),
        }));
      },
      getNodesByDomain: (domain) => get().skillNodes.filter(n => n.domain === domain),
      getProgressByDomain: (domain) => {
        const nodes = get().skillNodes.filter(n => n.domain === domain);
        if (nodes.length === 0) return 0;
        const unlocked = nodes.filter(n => n.unlocked).length;
        return Math.round((unlocked / nodes.length) * 100);
      },
    }),
    { name: 'skills-storage' }
  )
);
