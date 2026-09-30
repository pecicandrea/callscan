from fastapi import APIRouter, Depends, HTTPException

from backend.database import SessionLocal
from backend.models import Call
from backend.security import get_current_user
from backend.services.transcription import transcribe_audio
from backend.services.analysis import analyze_call
import os
import tempfile

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.concurrency import run_in_threadpool

from backend.database import SessionLocal
from backend.models import Call
from backend.security import get_current_user
from backend.services.transcription import transcribe_audio
router = APIRouter(
    tags=["Calls"],
)
@router.post("/calls/upload")
async def upload_call(
    file: UploadFile = File(...),
    user_id: int = Depends(get_current_user),
):
    if not (file.content_type or "").startswith("audio/"):
        raise HTTPException(
            status_code=400,
            detail="Only audio files are allowed",
        )

    audio_content = await file.read()

    with tempfile.NamedTemporaryFile(
        delete=False,
        suffix=".m4a",
    ) as temp_file:
        temp_file.write(audio_content)
        temp_path = temp_file.name

    try:
        transcript = await run_in_threadpool(
            transcribe_audio,
            temp_path,
        )
    finally:
        os.remove(temp_path)

    if not transcript["text"].strip():
        raise HTTPException(
            status_code=400,
            detail="No speech detected in audio",
        )

    analysis = await run_in_threadpool(
        analyze_call,
        transcript["text"],
    )

    with SessionLocal() as db:
        new_call = Call(
            user_id=user_id,
            filename=file.filename,
            language=transcript["language"],
            transcript=transcript["text"],
            summary=analysis.summary,
            category=analysis.category,
            sentiment=analysis.sentiment,
            priority=analysis.priority,
            action_items=analysis.action_items,
        )

        db.add(new_call)
        db.commit()
        db.refresh(new_call)

        return {
            "filename": file.filename,
            "size": len(audio_content),
            "transcript": transcript["text"],
            "language": transcript["language"],
            "analysis": analysis,
        }

@router.get("/calls")
def get_calls(
    priority: str | None = None,
    user_id: int = Depends(get_current_user),
):
    with SessionLocal() as db:
        query = db.query(Call).filter(Call.user_id == user_id)

        if priority is not None:
            query = query.filter(Call.priority == priority)

        calls = query.all()

        return calls
@router.get("/calls/{call_id}")
def get_call(
    call_id: int,
    user_id: int = Depends(get_current_user),
):
    with SessionLocal() as db:
        call = (
            db.query(Call)
            .filter(
                Call.id == call_id,
                Call.user_id == user_id,
            )
            .first()
        )

        if call is None:
            raise HTTPException(
                status_code=404,
                detail="Call not found",
            )

        return call
    
@router.delete("/calls/{call_id}")
def delete_call(
    call_id: int,
    user_id: int = Depends(get_current_user),
):
    with SessionLocal() as db:
        call = (
            db.query(Call)
            .filter(
                Call.id == call_id,
                Call.user_id == user_id,
            )
            .first()
        )

        if call is None:
            raise HTTPException(
                status_code=404,
                detail="Call not found",
            )

        db.delete(call)
        db.commit()

        return {"message": "Call deleted"}