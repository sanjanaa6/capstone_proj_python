import httpx
from typing import List, Optional, Dict, Any
import json
import re
from ..config import settings
from ..utils.prompt_templates import QUESTION_PROMPT

def parse_job_context(topic: str) -> Dict[str, str]:
    if not topic:
        return {
            "role": "Software Developer",
            "level": "Mid-Senior",
            "focus": "Comprehensive",
            "tech": "Software Systems",
            "raw_jd": ""
        }
    
    # 1. Extract Role
    role = "Software Developer"
    m_role = re.search(r"(?:Target\s*Role|Job\s*Role):\s*([^|\n,]+)", topic, re.IGNORECASE)
    if m_role and m_role.group(1).strip():
        role = re.sub(r"\(.*?\)", "", m_role.group(1).strip()).strip()
    elif "|" in topic:
        parts = [p.strip() for p in topic.split("|") if p.strip()]
        for p in parts:
            if not p.lower().startswith(("focus:", "level:", "job description", "requirements:", "responsibilities:")):
                clean_p = re.sub(r"^(?:Job\s*Role|Target\s*Role):\s*", "", p, flags=re.IGNORECASE).strip()
                clean_p = re.sub(r"\(.*?\)", "", clean_p).strip()
                if clean_p:
                    role = clean_p
                    break
    elif len(topic) < 45 and not any(k in topic.lower() for k in ["job description", "responsibilities:", "requirements:"]):
        role = topic.strip()

    # 2. Extract Level
    level = "Senior (5+ yrs)"
    m_lvl = re.search(r"Level:\s*([^|\n,]+)", topic, re.IGNORECASE)
    if m_lvl and m_lvl.group(1).strip():
        level = m_lvl.group(1).strip()

    # 3. Extract Focus
    focus = "Full-Loop Comprehensive"
    m_foc = re.search(r"Focus:\s*([^|\n,]+)", topic, re.IGNORECASE)
    if m_foc and m_foc.group(1).strip():
        focus = m_foc.group(1).strip()

    # 4. Extract Key Technologies / Keywords from raw text
    tech_matches = re.findall(r"\b(Python|FastAPI|Django|Flask|React|Node\.js|TypeScript|JavaScript|PostgreSQL|MySQL|MongoDB|Redis|Kafka|Celery|Docker|Kubernetes|AWS|GCP|Microservices|REST|GraphQL|System Design|QPS|Async)\b", topic, re.IGNORECASE)
    unique_tech = list(dict.fromkeys([t for t in tech_matches]))
    tech_str = ", ".join(unique_tech[:6]) if unique_tech else role

    return {
        "role": role,
        "level": level,
        "focus": focus,
        "tech": tech_str,
        "raw_jd": topic[:400]
    }

def _get_clean_topic_name(topic: str) -> str:
    ctx = parse_job_context(topic)
    return ctx["role"]

def extract_clean_single_question(text: str, fallback: str, raw_topic: str = "") -> str:
    if not text:
        return fallback

    # 1. Strip <think>...</think> XML blocks
    text = re.sub(r"<think>[\s\S]*?</think>", "", text, flags=re.IGNORECASE)

    # 2. If text contains thinking/reasoning intros ("Okay, the user wants...", etc.)
    reasoning_pattern = r"(?:here['’]?s\s+a\s+thinking\s+process|thinking\s+process|deconstruct\s+the\s+role|\*\*analyze\s+the\s+request|we\s+need\s+to\s+output|potential\s+question:?|thus\s+output:?|okay,\s+the\s+user\s+wants|the\s+user\s+is\s+asking)"
    
    if re.search(reasoning_pattern, text, re.IGNORECASE):
        quoted_matches = re.findall(r'"([^"\n\r]{20,})"', text)
        if quoted_matches:
            for q in reversed(quoted_matches):
                if len(q.strip()) >= 20 and not any(k in q.lower() for k in ["analyze", "deconstruct", "thinking", "strategy:", "target difficulty", "output:", "we need", "potential question"]):
                    text = q
                    break
        if re.search(reasoning_pattern, text, re.IGNORECASE):
            lines = [ln.strip().strip('"').strip("'") for ln in text.split('\n') if ln.strip()]
            for ln in reversed(lines):
                if len(ln) >= 20 and not any(k in ln.lower() for k in ["analyze", "deconstruct", "thinking", "output:", "format:", "we need", "potential question", "should we include", "make sure"]):
                    text = ln
                    break
            else:
                return fallback

    # 3. Clean headers, bullet points, markdown bold, leading quotes
    text = re.sub(r"^\s*(?:\d+[\.\)]|[-*•]|\*\*Question\s*\d*\*\*:?|Question:?)\s*", "", text, flags=re.IGNORECASE | re.MULTILINE)
    text = text.replace('\u2011', '-').replace('\u2013', '-').replace('\u2014', '--')
    text = text.replace('\u201c', '"').replace('\u201d', '"').replace('\u2018', "'").replace('\u2019', "'")
    text = text.replace('\u00a0', ' ')
    text = text.strip().strip('"').strip("'")

    # 4. Check for ugly raw topic metadata injection
    if "Job Role:" in text or "Job Description Summary:" in text or "Level:" in text or "Focus:" in text:
        clean_name = _get_clean_topic_name(raw_topic or text)
        if raw_topic and raw_topic in text:
            text = text.replace(raw_topic, clean_name)
        text = re.sub(r"Job\s*Role:.*", clean_name, text, flags=re.IGNORECASE)

    if text.lower().startswith("tell me about your experience with job role:"):
        return fallback

    # 5. Final safety check: if text still contains meta-reasoning phrases, reject it
    meta_phrases = [
        "here's a thinking", "analyze the request", "deconstruct the role", 
        "target difficulty:", "rl action strategy", "we need to output", 
        "potential question:", "thus output:"
    ]
    if any(k in text.lower() for k in meta_phrases):
        return fallback

    if len(text) < 15:
        return fallback

    return text

def _clean_text(text: str) -> str:
    if not text:
        return ""
    text = text.replace('\u2011', '-').replace('\u2013', '-').replace('\u2014', '--')
    text = text.replace('\u201c', '"').replace('\u201d', '"').replace('\u2018', "'").replace('\u2019', "'")
    text = text.replace('\u00a0', ' ')
    return text.strip()

class QuestionGenerator:
    def __init__(self):
        self.client = httpx.AsyncClient(timeout=httpx.Timeout(8.0, connect=3.0))
        self.candidate_models = [
            settings.OPENROUTER_MODEL,
            "openrouter/auto",
            "nvidia/nemotron-3-super-120b-a12b:free",
            "google/gemma-4-31b-it:free"
        ]

    async def generate_questions(self, topic: str, num_questions: int = 5) -> List[str]:
        try:
            if not settings.OPENROUTER_API_KEY:
                return self._get_fallback_questions(topic, num_questions)

            ctx = parse_job_context(topic)
            prompt = f"""You are a Lead AI Technical Interviewer conducting a technical interview for a {ctx['role']} position.

Job Context:
- Role: {ctx['role']}
- Target Level: {ctx['level']}
- Key Focus: {ctx['focus']}
- Technologies: {ctx['tech']}

Generate EXACTLY 5 high-quality, professional technical interview questions tailored for this position.

Requirements:
- Each question must be a realistic, specific scenario or technical question (e.g. system design, async pipelines, concurrency, caching, data structures).
- Do NOT output raw metadata or prompt instructions.
- Do NOT include thinking steps, internal analysis, or scratchpad text.
- NO extra labels or numbering inside array strings.

Output format (STRICT):
Return ONLY valid JSON in this exact shape:
{{
  "questions": [
    "...",
    "...",
    "...",
    "...",
    "..."
  ]
}}"""
            
            headers = {
                "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
                "X-Title": settings.APP_NAME,
            }
            if settings.OPENROUTER_HTTP_REFERER:
                headers["HTTP-Referer"] = settings.OPENROUTER_HTTP_REFERER
            
            for model_name in self.candidate_models:
                data = {
                    "model": model_name,
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
                        if parsed and len(parsed) >= 3:
                            cleaned_list = []
                            for q in parsed:
                                cq = extract_clean_single_question(q, "", raw_topic=topic)
                                if cq:
                                    cleaned_list.append(cq)
                            if len(cleaned_list) >= 3:
                                return cleaned_list[:num_questions]
                except Exception as e:
                    print(f"OpenRouter model '{model_name}' error: {e}")
                    continue
            
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
        fallback = self._get_adaptive_fallback_question(topic, difficulty, action_name, turn_index)
        if not settings.OPENROUTER_API_KEY:
            return fallback

        ctx = parse_job_context(topic)

        adaptive_prompt = f"""You are a Lead AI Technical Interviewer conducting a live technical interview for a {ctx['role']} position.

Job Context:
- Target Role: {ctx['role']}
- Target Seniority Level: {ctx['level']}
- Required Tech Stack & Keywords: {ctx['tech']}
- Target Difficulty Level: {difficulty}
- RL Action Strategy: {action_name}
- Question Turn: #{turn_index}

Task:
Generate exactly ONE concise, realistic, high-impact technical interview question tailored for a {ctx['role']} candidate at {difficulty} difficulty.

CRITICAL INSTRUCTIONS:
- Output ONLY the single final question text.
- Do NOT include thinking steps, internal analysis, scratchpads, markdown headers, bullet points, numbering, or raw metadata strings.
- Never output intro phrases like "Here is a question:" or "Okay, the user wants..."."""

        headers = {
            "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
            "X-Title": settings.APP_NAME,
        }
        if settings.OPENROUTER_HTTP_REFERER:
            headers["HTTP-Referer"] = settings.OPENROUTER_HTTP_REFERER

        for model_name in self.candidate_models:
            data = {
                "model": model_name,
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
                    choices = result.get("choices") or []
                    if choices and isinstance(choices, list) and len(choices) > 0:
                        msg = choices[0].get("message") or {}
                        q_text = msg.get("content") or ""
                        if isinstance(q_text, str) and q_text.strip():
                            clean_q = extract_clean_single_question(q_text, fallback, raw_topic=topic)
                            if clean_q and clean_q != fallback:
                                return clean_q
            except Exception as e:
                print(f"Error generating adaptive question via model '{model_name}': {e}")
                continue

        return fallback

    def _parse_questions(self, questions_text: str) -> List[str]:
        if not questions_text:
            return []

        # Strip <think>...</think> blocks
        questions_text = re.sub(r"<think>[\s\S]*?</think>", "", questions_text, flags=re.IGNORECASE)

        try:
            payload = json.loads(questions_text)
            if isinstance(payload, dict) and isinstance(payload.get("questions"), list):
                cleaned = []
                for q in payload["questions"]:
                    if isinstance(q, str):
                        q2 = _clean_text(q.strip().strip('"'))
                        if q2 and len(q2) >= 12 and not q2.lower().startswith(("user safety", "note:", "here are", "thinking")):
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
            if line_lower in {"technical", "medium", "easy", "hard", "questions:", '"questions": [', 'questions: ['} or line_lower.startswith(("user safety", "safety:", "note:", "here are", '"questions"', "here's a thinking", "analyze the request", "deconstruct the role")):
                continue
            if line and len(line) >= 12:
                questions.append(_clean_text(line))

        return questions
    
    def _get_fallback_questions(self, topic: str, num_questions: int) -> List[str]:
        ctx = parse_job_context(topic)
        role = ctx["role"]
        tech = ctx["tech"]

        fallback_questions = [
            f"How do you architect scalable, high-throughput backend services for a {role} position using {tech}?",
            f"In a high-concurrency {role} ecosystem, how do you manage distributed caching, connection pooling, and database query indexing?",
            f"Describe how you handle asynchronous task processing, queue workers, and failure recovery when building with {tech}.",
            f"Walk me through a complex production outage, memory leak, or performance bottleneck you solved as a {role}.",
            f"What design principles and anti-patterns do you prioritize when building resilient microservices for {role}?"
        ]
        return fallback_questions[:num_questions]

    def _get_adaptive_fallback_question(
        self,
        topic: str,
        difficulty: str,
        action_name: str,
        turn_index: int
    ) -> str:
        ctx = parse_job_context(topic)
        role = ctx["role"]
        tech = ctx["tech"]

        bank = {
            "Easy": [
                f"What are the key architectural components and core design patterns of a modern {role} system using {tech}?",
                f"Can you explain how state, memory allocation, and data flow operate in {role} applications built with {tech}?",
                f"What are the main advantages and trade-offs of adopting {tech} for a {role} infrastructure?"
            ],
            "Medium": [
                f"How would you optimize performance, handle connection pools, and structure data access layer in {role} services utilizing {tech}?",
                f"What are common concurrency issues or cache invalidation pitfalls in {role} systems, and how do you resolve them?",
                f"Explain how error propagation, async request pipelines, and API validation operate under high traffic in {role} systems."
            ],
            "Hard": [
                f"How do you design a high-throughput microservice architecture in {role} to handle 50k+ QPS with sub-10ms latency using {tech}?",
                f"Describe how you would diagnose and resolve a thread pool deadlock, memory leak, or cascading timeout in a {role} production cluster.",
                f"Compare the deep architectural trade-offs between sync vs async event-driven paradigms for a high-load {role} platform."
            ],
            "Expert": [
                f"Design a globally distributed, fault-tolerant cluster architecture for {role} using {tech} with zero-downtime failover and eventual consistency guarantees.",
                f"Walk me through a post-mortem analysis of a complex cascading failure in a microservices mesh for {role}, detailing your mitigation strategy.",
                f"How would you architect a zero-downtime multi-region database migration and queue worker pipeline under 50k+ QPS live load?"
            ]
        }
        
        diff_questions = bank.get(difficulty, bank["Medium"])
        if action_name == "BEHAVIORAL_TRADEOFF":
            return f"Describe a critical architectural trade-off decision as a {role} where you had to compromise between throughput latency and strong data consistency under tight deadlines."
        
        return diff_questions[(turn_index - 1) % len(diff_questions)]

async def generate_questions(topic: str):
    generator = QuestionGenerator()
    return await generator.generate_questions(topic)

async def generate_single_adaptive_question(topic: str, difficulty: str, action_name: str, turn_index: int = 1):
    generator = QuestionGenerator()
    return await generator.generate_single_adaptive_question(topic, difficulty, action_name, turn_index)
