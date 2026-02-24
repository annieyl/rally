# Supabase client for storage and database operations
import os
import json
from datetime import datetime
from supabase import create_client, Client
from typing import Tuple

# Initialize Supabase client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("[WARNING] SUPABASE_URL or SUPABASE_KEY not set in .env")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def upload_transcript_to_storage(session_id: str, transcript: list) -> Tuple[str, bool, str]:
    """
    Upload transcript JSON to Supabase Storage
    
    Args:
        session_id: Unique session identifier
        transcript: List of message dictionaries
    
    Returns:
        Public URL of uploaded transcript
        Bool of if it already exists
        Session data (from DB)
    """
    try:

        # Flag
        exists = False

        # Check DB to see if record with that session ID exists
        row = get_session(session_id)
        # print(f"[DEBUG] upload_transcript_to_storage: row data is {row}")

        # Var to hold existing content
        content = ""
        file_name = f"transcripts/{session_id}.json"
        
        # If so, we'll pull the existing transcript and append to it
        if row:
            exists = True
            print(f"[DEBUG] Uploading transcript; existing one found in DB {row}")
            print(f"[DEBUG] Existing transcript is at {file_name}")
            try: 
                existing = supabase.storage.from_("transcripts").download(file_name)
                content = existing.decode("utf-8")
            except Exception:
                # If something goes wrong, just make it empty
                content = ""

        # Otherwise, we write to a new transcript

        # Generate new file content
        if content:
            existing_json = json.loads(content)
        else:
            existing_json = []
        
        combined_json = existing_json + transcript
        combined = json.dumps(combined_json, indent=2)
        # print(combined)
        
        # Upload to storage bucket named 'transcripts'
        response = supabase.storage.from_("transcripts").upload(
            file_name,
            combined.encode('utf-8'),
            {"content-type": "application/json", "upsert": "true"}
        )
        
        # Get public URL
        public_url = supabase.storage.from_("transcripts").get_public_url(file_name)
        print(f"[DEBUG] Uploaded transcript to: {public_url}")
        return exists, public_url, row
    
    except Exception as e:
        print(f"[ERROR] Failed to upload transcript: {e}")
        raise

def save_session_to_db(session_id: str, transcript_url: str, user_id: str = None) -> dict:
    """
    Save session metadata to Postgres database
    
    Args:
        session_id: Unique session identifier
        transcript_url: Public URL of uploaded transcript
        user_id: Optional user identifier
    
    Returns:
        Inserted session record
    """
    try:

        session_data = {
            "session_id": session_id,
            "transcript_url": transcript_url,
            "user_id": user_id,
            "created_at": datetime.utcnow().isoformat(),
            "ended_at": datetime.utcnow().isoformat()
        }
        
        response = supabase.table("sessions").insert(session_data).execute()
        print(f"[DEBUG] Saved session {session_id} to database")
        return response.data[0] if response.data else None
    
    except Exception as e:
        print(f"[ERROR] Failed to save session to database: {e}")
        raise

def get_session(session_id: str) -> dict:
    """Retrieve session from database"""
    try:
        response = supabase.table("sessions").select("*").eq("session_id", session_id).execute()
        return response.data[0] if response.data else None
    except Exception as e:
        print(f"[ERROR] Failed to get session: {e}")
        return None


def list_sessions(user_id: str = None) -> list:
    """List all sessions, optionally filtered by user_id"""
    try:
        query = supabase.table("sessions").select("*")
        if user_id:
            query = query.eq("user_id", user_id)
        response = query.execute()
        return response.data
    except Exception as e:
        print(f"[ERROR] Failed to list sessions: {e}")
        return []
        

def save_chat_message(session_id: str, message_id: str, sender: str, text: str = None, 
                     options: list = None, allow_other: bool = False, 
                     selected_option: str = None, custom_response: str = None) -> dict:
    """
    Save a chat message with UI state to database
    
    Args:
        session_id: Session identifier
        message_id: Unique message identifier
        sender: 'ai' or 'client'
        text: Message text
        options: List of options (for AI messages)
        allow_other: Whether other input is allowed
        selected_option: Which option was selected
        custom_response: Custom text entered for 'Other'
    
    Returns:
        Inserted message record
    """
    try:
        message_data = {
            "session_id": session_id,
            "message_id": str(message_id),
            "sender": sender,
            "text": text,
            "options": options,
            "allow_other": allow_other,
            "selected_option": selected_option,
            "custom_response": custom_response
        }
        
        response = supabase.table("chat_messages").upsert(message_data).execute()
        print(f"[DEBUG] Saved chat message {message_id} for session {session_id}")
        return response.data[0] if response.data else None
    
    except Exception as e:
        print(f"[ERROR] Failed to save chat message: {e}")
        raise

def get_chat_messages(session_id: str) -> list:
    """
    Retrieve all chat messages for a session
    
    Args:
        session_id: Session identifier
    
    Returns:
        List of chat messages ordered by timestamp
    """
    try:
        response = supabase.table("chat_messages").select("*").eq("session_id", session_id).order("timestamp", desc=False).execute()
        return response.data if response.data else []
    except Exception as e:
        print(f"[ERROR] Failed to get chat messages: {e}")
        return []