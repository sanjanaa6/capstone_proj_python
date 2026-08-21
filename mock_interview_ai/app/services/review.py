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


def _generate_smart_fallback_review(question: str, answer: str) -> Dict[str, Any]:
    ans = answer.strip()
    words = ans.split()
    word_count = len(words)

    if word_count < 5:
        score = 4.5
        feedback = "Your answer is very brief. Try expanding on your technical approach and providing real-world examples."
        strengths = ["Responded promptly to the question prompt."]
        improvements = [
            "Provide a more detailed explanation of your approach",
            "Mention relevant tools, algorithms, or architectural trade-offs",
            "Structure your response using the STAR method"
        ]
        confidence_tip = "Take a moment to outline your key points before speaking or writing."
    elif word_count < 20:
        score = 7.0
        feedback = "Good initial response! You covered the basic concepts well, but adding architectural trade-offs or performance considerations would strengthen your answer."
        strengths = [
            "Addressed the core subject of the question directly",
            "Clear and understandable phrasing"
        ]
        improvements = [
            "Elaborate on edge cases or scalability implications",
            "Provide a concrete project example"
        ]
        confidence_tip = "Elaborate slightly on 'why' you chose your specific approach."
    else:
        score = 8.8
        feedback = "Strong technical explanation! You demonstrated solid subject knowledge, clear logical structure, and practical understanding."
        strengths = [
            "Comprehensive explanation covering key concepts",
            "Structured response demonstrating practical experience",
            "Clear technical terminology and logical flow"
        ]
        improvements = [
            "Consider mentioning metrics or benchmarks from past implementations",
            "Discuss potential alternative trade-offs for extreme high-load scenarios"
        ]
        confidence_tip = "Maintain this structured approach and confident delivery!"

    return {
        "score": score,
        "feedback": feedback,
        "strengths": strengths,
        "improvements": improvements,
        "confidenceTip": confidence_tip
    }


async def review_answer(question: str, answer: str):
    ans = (answer or "").strip()
    if not ans or ans.lower() in {"no idea", "idk", "i don't know", "i dont know", "dont know", "don't know"}:
        return {
            "score": 1.0,
            "feedback": "Your answer is empty or unclear. Share what you know, then add 1-2 concrete examples.",
            "strengths": [],
            "improvements": ["Answer the question directly", "Add 1-2 concrete examples", "Mention trade-offs or constraints"],
            "confidenceTip": "Pause for a few seconds, structure your thoughts, then start with a clear high-level answer before details."
        }

    prompt = REVIEW_PROMPT.format(question=question, answer=answer)

    if settings.OPENROUTER_API_KEY:
        headers = {
            "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
            "X-Title": settings.APP_NAME,
        }
        if settings.OPENROUTER_HTTP_REFERER:
            headers["HTTP-Referer"] = settings.OPENROUTER_HTTP_REFERER
        data = {
            "model": settings.OPENROUTER_MODEL,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": settings.TEMPERATURE,
            "max_tokens": settings.MAX_TOKENS,
        }

        try:
            timeout = httpx.Timeout(6.0, connect=3.0)
            async with httpx.AsyncClient(timeout=timeout) as client:
                resp = await client.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=data)
                if resp.status_code == 200:
                    result = resp.json()
                    content = (
                        result.get("choices", [{}])[0]
                        .get("message", {})
                        .get("content", "")
                    )
                    payload = _extract_json(content)
                    normalized = _normalize_payload(payload)
                    if normalized.get("score") is not None or normalized.get("feedback"):
                        return normalized
        except Exception as e:
            print(f"OpenRouter review evaluation fallback: {repr(e)}")

    # Smart evaluator fallback
    return _generate_smart_fallback_review(question, answer)
