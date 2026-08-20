import unittest
from app.services.rl_agent import RLInterviewerAgent, ACTION_NAMES

class TestRLInterviewerAgent(unittest.TestCase):
    def setUp(self):
        self.agent = RLInterviewerAgent(alpha=0.2, gamma=0.9, epsilon=0.0)

    def test_state_generation(self):
        state_initial = self.agent.get_state("Medium", None)
        self.assertEqual(state_initial, "Medium_Initial")

        state_struggling = self.agent.get_state("Hard", 4.0)
        self.assertEqual(state_struggling, "Hard_Struggling")

        state_target = self.agent.get_state("Medium", 7.5)
        self.assertEqual(state_target, "Medium_TargetZone")

        state_mastering = self.agent.get_state("Easy", 9.0)
        self.assertEqual(state_mastering, "Easy_Mastering")

    def test_reward_calculation(self):
        # Target zone score should give high base reward
        reward = self.agent.calculate_reward(score=7.5, previous_score=6.0, action=1, difficulty="Medium")
        self.assertGreater(reward, 10.0)

        # Struggling with decrease difficulty should give alignment bonus
        reward_struggle = self.agent.calculate_reward(score=4.0, previous_score=None, action=0, difficulty="Hard")
        self.assertGreater(reward_struggle, 0.0)

    def test_difficulty_adaptation(self):
        # Action 0: DECREASE_DIFFICULTY
        self.assertEqual(self.agent.determine_next_difficulty("Hard", 0), "Medium")
        self.assertEqual(self.agent.determine_next_difficulty("Easy", 0), "Easy")

        # Action 2: INCREASE_DIFFICULTY
        self.assertEqual(self.agent.determine_next_difficulty("Medium", 2), "Hard")
        self.assertEqual(self.agent.determine_next_difficulty("Expert", 2), "Expert")

    def test_q_table_update(self):
        state = "Medium_Initial"
        action = 1
        initial_q = self.agent.get_q_values(state)[action]

        self.agent.update_q_value(state, action, reward=10.0, next_state="Medium_TargetZone")
        updated_q = self.agent.get_q_values(state)[action]

        self.assertNotEqual(initial_q, updated_q)

if __name__ == "__main__":
    unittest.main()
