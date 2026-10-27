import os
import tempfile

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.concurrency import run_in_threadpool
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.database import get_db
from app.models import Call, User
from app.services.analysis import analyze_call
from app.services.transcription import transcribe_audio


router = APIRouter(
    tags=["Calls"],
)


@router.post("/calls/upload")
async def upload_call(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
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
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Could not read the audio file",
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

    new_call = Call(
        user_id=current_user.id,
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
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Call).filter(Call.user_id == current_user.id)

    if priority is not None:
        query = query.filter(Call.priority == priority)

    calls = query.all()

    return calls


@router.get("/calls/{call_id}")
def get_call(
    call_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    call = (
        db.query(Call)
        .filter(
            Call.id == call_id,
            Call.user_id == current_user.id,
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
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    call = (
        db.query(Call)
        .filter(
            Call.id == call_id,
            Call.user_id == current_user.id,
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
