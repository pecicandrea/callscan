from fastapi import FastAPI, HTTPException, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import jwt, JWTError
from starlette.concurrency import run_in_threadpool
from threading import Lock
from pathlib import Path
import secrets
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
from openai import OpenAI
from typing import Literal

import tempfile
import whisperx
import os

from database import SessionLocal
from models import Call, User

load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=api_key)

app = FastAPI()

password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

secret_path = Path(__file__).with_name(".jwt-secret")
SECRET_KEY = os.getenv("JWT_SECRET_KEY")
if not SECRET_KEY:
    try:
        with secret_path.open("x") as secret_file:
            secret_file.write(secrets.token_urlsafe(48))
    except FileExistsError:
        pass
    SECRET_KEY = secret_path.read_text().strip()
if not SECRET_KEY:
    raise RuntimeError("JWT signing secret must not be empty")
ALGORITHM = "HS256"

security = HTTPBearer()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class UserRegister(BaseModel):
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class CallAnalysis(BaseModel):
    summary: str

    category: Literal["billing", "technical_support", "account", "complaint", "general"]

    sentiment: Literal["positive", "neutral", "negative"]

    priority: Literal["LOW", "MEDIUM", "HIGH"]

    action_items: list[str]


def create_token(user_id):
    expiration = datetime.now(timezone.utc) + timedelta(hours=24)

    data = {"user_id": user_id, "exp": expiration}

    token = jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)

    return token


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials

    try:
        data = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        return data["user_id"]

    except (JWTError, KeyError, TypeError):
        raise HTTPException(status_code=401, detail="Invalid token")


@app.get("/")
def home():
    return {"message": "AI Call Analyzer is running"}


@app.post("/register")
def register(user: UserRegister):
    with SessionLocal() as db:

        existing_user = db.query(User).filter(User.email == user.email).first()

        if existing_user:

            raise HTTPException(status_code=400, detail="Email already registered")

        hashed_password = password_context.hash(user.password)

        new_user = User(email=user.email, hashed_password=hashed_password)

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        return {"id": new_user.id, "email": new_user.email}


@app.post("/login")
def login(user: UserLogin):
    with SessionLocal() as db:

        existing_user = db.query(User).filter(User.email == user.email).first()

        if existing_user is None:

            raise HTTPException(status_code=401, detail="Invalid email or password")

        password_correct = password_context.verify(
            user.password, existing_user.hashed_password
        )

        if not password_correct:

            raise HTTPException(status_code=401, detail="Invalid email or password")

        token = create_token(existing_user.id)

        return {"access_token": token, "token_type": "bearer"}


@app.get("/me")
def get_me(user_id: int = Depends(get_current_user)):
    with SessionLocal() as db:
        user = db.query(User).filter(User.id == user_id).first()

        if user is None:
            raise HTTPException(status_code=404, detail="User not found")

        return {"id": user.id, "email": user.email}


@app.get("/calls")
def get_calls(priority: str | None = None, user_id: int = Depends(get_current_user)):
    with SessionLocal() as db:

        query = db.query(Call).filter(Call.user_id == user_id)
        if priority is not None:
            query = query.filter(Call.priority == priority)

        calls = query.all()

        return calls


@app.get("/calls/{call_id}")
def get_call(call_id: int, user_id: int = Depends(get_current_user)):
    with SessionLocal() as db:

        call = (
            db.query(Call).filter(Call.id == call_id, Call.user_id == user_id).first()
        )

        if call is None:
            raise HTTPException(status_code=404, detail="Call not found")

        return call


@app.delete("/calls/{call_id}")
def delete_call(call_id: int, user_id: int = Depends(get_current_user)):
    with SessionLocal() as db:

        call = (
            db.query(Call).filter(Call.id == call_id, Call.user_id == user_id).first()
        )

        if call is None:

            raise HTTPException(status_code=404, detail="Call not found")

        db.delete(call)
        db.commit()

        return {"message": "Call deleted"}


@app.post("/calls/upload")
async def upload_call(
    file: UploadFile = File(...), user_id: int = Depends(get_current_user)
):
    if not (file.content_type or "").startswith("audio/"):
        raise HTTPException(status_code=400, detail="Only audio files are allowed")

    audio_content = await file.read()

    with tempfile.NamedTemporaryFile(delete=False, suffix=".m4a") as temp_file:
        temp_file.write(audio_content)
        temp_path = temp_file.name

    try:
        transcript = await run_in_threadpool(transcribe_audio, temp_path)
    finally:
        os.remove(temp_path)

    if not transcript["text"].strip():
        raise HTTPException(status_code=400, detail="No speech detected in audio")

    analysis = await run_in_threadpool(analyze_call, transcript["text"])

    with SessionLocal() as db:

        new_call = Call(
            user_id=user_id,
            filename=file.filename,
            language=transcript["language"],
            transcript=transcript["text"],
            summary=analysis.summary,
            category=analysis.category,
            sentiment=analysis.sentiment,
            priority=analysis.priority,
            action_items=analysis.action_items,
        )

        db.add(new_call)
        db.commit()
        db.refresh(new_call)

        return {
            "filename": file.filename,
            "size": len(audio_content),
            "transcript": transcript["text"],
            "language": transcript["language"],
            "analysis": analysis,
        }


def analyze_call(text):
    response = client.responses.parse(
        model="gpt-5-nano",
        input=f"""
Analyze this customer support call.

Write the analysis like internal notes written by a customer support agent.

Writing rules:
- Use clear and natural language.
- Keep sentences short.
- Do not use em dashes.
- Avoid overly formal or polished language.
- Do not use marketing language.
- Avoid unnecessary adjectives.
- Do not pack several points into one sentence.
- State the important information directly.

Return:
- summary
- category
- sentiment
- priority
- action_items

The summary should briefly explain what happened in the call.
Each action item should contain one clear next step.

Use these rules for priority:

LOW:
- General questions
- Informational requests
- No immediate customer impact

MEDIUM:
- Billing problems
- Duplicate charges
- Account problems
- Complaints that require action

HIGH:
- Fraud or suspected fraud
- Security problems
- Large financial loss
- Customer cannot access a critical service
- Situation requires urgent escalation

Customer call:
{text}
""",
        text_format=CallAnalysis,
    )

    if response.output_parsed is None:
        raise HTTPException(status_code=502, detail="Call analysis returned no result")

    return response.output_parsed


_transcription_model = None
_transcription_lock = Lock()


def transcribe_audio(filename):
    global _transcription_model
    with _transcription_lock:
        if _transcription_model is None:
            _transcription_model = whisperx.load_model(
                "small", device="cpu", compute_type="int8"
            )
        result = _transcription_model.transcribe(filename)

    transcript = ""

    for segment in result["segments"]:
        transcript = transcript + " " + segment["text"].strip()

    return {"text": transcript.strip(), "language": result["language"]}
