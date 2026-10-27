from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models import User
from app.core.security import (
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
)
from app.schemas.user import UserLogin, UserRegister

router = APIRouter(
    tags=["Authentication"],
)


@router.post("/register")
def register(
    user: UserRegister,
    db: Session = Depends(get_db),
):
    existing_user = db.query(User).filter(User.email == user.email).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered",
        )

    new_user = User(
        email=user.email,
        hashed_password=hash_password(user.password),
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "id": new_user.id,
        "email": new_user.email,
    }


@router.post("/login")
def login(
    user: UserLogin,
    db: Session = Depends(get_db),
):
    existing_user = db.query(User).filter(User.email == user.email).first()

    if existing_user is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    password_correct = verify_password(
        user.password,
        existing_user.hashed_password,
    )

    if not password_correct:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    token = create_access_token(existing_user.id)

    return {
        "access_token": token,
        "token_type": "bearer",
    }


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
    }
