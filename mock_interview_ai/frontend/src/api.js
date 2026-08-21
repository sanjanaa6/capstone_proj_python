const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8001';

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

// --- REINFORCEMENT LEARNING API METHODS ---

export async function startRLInterview(payload) {
  const res = await fetch(`${BASE_URL}/rl/start-adaptive-interview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error('Failed to start RL interview');
  return res.json();
}

export async function submitRLStep(payload) {
  const res = await fetch(`${BASE_URL}/rl/submit-step`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error('Failed to submit RL step');
  return res.json();
}

export async function getRLTelemetry() {
  const res = await fetch(`${BASE_URL}/rl/telemetry`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) throw new Error('Failed to fetch RL telemetry');
  return res.json();
}
