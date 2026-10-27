from typing import Literal

from pydantic import BaseModel


class CallAnalysis(BaseModel):
    summary: str

    category: Literal[
        "billing",
        "technical_support",
        "account",
        "complaint",
        "general",
    ]

    sentiment: Literal[
        "positive",
        "neutral",
        "negative",
    ]

    priority: Literal[
        "LOW",
        "MEDIUM",
        "HIGH",
    ]

    action_items: list[str]
