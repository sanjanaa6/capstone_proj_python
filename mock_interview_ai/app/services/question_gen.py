import httpx
from typing import List, Optional
import json
import re
from ..config import settings
from ..utils.prompt_templates import QUESTION_PROMPT

def _clean_text(text: str) -> str:
    if not text:
        return ""
    text = text.replace('\u2011', '-').replace('\u2013', '-').replace('\u2014', '--')
    text = text.replace('\u201c', '"').replace('\u201d', '"').replace('\u2018', "'").replace('\u2019', "'")
    text = text.replace('\u00a0', ' ')
    return text.strip()

class QuestionGenerator:
    def __init__(self):
        self.client = httpx.AsyncClient(timeout=httpx.Timeout(6.0, connect=3.0))
    
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
                if response.status_code == 200:
                    result = response.json()
                    questions_text = (
                        result.get("choices", [{}])[0]
                        .get("message", {})
                        .get("content", "")
                    )
                    parsed = self._parse_questions(questions_text)
                    if parsed:
                        return [_clean_text(q) for q in parsed[:num_questions] if _clean_text(q)]
            except Exception as e:
                print(f"OpenRouter request error while generating questions: {repr(e)}")
            
            return self._get_fallback_questions(topic, num_questions)
                
        except Exception as e:
            print(f"Error generating questions: {repr(e)}")
            return self._get_fallback_questions(topic, num_questions)

    async def generate_single_adaptive_question(
        self,
        topic: str,
        difficulty: str,
        action_name: str,
        turn_index: int = 1
    ) -> str:
        if not settings.OPENROUTER_API_KEY:
            return self._get_adaptive_fallback_question(topic, difficulty, action_name, turn_index)

        adaptive_prompt = f"""You are an expert AI technical interviewer conducting a live interview.
Topic / Role / Job Description: {topic}
Target Difficulty Level: {difficulty}
RL Action Strategy: {action_name}
Question Number: {turn_index}

Generate exactly ONE highly relevant, realistic technical or scenario interview question for this target difficulty ({difficulty}).
Return ONLY the single question text without markdown headers, bullet points, or numbering."""

        headers = {
            "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
            "X-Title": settings.APP_NAME,
        }
        if settings.OPENROUTER_HTTP_REFERER:
            headers["HTTP-Referer"] = settings.OPENROUTER_HTTP_REFERER

        data = {
            "model": settings.OPENROUTER_MODEL,
            "messages": [{"role": "user", "content": adaptive_prompt}],
            "temperature": settings.TEMPERATURE,
            "max_tokens": 250,
        }

        try:
            response = await self.client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers=headers,
                json=data
            )
            if response.status_code == 200:
                result = response.json()
                q_text = result.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
                if q_text:
                    cleaned = re.sub(r"^\s*(?:\d+[\.\)]|[-*•])\s*", "", q_text).strip('"').strip()
                    cleaned = _clean_text(cleaned)
                    if cleaned:
                        return cleaned
        except Exception as e:
            print(f"Error generating adaptive question via LLM: {e}")

        return self._get_adaptive_fallback_question(topic, difficulty, action_name, turn_index)

    def _parse_questions(self, questions_text: str) -> List[str]:
        if not questions_text:
            return []

        try:
            payload = json.loads(questions_text)
            if isinstance(payload, dict) and isinstance(payload.get("questions"), list):
                cleaned = []
                for q in payload["questions"]:
                    if isinstance(q, str):
                        q2 = _clean_text(q.strip().strip('"'))
                        if q2 and len(q2) >= 12 and not q2.lower().startswith(("user safety", "note:", "here are")):
                            cleaned.append(q2)
                if cleaned:
                    return cleaned
        except Exception:
            pass

        questions: List[str] = []
        lines = [ln.strip() for ln in questions_text.strip().split('\n') if ln.strip()]

        for line in lines:
            line = re.sub(r"^\s*(?:\d+\s*[\.|\)]\s*|[-*•]\s+)", "", line).strip()
            line_lower = line.lower()
            if line_lower in {"technical", "medium", "easy", "hard", "questions:", '"questions": [', 'questions: ['} or line_lower.startswith(("user safety", "safety:", "note:", "here are", '"questions"')):
                continue
            if line and len(line) >= 12:
                questions.append(_clean_text(line))

        return questions
    
    def _get_fallback_questions(self, topic: str, num_questions: int) -> List[str]:
        fallback_questions = [
            f"Explain the architectural building blocks and key concepts involved in {topic}.",
            f"How do you approach state management, performance optimization, and memory efficiency in {topic}?",
            f"What are common design anti-patterns in {topic}, and how do you prevent them in production?",
            f"Describe a challenging production bug or bottleneck you solved while working with {topic}.",
            f"How do you handle asynchronous operations, error handling, and fault tolerance in {topic}?"
        ]
        return fallback_questions[:num_questions]

    def _get_adaptive_fallback_question(
        self,
        topic: str,
        difficulty: str,
        action_name: str,
        turn_index: int
    ) -> str:
        bank = {
            "Easy": [
                f"What are the core fundamentals and primary use cases of {topic}?",
                f"Can you explain the basic syntax, execution context, and core building blocks in {topic}?",
                f"What is the primary motivation for adopting {topic} versus traditional alternatives?"
            ],
            "Medium": [
                f"How would you optimize performance and manage data structures when building with {topic}?",
                f"What are the common anti-patterns or concurrency edge cases in {topic} and how do you resolve them?",
                f"Explain how error propagation, async tasks, and validation pipelines operate in {topic}."
            ],
            "Hard": [
                f"How does {topic} handle memory allocation, garbage collection, and event loop execution under high throughput?",
                f"Describe how you would debug a memory leak or deadlocked thread pool in a {topic} production system.",
                f"Compare the underlying performance trade-offs of {topic} against an alternative architectural paradigm."
            ],
            "Expert": [
                f"Design a distributed, highly-available cluster architecture centered around {topic} with sub-10ms failover.",
                f"Walk me through a technical post-mortem analysis of a cascading failure in a {topic} microservices mesh.",
                f"How would you architect a zero-downtime database migration strategy for a high-traffic {topic} backend?"
            ]
        }
        
        diff_questions = bank.get(difficulty, bank["Medium"])
        if action_name == "BEHAVIORAL_TRADEOFF":
            return f"Describe an architectural trade-off decision involving {topic} where you had to compromise between latency and consistency under tight deadlines."
        
        return diff_questions[(turn_index - 1) % len(diff_questions)]

async def generate_questions(topic: str):
    generator = QuestionGenerator()
    return await generator.generate_questions(topic)

async def generate_single_adaptive_question(topic: str, difficulty: str, action_name: str, turn_index: int = 1):
    generator = QuestionGenerator()
    return await generator.generate_single_adaptive_question(topic, difficulty, action_name, turn_index)
