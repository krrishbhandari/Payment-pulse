export async function sendToOpenAI(prompt: string, opts?: { model?: string; max_tokens?: number }) {
  const model = opts?.model || 'gpt-3.5-turbo';

  const res = await fetch('/api/openai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, model, max_tokens: opts?.max_tokens }),
  });

  if (!res.ok) {
    let body: any = null;
    try { body = await res.json(); } catch (e) {}
    throw new Error(body?.error || `OpenAI proxy error: ${res.status}`);
  }

  const data = await res.json();
  return data.text as string;
}
