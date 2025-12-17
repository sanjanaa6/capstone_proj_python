const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function startInterview(payload) {
  const res = await fetch(`${BASE_URL}/start-interview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error('Failed to start interview');
  return res.json();
}

export async function submitAnswer(payload) {
  const res = await fetch(`${BASE_URL}/submit-answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error('Failed to submit answer');
  return res.json();
}

export async function chat(payload) {
  const res = await fetch(`${BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error('Chat failed');
  return res.json();
}
