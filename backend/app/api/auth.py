from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models import User
from app.core.security import create_token, get_current_user, password_context
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
def get_me(
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db),
):
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
