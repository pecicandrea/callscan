from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.core.config import ACCESS_TOKEN_EXPIRE_HOURS, ALGORITHM, SECRET_KEY
from app.db.database import get_db
from app.models.user import User


password_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)

security = HTTPBearer()


def hash_password(password: str) -> str:
    return password_context.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:
    return password_context.verify(
        plain_password,
        hashed_password,
    )


def create_access_token(user_id: int) -> str:
    expiration = datetime.now(timezone.utc) + timedelta(
        hours=ACCESS_TOKEN_EXPIRE_HOURS,
    )

    data = {
        "sub": str(user_id),
        "exp": expiration,
    }

    token = jwt.encode(
        data,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )

    return token


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
    )

    try:
        data = jwt.decode(
            credentials.credentials,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        user_id = data.get("sub")

        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.id == int(user_id)).first()

    if user is None:
        raise credentials_exception

    return user
