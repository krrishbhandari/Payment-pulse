export async function sendEmailReminder(payload: { to: string; subject: string; text?: string; html?: string; from?: string }) {
  const res = await fetch('/api/send-reminder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error || `Email send failed: ${res.status}`);
  }

  return res.json();
}
