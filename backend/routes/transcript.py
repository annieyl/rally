# In-memory storage for chat transcriptions
# Upload to Supabase when session ends

import uuid
from collections import defaultdict
import os
import json
from services.supabase_client import upload_transcript_to_storage, save_session_to_db, get_session


def get_transcript(session_id: str) -> list:
    """
    Fetch transcript from supabase.
    Args:
        session_id
    Returns:
        list containing transcript; empty if not there
    """
    from backend.services.supabase_client import supabase  # local import to avoid circular deps

    session = get_session(session_id)
    if not session:
        return []

    file_name = f"transcripts/{session_id}.json"
    try:
        existing = supabase.storage.from_("transcripts").download(file_name)
        return json.loads(existing.decode("utf-8"))
    except Exception as e:
        print(f"[WARNING] Could not load transcript for {session_id}: {e}")
        return []

def add_message(session_id: str, role: str, message: str) -> list:
    """
    Append message to sessions dictionary.
    Args:
        session_id:
        role: either "user" or "bot"
        message: 
    Returns:
        Full updated transcript list
    """
    transcript = get_transcript(session_id)
    transcript.append({"role": role, "message": message})

    already_exists, transcript_url, _ = upload_transcript_to_storage(session_id, [])
    overwrite_transcript(session_id, transcript)
    
    # Create the DB record on first message
    if not already_exists:
        file_name = f"transcripts/{session_id}.json"
        from backend.services.supabase_client import supabase
        public_url = supabase.storage.from_("transcripts").get_public_url(file_name)
        save_session_to_db(session_id, public_url)

    return transcript

def save_transcript(session_id: str, user_id: str = None):
    from backend.services.supabase_client import supabase

    file_name = f"transcripts/{session_id}.json"
    transcript_url = supabase.storage.from_("transcripts").get_public_url(file_name)

    session = get_session(session_id)
    if not session:
        session = save_session_to_db(session_id, transcript_url, user_id=user_id)

    return {
        "session_id": session_id,
        "transcript_url": transcript_url,
        "session_data": session,
    }

def overwrite_transcript(session_id: str, transcript: list):
    from backend.services.supabase_client import supabase

    file_name = f"transcripts/{session_id}.json"
    content = json.dumps(transcript, indent=2).encode("utf-8")
    supabase.storage.from_("transcripts").upload(
        file_name,
        content,
        {"content-type": "application/json", "upsert": "true"},
    )
    print(f"[DEBUG] Transcript overwritten for session {session_id}")

# TODO: delete session, etc. 

def delete_session(session_id: str):
    # TODO: Also delete from DB
    from backend.services.supabase_client import supabase

    file_name = f"transcripts/{session_id}.json"
    try:
        supabase.storage.from_("transcripts").remove([file_name])
        print(f"[DEBUG] Deleted transcript file for session {session_id}")
    except Exception as e:
        print(f"[WARNING] Could not delete transcript file: {e}")