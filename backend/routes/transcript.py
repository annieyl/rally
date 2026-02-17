# In-memory storage for chat transcriptions
# Upload to Supabase when session ends

import uuid
from collections import defaultdict
import os
import json
from services.supabase import upload_transcript_to_storage, save_session_to_db

# Global dict to store all sessions (for now)
# {"123": [{"role": "user", "message": "Hi"}, {"role": "bot", "message": "Hi"}]}
sessions = defaultdict(list)

def add_message(session_id: str, role: str, message: str):
    """
    Append message to sessions dictionary.
    Args:
        session_id:
        role: either "user" or "bot"
        message: 
    """
    # Check if session exists, if not, warn
    if not session_id in sessions:
        print("[WARNING] Session ID not found, this is a new session.")

    # Append new message dictionary
    message_dictionary = {"role": role, "message": message}
    sessions[session_id].append(message_dictionary)
    

    
    # print(f"[DEBUG] Added message {message_dictionary} to session {session_id}")

def save_transcript(session_id: str, user_id: str = None):
    if session_id not in sessions:
        print(f"[Warning] Session {session_id} not found")
        return {"error": "Session not found"}
    transcript = sessions[session_id] 

    try:
        # Upload transcript JSON to Supabase Storage
        transcript_url = upload_transcript_to_storage(session_id, transcript)
        session_data = save_session_to_db(session_id, transcript_url, user_id=user_id)

        # Keep session in memory - don't delete it
        # This allows continued chatting and periodic saves
        print(f"[DEBUG] Transcript saved for session {session_id}, kept in memory for future messages")
        
        return  {
            "session_id": session_id,
            "transcript_url": transcript_url,
            "session_data": session_data
        }
    
    except Exception as e:
        print(f"[ERROR] Failed to save transcript: {e}")
        return {"error": "Failed to save transcript"}


# TODO: delete session, etc. 

def delete_session(session_id: str):
    if session_id in sessions:
        del sessions[session_id]
        print(f"[DEBUG] Deleted session {session_id}")
    else:
        print(f"[WARNING] Tried to delete non-existent session {session_id}")