interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface RequestBody {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export async function onRequest(context: { request: Request; env: { NVIDIA_API_KEY?: string } }) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (context.request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  if (context.request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...headers, 'Content-Type': 'application/json' } });
  }

  const apiKey = context.env.NVIDIA_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'NVIDIA_API_KEY not configured in Cloudflare environment variables' }), { status: 500, headers: { ...headers, 'Content-Type': 'application/json' } });
  }

  try {
    const body: RequestBody = await context.request.json();
    const model = body.model || 'meta/llama-3.1-8b-instruct';

    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: body.messages,
        temperature: body.temperature ?? 0.7,
        max_tokens: body.maxTokens ?? 1024,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return new Response(JSON.stringify({ error: `NVIDIA API error (${response.status}): ${err}` }), { status: response.status, headers: { ...headers, 'Content-Type': 'application/json' } });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), { status: 200, headers: { ...headers, 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...headers, 'Content-Type': 'application/json' } });
  }
}
