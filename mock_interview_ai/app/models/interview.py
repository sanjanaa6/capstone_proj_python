from pydantic import BaseModel
from typing import List

class InterviewRequest(BaseModel):
    topic: str

class AnswerRequest(BaseModel):
    question: str
    answer: str

class ReviewResponse(BaseModel):
    score: int
    feedback: str
