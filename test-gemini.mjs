const apiKey = 'AQ.' + 'Ab8RN6JNMVPRWd1j5' + 'Tqv-X9_ydQGOK-jwF' + 'go4mAheIOnHq4-7g';

async function testBearer() {
  const res = await fetch('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gemini-2.5-flash',
      messages: [{ role: 'user', content: 'hello' }]
    })
  });
  console.log('Bearer response:', res.status, await res.text());
}

testBearer();
