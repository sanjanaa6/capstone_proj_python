
QUESTION_PROMPT = """
You are an expert interviewer.

Generate EXACTLY 5 high-quality interview questions for the following topic / job description:
{topic}

Requirements:
- Questions must be clear, complete sentences.
- Medium difficulty.
- Mix of practical + conceptual questions.
- NO extra labels like "Technical", "Medium", "Difficulty", or numbering.
- NO schemas/table DDL unless the topic explicitly asks for it.

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
}}
"""

REVIEW_PROMPT = """
You are an interview evaluator.
Evaluate the following answer.

Question:
{question}

Answer:
{answer}

Rules:
- If the answer is empty / "I don't know" / meaningless, do NOT give a good score. Give a low score (0-2) and explain what is missing.
- Keep feedback actionable and specific.

Output format (STRICT):
Return ONLY valid JSON in this exact shape:
{{
  "score": 0,
  "feedback": "...",
  "strengths": ["..."],
  "improvements": ["..."],
  "confidenceTip": "..."
}}
"""
