from datetime import datetime

from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, ForeignKey

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)


class Call(Base):
    __tablename__ = "calls"

    id = Column(Integer, primary_key=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    filename = Column(String)
    language = Column(String)
    transcript = Column(Text)
    summary = Column(Text)
    category = Column(String)
    sentiment = Column(String)
    priority = Column(String)
    action_items = Column(JSON)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )