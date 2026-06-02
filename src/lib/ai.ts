import { useAiConfigStore, GROQ_BASE_URL } from '@/stores/useAiConfigStore';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

async function callCloudflareFunction(messages: ChatMessage[], options?: { temperature?: number; maxTokens?: number }): Promise<string | null> {
  try {
    const { apiKey, model } = useAiConfigStore.getState();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        model,
        apiKey: apiKey || undefined,
        temperature: options?.temperature ?? 0.7,
        maxTokens: options?.maxTokens ?? 1024,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) return null;
    const data = await res.json();
    const msg = data.choices?.[0]?.message;
    return msg?.content?.trim() || msg?.reasoning_content?.trim() || '';
  } catch {
    return null;
  }
}

async function callDirectAPI(messages: ChatMessage[], options?: { temperature?: number; maxTokens?: number }): Promise<string> {
  const { apiKey, model } = useAiConfigStore.getState();
  if (!apiKey) throw new Error('API key not configured. Add it in Settings.');

  const res = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 1024,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API error (${res.status}): ${err}`);
  }

  const data = await res.json();
  const msg = data.choices?.[0]?.message;
  return msg?.content?.trim() || msg?.reasoning_content?.trim() || '';
}

export async function chatCompletion(
  messages: ChatMessage[],
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  const result = await callCloudflareFunction(messages, options);
  if (result !== null) return result;
  return callDirectAPI(messages, options);
}

export function hasValidKey(): boolean {
  return !!useAiConfigStore.getState().apiKey;
}
