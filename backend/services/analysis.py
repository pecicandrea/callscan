import os
from typing import Literal

from fastapi import HTTPException
from openai import OpenAI
from pydantic import BaseModel


api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=api_key)


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

def analyze_call(text):
    response = client.responses.parse(
        model="gpt-5-nano",
        input=f"""
Analyze this customer support call.

Write the analysis like internal notes written by a customer support agent.

Writing rules:
- Use clear and natural language.
- Keep sentences short.
- Do not use em dashes.
- Avoid overly formal or polished language.
- Do not use marketing language.
- Avoid unnecessary adjectives.
- Do not pack several points into one sentence.
- State the important information directly.

Return:
- summary
- category
- sentiment
- priority
- action_items

The summary should briefly explain what happened in the call.
Each action item should contain one clear next step.

Use these rules for priority:

LOW:
- General questions
- Informational requests
- No immediate customer impact

MEDIUM:
- Billing problems
- Duplicate charges
- Account problems
- Complaints that require action

HIGH:
- Fraud or suspected fraud
- Security problems
- Large financial loss
- Customer cannot access a critical service
- Situation requires urgent escalation

Customer call:
{text}
""",
        text_format=CallAnalysis,
    )

    if response.output_parsed is None:
        raise HTTPException(
            status_code=502,
            detail="Call analysis returned no result",
        )

    return response.output_parsed