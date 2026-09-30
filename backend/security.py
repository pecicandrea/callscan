import os
import secrets
from datetime import datetime, timedelta, timezone
from pathlib import Path

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext


password_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)

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

def create_token(user_id):
    expiration = datetime.now(timezone.utc) + timedelta(hours=24)

    data = {
        "user_id": user_id,
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
):
    token = credentials.credentials

    try:
        data = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        return data["user_id"]

    except (JWTError, KeyError, TypeError):
        raise HTTPException(
            status_code=401,
            detail="Invalid token",
        )