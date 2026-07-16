import { useState, useCallback } from 'react';
import { useUserStore } from '../stores/useUserStore';

export interface PendingAction {
  store: string;
  action: string;
  payload: any;
}

export function useAgentStream() {
  const [messages, setMessages] = useState<any[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const startStream = useCallback(async (prompt: string, executionMode: string = 'auto') => {
    setIsStreaming(true);
    setIsPaused(false);
    setPendingActions([]);
    setMessages((prev) => [...prev, { role: 'user', content: prompt }]);

    try {
      const response = await fetch('https://svrn-alpha-raja.hf.space/api/v1/agent/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          execution_mode: executionMode,
          user_context: useUserStore.getState() // Inject context
        })
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMsg = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n\n');

        for (const line of lines) {
          if (line.startsWith('event:')) {
            const eventType = line.split('event: ')[1].trim();
            const dataLine = lines[lines.indexOf(line) + 1];
            if (!dataLine || !dataLine.startsWith('data: ')) continue;
            
            const data = JSON.parse(dataLine.substring(6));

            switch (eventType) {
              case 'session_start':
                setCurrentSessionId(data.session_id);
                break;
              case 'approval_required':
                setIsPaused(true);
                setPendingActions(data.pending_actions);
                break;
              case 'task_paused':
                setIsPaused(true);
                break;
              case 'task_resumed':
                setIsPaused(false);
                break;
              case 'plan_overridden':
                setIsPaused(false);
                // Reset UI state for replan
                setPendingActions([]);
                break;
              case 'final_response':
                assistantMsg = data.response;
                setMessages((prev) => [...prev, { role: 'assistant', content: assistantMsg }]);
                // If auto mode, we might receive pending actions here to execute immediately
                if (executionMode === 'auto' && data.pending_actions) {
                  // Execute actions (handled by AiCoach component logic usually)
                }
                break;
              case 'done':
                setIsStreaming(false);
                break;
              case 'error':
                console.error("Agent Stream Error:", data.error);
                setIsStreaming(false);
                break;
            }
          }
        }
      }
    } catch (error) {
      console.error("Stream failed:", error);
      setIsStreaming(false);
    }
  }, []);

  const approveActions = useCallback(async (decision: 'approve' | 'reject') => {
    if (!currentSessionId) return;
    
    try {
      await fetch('https://svrn-alpha-raja.hf.space/api/v1/agent/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: currentSessionId,
          decision: decision
        })
      });
      setIsPaused(false);
      if (decision === 'reject') setPendingActions([]);
    } catch (e) {
      console.error("Failed to submit approval decision:", e);
    }
  }, [currentSessionId]);
  
  const intervene = useCallback(async (action: 'pause' | 'resume' | 'cancel' | 'override', newInstruction?: string) => {
    if (!currentSessionId) return;
    try {
      await fetch('https://svrn-alpha-raja.hf.space/api/v1/agent/intervene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          thread_id: currentSessionId,
          action,
          new_instruction: newInstruction
        })
      });
    } catch (e) {
      console.error(`Intervention ${action} failed:`, e);
    }
  }, [currentSessionId]);

  return { messages, isStreaming, isPaused, pendingActions, startStream, approveActions, intervene };
}
