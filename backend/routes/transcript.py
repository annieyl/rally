# In-memory storage for chat transcriptions
# Upload to Supabase when session ends

import uuid
from collections import defaultdict
import os
import json
from services.supabase_client import upload_transcript_to_storage, save_session_to_db, get_session

# Global dict to store session titles
session_titles = {}

def get_transcript(session_id: str) -> list:
    """
    Fetch transcript from supabase.
    Args:
        session_id
    Returns:
        list containing transcript; empty if not there
    """
    from services.supabase_client import supabase  # local import to avoid circular deps

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

def add_message(session_id: str, role: str, message: str, question: str = None, selected_option: str = None):
    """
    Args:
        session_id:
        role: either "user" or "bot"
        message: 
        question: The question being answered (optional, for selections)
        selected_option: The option that was selected (optional)

    Returns:
        transcript with the new message
    """
    transcript = get_transcript(session_id)
    # For section responses, use the message directly (already formatted on frontend)
    # For simple selections, just save the selected option
    formatted_message = message
    if selected_option and not message.startswith('A:'):
        # This is a simple option selection, not section responses
        formatted_message = selected_option

    # Append new message dictionary
    message_dictionary = {"role": role, "message": formatted_message}
    transcript.append(message_dictionary)

    already_exists, transcript_url, _ = upload_transcript_to_storage(session_id, [])
    print(f"[DEBUG] Already exists? {already_exists}")
    overwrite_transcript(session_id, transcript)
    
    # Create the DB record on first message
    if not already_exists:
        print(f"[DEBUG] Does not already exist")
        file_name = f"transcripts/{session_id}.json"
        from services.supabase_client import supabase
        public_url = supabase.storage.from_("transcripts").get_public_url(file_name)
        save_session_to_db(session_id, public_url)

    return transcript
    
    # print(f"[DEBUG] Added message {message_dictionary} to session {session_id}")

def save_transcript(session_id: str, user_id: str = None, title: str = None):
    from services.supabase_client import supabase

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
    from services.supabase_client import supabase

    file_name = f"transcripts/{session_id}.json"
    content = json.dumps(transcript, indent=2).encode("utf-8")
    supabase.storage.from_("transcripts").upload(
        file_name,
        content,
        {"content-type": "application/json", "upsert": "true"},
    )
    print(f"[DEBUG] Transcript overwritten for session {session_id}")


def delete_session(session_id: str):
    # TODO: Also delete from DB
    from services.supabase_client import supabase

    file_name = f"transcripts/{session_id}.json"
    try:
        supabase.storage.from_("transcripts").remove([file_name])
        print(f"[DEBUG] Deleted transcript file for session {session_id}")
    except Exception as e:
        print(f"[WARNING] Could not delete transcript file: {e}")

def get_session_title(session_id: str):
    """Get the title for a session"""
    return session_titles.get(session_id)


def set_session_title(session_id: str, title: str):
    """Set the title for a session"""
    session_titles[session_id] = title
    print(f"[DEBUG] Set session title: {session_id} -> {title}")