# Supabase client for storage and database operations
import os
import json
from datetime import datetime
from supabase import create_client, Client

# Initialize Supabase client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("[WARNING] SUPABASE_URL or SUPABASE_KEY not set in .env")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def upload_transcript_to_storage(session_id: str, transcript: list) -> str:
    """
    Upload transcript JSON to Supabase Storage
    
    Args:
        session_id: Unique session identifier
        transcript: List of message dictionaries
    
    Returns:
        Public URL of uploaded transcript
    """
    try:

        # First, pull existing transcript (if it exists)
        # Check DB to see if record with that session ID exists
        

        file_name = f"transcripts/{session_id}.json"
        file_content = json.dumps(transcript, indent=2)
        
        # Upload to storage bucket named 'transcripts'
        response = supabase.storage.from_("transcripts").upload(
            file_name,
            file_content.encode('utf-8'),
            {"content-type": "application/json", "upsert": "true"}
        )
        
        # Get public URL
        public_url = supabase.storage.from_("transcripts").get_public_url(file_name)
        print(f"[DEBUG] Uploaded transcript to: {public_url}")
        return public_url
    
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
        
        response = supabase.table("sessions").upsert(session_data).execute()
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