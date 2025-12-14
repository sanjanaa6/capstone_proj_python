import openai

from app.config import settings
from app.utils.prompt_templates import REVIEW_PROMPT


def review_answer(question: str, answer: str):
    if not settings.OPENAI_API_KEY:
        return "Score: 7/10\nFeedback: Good answer. Add 1-2 concrete examples and mention trade-offs." \
            "\nStrengths: Clear communication\nImprovements: Add specifics"

    openai.api_key = settings.OPENAI_API_KEY
    prompt = REVIEW_PROMPT.format(question=question, answer=answer)

    response = openai.ChatCompletion.create(
        model=settings.OPENAI_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=settings.TEMPERATURE,
        max_tokens=settings.MAX_TOKENS,
    )

    return response.choices[0].message.content
