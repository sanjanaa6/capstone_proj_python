import json
import re
from typing import Any, Dict

import httpx
import openai

from app.config import settings
from app.utils.prompt_templates import REVIEW_PROMPT


def _extract_json(text: str) -> Dict[str, Any]:
    if not text:
        return {}
    try:
        payload = json.loads(text)
        return payload if isinstance(payload, dict) else {}
    except Exception:
        pass

    m = re.search(r"\{[\s\S]*\}", text)
    if not m:
        return {}
    try:
        payload = json.loads(m.group(0))
        return payload if isinstance(payload, dict) else {}
    except Exception:
        return {}


def _normalize_payload(payload: Dict[str, Any]) -> Dict[str, Any]:
    score = payload.get("score")
    if isinstance(score, str):
        try:
            score = float(score)
        except Exception:
            score = None
    if not isinstance(score, (int, float)):
        score = None

    strengths = payload.get("strengths")
    if isinstance(strengths, str):
        strengths = [s.strip() for s in strengths.split(",") if s.strip()]
    if not isinstance(strengths, list):
        strengths = []

    improvements = payload.get("improvements")
    if isinstance(improvements, str):
        improvements = [s.strip() for s in improvements.split(",") if s.strip()]
    if not isinstance(improvements, list):
        improvements = []

    feedback = payload.get("feedback")
    if not isinstance(feedback, str):
        feedback = ""

    confidence_tip = payload.get("confidenceTip")
    if not isinstance(confidence_tip, str):
        confidence_tip = ""

    return {
        "score": score,
        "feedback": feedback.strip(),
        "strengths": [s for s in strengths if isinstance(s, str) and s.strip()],
        "improvements": [s for s in improvements if isinstance(s, str) and s.strip()],
        "confidenceTip": confidence_tip.strip(),
    }


def review_answer(question: str, answer: str):
    ans = (answer or "").strip()
    if not ans or ans.lower() in {"no idea", "idk", "i don't know", "i dont know", "dont know", "don't know"}:
        return {
            "score": 1,
            "feedback": "Your answer is empty/unclear, so I can't evaluate your skills yet. Share what you know, then add 1-2 concrete examples.",
            "strengths": [],
            "improvements": ["Answer the question directly", "Add 1-2 concrete examples", "Mention trade-offs or constraints"],
            "confidenceTip": "Pause for a few seconds, structure your thoughts, then start with a clear high-level answer before details."
        }

    prompt = REVIEW_PROMPT.format(question=question, answer=answer)

    if settings.OPENROUTER_API_KEY:
        headers = {
            "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:5173",
            "X-Title": settings.APP_NAME,
        }
        data = {
            "model": settings.OPENROUTER_MODEL,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": settings.TEMPERATURE,
            "max_tokens": settings.MAX_TOKENS,
        }

        with httpx.Client(timeout=60) as client:
            resp = client.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=data)
            resp.raise_for_status()
            result = resp.json()
            content = (
                result.get("choices", [{}])[0]
                .get("message", {})
                .get("content", "")
            )
            payload = _extract_json(content)
            normalized = _normalize_payload(payload)
            if normalized.get("score") is not None or normalized.get("feedback") or normalized.get("strengths") or normalized.get("improvements"):
                return normalized
            return {
                "score": None,
                "feedback": content.strip(),
                "strengths": [],
                "improvements": [],
                "confidenceTip": ""
            }

    if settings.OPENAI_API_KEY:
        openai.api_key = settings.OPENAI_API_KEY
        response = openai.ChatCompletion.create(
            model=settings.OPENAI_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=settings.TEMPERATURE,
            max_tokens=settings.MAX_TOKENS,
        )
        content = response.choices[0].message.content
        payload = _extract_json(content)
        normalized = _normalize_payload(payload)
        if normalized.get("score") is not None or normalized.get("feedback") or normalized.get("strengths") or normalized.get("improvements"):
            return normalized
        return {
            "score": None,
            "feedback": (content or "").strip(),
            "strengths": [],
            "improvements": [],
            "confidenceTip": ""
        }

    return {
        "score": None,
        "feedback": "No AI API key configured. Add OPENROUTER_API_KEY (recommended) or OPENAI_API_KEY to enable scoring.",
        "strengths": [],
        "improvements": [],
        "confidenceTip": ""
    }
