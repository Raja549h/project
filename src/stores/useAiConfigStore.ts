import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AiConfigState {
  apiKey: string;
  model: string;
  setApiKey: (key: string) => void;
  setModel: (model: string) => void;
}

export const useAiConfigStore = create<AiConfigState>()(
  persist(
    (set) => ({
      apiKey: '',
      model: 'llama-3.1-8b-instant',
      setApiKey: (key) => set({ apiKey: key }),
      setModel: (model) => set({ model }),
    }),
    { name: 'aiconfig-storage' }
  )
);

export const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';
