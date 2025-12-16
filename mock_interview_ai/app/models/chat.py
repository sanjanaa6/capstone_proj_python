from pydantic import BaseModel
from typing import List, Optional, Literal


class ChatMessage(BaseModel):
    role: Literal["system", "user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    topic: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str
