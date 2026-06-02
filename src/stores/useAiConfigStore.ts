import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const GROQ_MODELS = ['llama-3.1-8b-instant', 'llama-3.3-70b-versatile'];

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
    {
      name: 'aiconfig-storage',
      merge: (persisted, current) => {
        const p = persisted as Record<string, unknown>;
        return {
          ...current,
          apiKey: typeof p.apiKey === 'string' && !p.apiKey.startsWith('nvapi-') ? p.apiKey : '',
          model: typeof p.model === 'string' && GROQ_MODELS.includes(p.model) ? p.model : current.model,
        };
      },
    }
  )
);

export const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';
