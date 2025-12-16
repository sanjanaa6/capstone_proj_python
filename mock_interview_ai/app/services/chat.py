import httpx
from typing import Optional

from app.config import settings


def chat_reply(messages, topic: Optional[str] = None) -> str:
    if not settings.OPENROUTER_API_KEY:
        return "No AI API key configured. Add OPENROUTER_API_KEY to enable the chatbot."

    sys_prefix = "You are a helpful interview preparation assistant. Answer clearly and concisely."
    if topic:
        sys_prefix = f"You are a helpful interview preparation assistant for the topic: {topic}. Answer clearly and concisely."

    prepared = [{"role": "system", "content": sys_prefix}]

    for m in messages or []:
        role = getattr(m, "role", None) or (m.get("role") if isinstance(m, dict) else None)
        content = getattr(m, "content", None) or (m.get("content") if isinstance(m, dict) else None)
        if role in {"system", "user", "assistant"} and isinstance(content, str) and content.strip():
            prepared.append({"role": role, "content": content.strip()})

    headers = {
        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": settings.APP_NAME,
    }

    data = {
        "model": settings.OPENROUTER_MODEL,
        "messages": prepared,
        "temperature": settings.TEMPERATURE,
        "max_tokens": settings.MAX_TOKENS,
    }

    try:
        with httpx.Client(timeout=60) as client:
            resp = client.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=data)
            resp.raise_for_status()
            result = resp.json()
            return (
                result.get("choices", [{}])[0]
                .get("message", {})
                .get("content", "")
                .strip()
            )
    except httpx.HTTPStatusError as e:
        return f"Chatbot API error: {e.response.status_code}. Please try again later."
    except httpx.TimeoutException:
        return "Chatbot request timed out. Please try again."
    except httpx.RequestError:
        return "Unable to reach the chatbot service (network error). Check your internet/VPN and try again."
