from fastapi import HTTPException
from openai import OpenAI, OpenAIError

from app.core.config import OPENAI_API_KEY
from app.schemas.call import CallAnalysis


client = OpenAI(api_key=OPENAI_API_KEY)


def analyze_call(text):
    try:
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
    except OpenAIError:
        raise HTTPException(
            status_code=502,
            detail="AI analysis failed. Please try again later.",
        )

    if response.output_parsed is None:
        raise HTTPException(
            status_code=502,
            detail="Call analysis returned no result",
        )

    return response.output_parsed