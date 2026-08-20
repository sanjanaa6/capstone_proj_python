from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class RLStartRequest(BaseModel):
    topic: str
    num_questions: Optional[int] = 5

class RLStepRequest(BaseModel):
    topic: str
    question: str
    answer: str
    previous_score: Optional[float] = None
    current_difficulty: str = "Medium"
    turn_index: int = 1
    total_questions: int = 5
    q_table: Optional[Dict[str, Dict[str, float]]] = None

class RLStepResponse(BaseModel):
    score: Optional[float] = None
    feedback: str = ""
    strengths: List[str] = []
    improvements: List[str] = []
    confidenceTip: str = ""
    reward: float = 0.0
    previous_state: str = ""
    new_state: str = ""
    chosen_action: int = 1
    action_name: str = ""
    new_difficulty: str = "Medium"
    next_question: str = ""
    q_values: Dict[str, float] = {}
    explanation: str = ""

class RLTelemetryResponse(BaseModel):
    q_table: Dict[str, Dict[str, float]]
    states_count: int
    total_updates: int
    action_names: Dict[int, str]
    current_exploration_rate: float
