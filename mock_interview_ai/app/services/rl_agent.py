import json
import random
from pathlib import Path
from typing import Dict, Any, Tuple, Optional

ACTION_NAMES = {
    0: "DECREASE_DIFFICULTY",
    1: "MAINTAIN_DEEPEN",
    2: "INCREASE_DIFFICULTY",
    3: "BEHAVIORAL_TRADEOFF"
}

DIFFICULTIES = ["Easy", "Medium", "Hard", "Expert"]

QTABLE_FILE = Path(__file__).resolve().parent.parent / "data" / "rl_qtable.json"

class RLInterviewerAgent:
    def __init__(self, alpha: float = 0.2, gamma: float = 0.9, epsilon: float = 0.15):
        self.alpha = alpha
        self.gamma = gamma
        self.epsilon = epsilon
        self.q_table: Dict[str, Dict[str, float]] = {}
        self.total_updates = 0
        self._load_qtable()

    def _load_qtable(self):
        try:
            if QTABLE_FILE.exists():
                with open(QTABLE_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.q_table = data.get("q_table", {})
                    self.total_updates = data.get("total_updates", 0)
        except Exception as e:
            print(f"Error loading Q-table: {e}")
            self.q_table = {}

    def _save_qtable(self):
        try:
            QTABLE_FILE.parent.mkdir(parents=True, exist_ok=True)
            with open(QTABLE_FILE, "w", encoding="utf-8") as f:
                json.dump({
                    "q_table": self.q_table,
                    "total_updates": self.total_updates
                }, f, indent=2)
        except Exception as e:
            print(f"Error saving Q-table: {e}")

    def get_performance_tier(self, score: Optional[float]) -> str:
        if score is None:
            return "Initial"
        if score < 5.5:
            return "Struggling"
        elif score <= 8.2:
            return "TargetZone"
        else:
            return "Mastering"

    def get_state(self, difficulty: str, score: Optional[float]) -> str:
        tier = self.get_performance_tier(score)
        return f"{difficulty}_{tier}"

    def get_q_values(self, state: str) -> Dict[int, float]:
        if state not in self.q_table:
            # Initialize Q-values with small optimistic values
            self.q_table[state] = {str(a): 1.0 for a in ACTION_NAMES.keys()}
        return {int(a): float(v) for a, v in self.q_table[state].items()}

    def select_action(self, state: str) -> Tuple[int, str, Dict[str, float]]:
        q_vals = self.get_q_values(state)
        
        # Epsilon-greedy selection
        if random.random() < self.epsilon:
            action = random.choice(list(ACTION_NAMES.keys()))
            selection_type = "Exploration"
        else:
            max_q = max(q_vals.values())
            best_actions = [a for a, q in q_vals.items() if q == max_q]
            action = random.choice(best_actions)
            selection_type = "Exploitation"

        action_name = ACTION_NAMES[action]
        q_display = {ACTION_NAMES[a]: round(q, 3) for a, q in q_vals.items()}
        return action, action_name, q_display

    def calculate_reward(
        self,
        score: float,
        previous_score: Optional[float],
        action: int,
        difficulty: str
    ) -> float:
        # Base reward for candidate staying in optimal learning zone (6.5 - 8.5)
        reward = 0.0

        if 6.5 <= score <= 8.5:
            reward += 10.0
        elif score > 8.5:
            reward += 4.0
        else:
            reward -= 4.0

        # Action alignment bonus
        tier = self.get_performance_tier(score)
        if tier == "Struggling" and action == 0:  # DECREASE_DIFFICULTY
            reward += 6.0
        elif tier == "Mastering" and action == 2:  # INCREASE_DIFFICULTY
            reward += 6.0
        elif tier == "TargetZone" and action in (1, 3):  # MAINTAIN or BEHAVIORAL
            reward += 5.0
        elif tier == "Struggling" and action == 2:  # Increased difficulty when struggling
            reward -= 8.0

        # Score delta bonus
        if previous_score is not None:
            delta = score - previous_score
            reward += delta * 2.0

        return round(reward, 2)

    def determine_next_difficulty(self, current_difficulty: str, action: int) -> str:
        idx = DIFFICULTIES.index(current_difficulty) if current_difficulty in DIFFICULTIES else 1
        
        if action == 0:  # DECREASE
            idx = max(0, idx - 1)
        elif action == 2:  # INCREASE
            idx = min(len(DIFFICULTIES) - 1, idx + 1)
        
        return DIFFICULTIES[idx]

    def update_q_value(
        self,
        state: str,
        action: int,
        reward: float,
        next_state: str
    ):
        q_vals = self.get_q_values(state)
        next_q_vals = self.get_q_values(next_state)

        old_q = q_vals[action]
        max_next_q = max(next_q_vals.values())

        # Q-learning Bellman equation update
        new_q = old_q + self.alpha * (reward + self.gamma * max_next_q - old_q)
        
        self.q_table[state][str(action)] = round(new_q, 4)
        self.total_updates += 1
        self._save_qtable()

    def get_telemetry(self) -> Dict[str, Any]:
        return {
            "q_table": self.q_table,
            "states_count": len(self.q_table),
            "total_updates": self.total_updates,
            "action_names": ACTION_NAMES,
            "current_exploration_rate": self.epsilon
        }

rl_agent = RLInterviewerAgent()
