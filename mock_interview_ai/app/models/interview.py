from pydantic import BaseModel
from typing import List, Optional

class InterviewRequest(BaseModel):
    topic: str

class AnswerRequest(BaseModel):
    question: str
    answer: str

class ReviewResponse(BaseModel):
    score: Optional[float] = None
    feedback: str = ""
    strengths: List[str] = []
    improvements: List[str] = []
    confidenceTip: str = ""
