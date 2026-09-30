from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, JSON, String, Text

from backend.database import Base


class Call(Base):
    __tablename__ = "calls"

    id = Column(Integer, primary_key=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
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
        default=datetime.utcnow,
    )