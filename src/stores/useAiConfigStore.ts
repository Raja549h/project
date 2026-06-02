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
      model: 'meta/llama-3.1-8b-instruct',
      setApiKey: (key) => set({ apiKey: key }),
      setModel: (model) => set({ model }),
    }),
    { name: 'aiconfig-storage' }
  )
);

export const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1';
