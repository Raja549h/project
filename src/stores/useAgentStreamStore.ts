import { create } from 'zustand';

export interface PendingAction {
  store: string;
  action: string;
  payload: any;
}

export interface InternalLog {
  agent: string;
  message: string;
}

export interface Message {
  id: string;
  role: 'user' | 'coach';
  content: string;
}

interface GraphData {
  nodes: any[];
  edges: any[];
  current_node: string;
}

interface AgentStreamState {
  messages: Message[];
  isStreaming: boolean;
  isPaused: boolean;
  pendingActions: PendingAction[];
  graphData: GraphData | null;
  internalLogs: InternalLog[];
  currentSessionId: string | null;
  eventSource: EventSource | null;

  addMessage: (msg: Message) => void;
  setStreaming: (status: boolean) => void;
  setPaused: (status: boolean) => void;
  setPendingActions: (actions: PendingAction[]) => void;
  setGraphData: (data: GraphData | null) => void;
  addInternalLog: (log: InternalLog) => void;
  clearInternalLogs: () => void;
  setCurrentSessionId: (id: string | null) => void;

  startStream: (prompt: string, executionMode?: string) => Promise<void>;
  intervene: (action: "pause" | "resume" | "cancel" | "override", newInstruction?: string) => Promise<void>;
  approveActions: (approved: boolean) => Promise<void>;
  disconnect: () => void;
}

export const useAgentStreamStore = create<AgentStreamState>((set, get) => ({
  messages: [],
  isStreaming: false,
  isPaused: false,
  pendingActions: [],
  graphData: null,
  internalLogs: [],
  currentSessionId: null,
  eventSource: null,

  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  setStreaming: (status) => set({ isStreaming: status }),
  setPaused: (status) => set({ isPaused: status }),
  setPendingActions: (actions) => set({ pendingActions: actions }),
  setGraphData: (data) => set({ graphData: data }),
  addInternalLog: (log) => set((state) => ({ internalLogs: [...state.internalLogs, log] })),
  clearInternalLogs: () => set({ internalLogs: [] }),
  setCurrentSessionId: (id) => set({ currentSessionId: id }),

  disconnect: () => {
    const { eventSource } = get();
    if (eventSource) {
      eventSource.close();
      set({ eventSource: null, isStreaming: false });
    }
  },

  startStream: async (prompt, executionMode = 'auto') => {
    get().disconnect();
    
    set({
      isStreaming: true,
      isPaused: false,
      pendingActions: [],
      graphData: null,
      internalLogs: [],
      currentSessionId: null
    });

    get().addMessage({
      id: Date.now().toString(),
      role: 'user',
      content: prompt
    });

    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:7860';
    const es = new EventSource(`${backendUrl}/api/v1/agent/stream?prompt=${encodeURIComponent(prompt)}&execution_mode=${executionMode}`);
    
    set({ eventSource: es });

    let assistantMsg = '';

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type) {
          switch (data.type) {
            case 'session_start':
              set({ currentSessionId: data.session_id });
              break;
            case 'approval_required':
              set({ isPaused: true, pendingActions: data.pending_actions || [] });
              break;
            case 'task_paused':
              set({ isPaused: true });
              break;
            case 'task_resumed':
              set({ isPaused: false });
              break;
            case 'routing':
              get().addInternalLog({ agent: 'Meta-Router', message: `Routing to ${data.sub_tasks_count} tasks (Intent: ${data.intent}, Complexity: ${data.complexity})` });
              break;
            case 'worker_complete':
              get().addInternalLog({ agent: `Worker (${data.intent})`, message: `Task completed.` });
              break;
            case 'synthesizing':
              get().addInternalLog({ agent: 'Synthesizer', message: `Aggregating results...` });
              break;
            case 'evaluation':
              get().addInternalLog({ agent: 'Constitutional Council', message: `Evaluation complete (Score: ${data.score}/10, Pass: ${data.pass})` });
              break;
            case 'plan_overridden':
              set({ isPaused: false, pendingActions: [] });
              get().addInternalLog({ agent: 'System', message: 'Plan overridden by user. Forcing replan...' });
              break;
            case 'graph_update':
              set({ graphData: data });
              break;
            case 'final_response':
              assistantMsg = data.response;
              get().addMessage({
                id: Date.now().toString(),
                role: 'coach',
                content: assistantMsg
              });
              break;
            case 'error':
              console.error('Agent Stream Error:', data.detail);
              get().addMessage({
                id: Date.now().toString(),
                role: 'coach',
                content: `Error: ${data.detail}`
              });
              get().disconnect();
              break;
            case 'done':
              get().disconnect();
              break;
            default:
              break;
          }
        }
      } catch (e) {
        console.error('Failed to parse SSE JSON', e);
      }
    };

    es.onerror = () => {
      get().disconnect();
    };
  },

  intervene: async (action, newInstruction) => {
    const { currentSessionId } = get();
    if (!currentSessionId) return;
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:7860';
      await fetch(`${backendUrl}/api/v1/agent/intervene`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          thread_id: currentSessionId,
          action: action,
          new_instruction: newInstruction
        })
      });
    } catch (e) {
      console.error(`Intervention ${action} failed:`, e);
    }
  },

  approveActions: async (approved) => {
    const { currentSessionId } = get();
    if (!currentSessionId) return;
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:7860';
      await fetch(`${backendUrl}/api/v1/agent/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          thread_id: currentSessionId,
          approved: approved
        })
      });
      set({ isPaused: false, pendingActions: [] });
    } catch (e) {
      console.error('Approval submission failed:', e);
    }
  }
}));
