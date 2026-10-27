import os
import secrets
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()


DATABASE_URL = os.getenv("DATABASE_URL")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24


secret_path = Path(__file__).resolve().parents[2] / ".jwt-secret"

if not SECRET_KEY:
    try:
        with secret_path.open("x") as secret_file:
            secret_file.write(secrets.token_urlsafe(48))
    except FileExistsError:
        pass

    SECRET_KEY = secret_path.read_text().strip()


if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is missing in .env")

if not OPENAI_API_KEY:
    raise RuntimeError("OPENAI_API_KEY is missing in .env")

if not SECRET_KEY:
    raise RuntimeError("JWT signing secret must not be empty")
