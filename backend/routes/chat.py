# /api/chat (Gemini chat)
from flask import Blueprint, request, jsonify
from services.gemini import run_chat
from routes.transcript import add_message, save_transcript

chat_bp = Blueprint("chat", __name__)

@chat_bp.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_query = data.get("user_query")
    session_id = data.get("session_id")
    print(f"[DEBUG] Current Session ID: {session_id}")

    if not user_query:
        return jsonify({"response": "Please enter your question."})

    add_message(session_id, "user", user_query)

    response = run_chat(user_query)
    add_message(session_id, "bot", response)

    return jsonify({"response": response})

@chat_bp.route("/transcript/upload", methods=["POST"])
def upload_transcript():
    """
    Upload transcript to Supabase and save session to Postgres
    """
    data = request.get_json()
    session_id = data.get("session_id")
    user_id = data.get("user_id")  # Optional
    
    if not session_id:
        return jsonify({"error": "session_id required"}), 400
    
    print(f"[DEBUG] Uploading transcript for session {session_id}")
    result = save_transcript(session_id, user_id)
    
    if "error" in result:
        return jsonify(result), 500
    
    return jsonify(result), 200

@chat_bp.route("/transcript/save/<session_id>", methods=["POST"])
def download_transcript(session_id):
    """
    Deprecated: Use /api/transcript/upload instead
    """
    print("[WARNING] download_transcript is deprecated, use /api/transcript/upload")
    return upload_transcript()
