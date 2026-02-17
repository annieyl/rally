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

def save_transcript(session_id: str):
    if session_id not in sessions:
        print(f"[Warning] Session {session_id} not found")
        return {"error": "Session not found"}
    transcript = sessions[session_id] 
    # print(f"[DEBUG] Saving transcript, here are all session transcripts {sessions}")
    os.makedirs("backend/transcripts", exist_ok=True)  # Create folder if needed
    filepath = f"backend/transcripts/transcript_{session_id}.json"
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(transcript, f, indent=2)
        print(f"[DEBUG] Saved transcript to {filepath}")

    except IOError as e:
        print(f"An error occurred when writting to the file: {e}")


# TODO: delete session, etc. 