import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Message {
  id: string;
  role: 'user' | 'coach';
  content: string;
  timestamp: number;
}

type CoachMode = 'Coach' | 'Planner' | 'Motivator' | 'Analyst'
  | 'Aurelius' | 'Caesar' | 'Napoleon' | 'Tesla' | 'Churchill' | 'Franklin' | 'Frankl' | 'Musk';

interface AiCoachState {
  messages: Message[];
  mode: CoachMode;
  addMessage: (role: 'user' | 'coach', content: string) => void;
  setMode: (mode: CoachMode) => void;
  clearConversation: () => void;
}

export const useAiCoachStore = create<AiCoachState>()(
  persist(
    (set, get) => ({
      messages: [],
      mode: 'Coach',
      addMessage: (role, content) => {
        const msg: Message = { id: crypto.randomUUID(), role, content, timestamp: Date.now() };
        set({ messages: [...get().messages, msg] });
      },
      setMode: (mode) => set({ mode }),
      clearConversation: () => set({ messages: [] }),
    }),
    { name: 'aicoach-storage' }
  )
);
