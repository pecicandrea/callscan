from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth import router as auth_router
from app.api.calls import router as calls_router
from app.db.base import Base
from app.db.database import engine

from app.models.call import Call
from app.models.user import User

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CallScan",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
app.include_router(calls_router)


@app.get("/")
def root():
    return {"message": "CallScan API"}
