from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr

from backend.database import SessionLocal
from backend.models import User
from backend.security import create_token, get_current_user, password_context

router = APIRouter(
    tags=["Authentication"],
)


class UserRegister(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str


@router.post("/register")
def register(user: UserRegister):
    with SessionLocal() as db:
        existing_user = db.query(User).filter(User.email == user.email).first()

        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="Email already registered",
            )

        hashed_password = password_context.hash(user.password)

        new_user = User(
            email=user.email,
            hashed_password=hashed_password,
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        return {
            "id": new_user.id,
            "email": new_user.email,
        }
@router.post("/login")
def login(user: UserLogin):
    with SessionLocal() as db:
        existing_user = db.query(User).filter(User.email == user.email).first()

        if existing_user is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password",
            )

        password_correct = password_context.verify(
            user.password,
            existing_user.hashed_password,
        )

        if not password_correct:
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password",
            )

        token = create_token(existing_user.id)

        return {
            "access_token": token,
            "token_type": "bearer",
        }
        
@router.get("/me")
def get_me(user_id: int = Depends(get_current_user)):
    with SessionLocal() as db:
        user = db.query(User).filter(User.id == user_id).first()

        if user is None:
            raise HTTPException(
                status_code=404,
                detail="User not found",
            )

        return {
            "id": user.id,
            "email": user.email,
        }