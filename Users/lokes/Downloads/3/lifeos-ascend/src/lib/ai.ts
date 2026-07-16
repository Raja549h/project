interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

async function callCloudflareFunction(messages: ChatMessage[], options?: { temperature?: number; maxTokens?: number }): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        temperature: options?.temperature ?? 0.7,
        maxTokens: options?.maxTokens ?? 1024,
      }),
      signal: controller.signal,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || `API error (${res.status})`);
    }

    const msg = data.choices?.[0]?.message;
    return msg?.content?.trim() || msg?.reasoning_content?.trim() || '';
  } finally {
    clearTimeout(timeout);
  }
}

export async function chatCompletion(
  messages: ChatMessage[],
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  return callCloudflareFunction(messages, options);
}
