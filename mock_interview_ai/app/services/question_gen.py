import httpx
from typing import List, Optional
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

    async def generate_single_adaptive_question(
        self,
        topic: str,
        difficulty: str,
        action_name: str,
        turn_index: int = 1
    ) -> str:
        if not settings.OPENROUTER_API_KEY:
            return self._get_adaptive_fallback_question(topic, difficulty, action_name, turn_index)

        adaptive_prompt = f"""You are an AI interviewer using Reinforcement Learning to dynamically adjust interview difficulty.
Topic: {topic}
Target Difficulty Level: {difficulty}
RL Action Strategy: {action_name}
Question Number: {turn_index}

Generate exactly ONE technical/interview question suited for this exact difficulty level ({difficulty}) and strategy ({action_name}).
Return ONLY the question text in plain text without markdown or numbering."""

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
                    return re.sub(r"^\s*(?:\d+[\.\)]|[-*•])\s*", "", q_text).strip('"').strip()
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
                        q2 = q.strip().strip('"')
                        if q2:
                            cleaned.append(q2)
                return cleaned
        except Exception:
            pass

        questions: List[str] = []
        lines = [ln.strip() for ln in questions_text.strip().split('\n') if ln.strip()]

        for line in lines:
            line = re.sub(r"^\s*(?:\d+\s*[\.|\)]\s*|[-*•]\s+)", "", line).strip()
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

    def _get_adaptive_fallback_question(
        self,
        topic: str,
        difficulty: str,
        action_name: str,
        turn_index: int
    ) -> str:
        bank = {
            "Easy": [
                f"What are the fundamental concepts of {topic}?",
                f"Can you explain the basic syntax and core building blocks in {topic}?",
                f"What is the primary purpose of {topic} and when would you use it?"
            ],
            "Medium": [
                f"How would you optimize performance and manage state when working with {topic}?",
                f"What are the common pitfalls or anti-patterns in {topic} and how do you avoid them?",
                f"Explain how error handling and asynchronous operations work in {topic}."
            ],
            "Hard": [
                f"How does {topic} handle memory management and execution context under high load?",
                f"Describe a complex architectural edge case in {topic} and how you solved it.",
                f"Compare the underlying algorithms or data structures powering {topic} with an alternative approach."
            ],
            "Expert": [
                f"Design a distributed, highly-available system centered around {topic} with fault-tolerance mechanisms.",
                f"Walk me through a post-mortem analysis of a critical failure involving {topic} in production.",
                f"How would you design a custom framework layer on top of {topic} to scale across multi-region clusters?"
            ]
        }
        
        diff_questions = bank.get(difficulty, bank["Medium"])
        if action_name == "BEHAVIORAL_TRADEOFF":
            return f"Describe a architectural trade-off decision you had to make involving {topic} under tight deadline constraints."
        
        return diff_questions[(turn_index - 1) % len(diff_questions)]

async def generate_questions(topic: str):
    generator = QuestionGenerator()
    return await generator.generate_questions(topic)

async def generate_single_adaptive_question(topic: str, difficulty: str, action_name: str, turn_index: int = 1):
    generator = QuestionGenerator()
    return await generator.generate_single_adaptive_question(topic, difficulty, action_name, turn_index)
