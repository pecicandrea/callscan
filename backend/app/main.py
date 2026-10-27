
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, calls
from app.db.base import Base
from app.db.database import engine
from app.models import Call, User

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"message": "AI Call Analyzer is running"}

app.include_router(auth.router)
app.include_router(calls.router)