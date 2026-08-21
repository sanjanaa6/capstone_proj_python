from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.models.interview import InterviewRequest, AnswerRequest
from app.models.chat import ChatRequest
from app.models.rl import RLStartRequest, RLStepRequest, RLStepResponse, RLTelemetryResponse
from app.services.question_gen import generate_questions, generate_single_adaptive_question
from app.services.review import review_answer
from app.services.chat import chat_reply
from app.services.rl_agent import rl_agent
import asyncio
import os

app = FastAPI(title="Mock Interview AI with RL Adaptive Engine")

cors_origins_env = os.getenv("CORS_ORIGINS", "").strip()
cors_origins = ["http://localhost:5173", "http://127.0.0.1:5173"]
if cors_origins_env:
    cors_origins.extend([o.strip() for o in cors_origins_env.split(",") if o.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.post("/start-interview")
async def start_interview(data: InterviewRequest):
    questions = await generate_questions(data.topic)
    return {"questions": questions[:5]}

@app.post("/submit-answer")
async def submit_answer(data: AnswerRequest):
    review = review_answer(data.question, data.answer)
    return {"review": review}

@app.post("/review-answer")
async def review_answer_endpoint(data: AnswerRequest):
    review = review_answer(data.question, data.answer)
    return {"review": review}

@app.post("/chat")
async def chat_endpoint(data: ChatRequest):
    reply = chat_reply(data.messages, data.topic)
    return {"reply": reply}

# --- REINFORCEMENT LEARNING ENDPOINTS ---

@app.post("/rl/start-adaptive-interview")
async def start_rl_interview(data: RLStartRequest):
    initial_difficulty = "Medium"
    initial_state = rl_agent.get_state(initial_difficulty, None)
    action, action_name, q_values = rl_agent.select_action(initial_state)
    
    first_question = await generate_single_adaptive_question(
        topic=data.topic,
        difficulty=initial_difficulty,
        action_name=action_name,
        turn_index=1
    )

    return {
        "initial_question": first_question,
        "initial_difficulty": initial_difficulty,
        "initial_action": action_name,
        "chosen_action": action,
        "state": initial_state,
        "q_values": q_values
    }

@app.post("/rl/submit-step", response_model=RLStepResponse)
async def submit_rl_step(data: RLStepRequest):
    # 1. State & Action determination (< 0.0001s)
    state = rl_agent.get_state(data.current_difficulty, data.previous_score)
    action, action_name, q_values = rl_agent.select_action(state)
    new_difficulty = rl_agent.determine_next_difficulty(data.current_difficulty, action)

    # 2. Run Answer Review and Next Question Generation concurrently in parallel!
    review_task = review_answer(data.question, data.answer)
    
    if data.turn_index < data.total_questions:
        question_task = generate_single_adaptive_question(
            topic=data.topic,
            difficulty=new_difficulty,
            action_name=action_name,
            turn_index=data.turn_index + 1
        )
        review, next_question = await asyncio.gather(review_task, question_task)
    else:
        review = await review_task
        next_question = ""

    # 3. Process score & Q-Learning Bellman update
    raw_score = review.get("score")
    score = float(raw_score) if isinstance(raw_score, (int, float)) else 6.0

    reward = rl_agent.calculate_reward(
        score=score,
        previous_score=data.previous_score,
        action=action,
        difficulty=data.current_difficulty
    )
    new_state = rl_agent.get_state(new_difficulty, score)
    rl_agent.update_q_value(state, action, reward, new_state)

    explanation = f"RL Agent evaluated score ({score:.1f}/10) in state '{state}'. Selected action '{action_name}' (Reward: {reward:+.1f}). Adapted difficulty from '{data.current_difficulty}' -> '{new_difficulty}'."

    return RLStepResponse(
        score=score,
        feedback=review.get("feedback", ""),
        strengths=review.get("strengths", []),
        improvements=review.get("improvements", []),
        confidenceTip=review.get("confidenceTip", ""),
        reward=reward,
        previous_state=state,
        new_state=new_state,
        chosen_action=action,
        action_name=action_name,
        new_difficulty=new_difficulty,
        next_question=next_question,
        q_values=q_values,
        explanation=explanation
    )

@app.get("/rl/telemetry", response_model=RLTelemetryResponse)
async def get_rl_telemetry():
    telemetry = rl_agent.get_telemetry()
    return RLTelemetryResponse(**telemetry)
