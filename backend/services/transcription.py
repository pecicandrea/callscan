from threading import Lock

import whisperx


_transcription_model = None
_transcription_lock = Lock()


def transcribe_audio(filename):
    global _transcription_model

    with _transcription_lock:
        if _transcription_model is None:
            _transcription_model = whisperx.load_model(
                "small",
                device="cpu",
                compute_type="int8",
            )

        result = _transcription_model.transcribe(filename)

    transcript = ""

    for segment in result["segments"]:
        transcript = transcript + " " + segment["text"].strip()

    return {
        "text": transcript.strip(),
        "language": result["language"],
    }