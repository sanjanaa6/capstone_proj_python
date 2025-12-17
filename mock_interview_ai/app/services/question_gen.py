import httpx
from typing import List
import json
import re
from ..config import settings
from ..utils.prompt_templates import QUESTION_PROMPT

class QuestionGenerator:
    def __init__(self):
        self.client = httpx.AsyncClient(timeout=60)
    
    async def generate_questions(self, topic: str, num_questions: int = 5) -> List[str]:
        try:
            if not settings.OPENROUTER_API_KEY:
                return self._get_fallback_questions(topic, num_questions)

            prompt = QUESTION_PROMPT.format(topic=topic)
            
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
                response = await self.client.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers=headers,
                    json=data
                )
            except httpx.RequestError as e:
                print(f"OpenRouter request error while generating questions: {repr(e)}")
                return self._get_fallback_questions(topic, num_questions)
            
            if response.status_code == 200:
                result = response.json()
                questions_text = (
                    result.get("choices", [{}])[0]
                    .get("message", {})
                    .get("content", "")
                )
                parsed = self._parse_questions(questions_text)
                if parsed:
                    return parsed[:num_questions]
                return self._get_fallback_questions(topic, num_questions)
            else:
                raise Exception(f"OpenRouter API error: {response.status_code}")
                
        except Exception as e:
            print(f"Error generating questions: {repr(e)}")
            return self._get_fallback_questions(topic, num_questions)
    
    def _parse_questions(self, questions_text: str) -> List[str]:
        if not questions_text:
            return []

        # 1) Prefer strict JSON output
        try:
            payload = json.loads(questions_text)
            if isinstance(payload, dict) and isinstance(payload.get("questions"), list):
                cleaned = []
                for q in payload["questions"]:
                    if isinstance(q, str):
                        q2 = q.strip().strip('"')
                        if q2:
                            cleaned.append(q2)
                return cleaned
        except Exception:
            pass

        # 2) Fallback: line parsing
        questions: List[str] = []
        lines = [ln.strip() for ln in questions_text.strip().split('\n') if ln.strip()]

        for line in lines:
            # remove bullets / numbering like "1.", "10)", "-"
            line = re.sub(r"^\s*(?:\d+\s*[\.|\)]\s*|[-*•]\s+)", "", line).strip()

            # drop obvious UI-like labels
            if line.lower() in {"technical", "medium", "easy", "hard"}:
                continue
            if line and len(line) >= 12:
                questions.append(line)

        return questions
    
    def _get_fallback_questions(self, topic: str, num_questions: int) -> List[str]:
        fallback_questions = [
            f"Tell me about your experience with {topic}.",
            f"How do you handle challenges related to {topic}?",
            f"What are the best practices in {topic}?",
            f"Describe a project where you used {topic} effectively.",
            f"Where do you see {topic} heading in the future?"
        ]
        return fallback_questions[:num_questions]

# Simple function for direct usage
async def generate_questions(topic: str):
    generator = QuestionGenerator()
    return await generator.generate_questions(topic)
