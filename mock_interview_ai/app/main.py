from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.models.interview import InterviewRequest, AnswerRequest
from app.models.chat import ChatRequest
from app.services.question_gen import generate_questions
from app.services.review import review_answer
from app.services.chat import chat_reply

app = FastAPI(title="Mock Interview AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
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
