# /api/chat (Gemini chat)
from flask import Blueprint, request, jsonify
from services.gemini import run_chat
from routes.transcript import add_message, save_transcript
from services.supabase import list_sessions, get_session, save_chat_message, get_chat_messages

chat_bp = Blueprint("chat", __name__)

@chat_bp.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_query = data.get("user_query")
    session_id = data.get("session_id")
    print(f"[DEBUG] Current Session ID: {session_id}")

    if not user_query:
        return jsonify({"response": "Please enter your question."})

    transcript = add_message(session_id, "user", user_query)

    response = run_chat(user_query, transcript)
    add_message(session_id, "bot", response)

    return jsonify({"response": response})

@chat_bp.route("/chat/message", methods=["POST"])
def save_message():
    """
    Save a chat message with selection state
    """
    data = request.get_json()
    session_id = data.get("session_id")
    message_id = data.get("message_id")
    sender = data.get("sender")
    text = data.get("text")
    options = data.get("options")
    allow_other = data.get("allow_other", False)
    selected_option = data.get("selected_option")
    custom_response = data.get("custom_response")
    
    if not session_id or not message_id:
        return jsonify({"error": "session_id and message_id required"}), 400
    
    try:
        message = save_chat_message(
            session_id=session_id,
            message_id=message_id,
            sender=sender,
            text=text,
            options=options,
            allow_other=allow_other,
            selected_option=selected_option,
            custom_response=custom_response
        )
        return jsonify({"success": True, "message": message}), 200
    except Exception as e:
        print(f"[ERROR] Failed to save message: {e}")
        return jsonify({"error": str(e)}), 500

@chat_bp.route("/chat/messages/<session_id>", methods=["GET"])
def get_messages(session_id):

    """
    Get all chat messages for a session with selection state
    """
    
    try:
        messages = get_chat_messages(session_id)
        return jsonify(messages), 200


    except Exception as e:
        print(f"[ERROR] Failed to fetch messages: {e}")
        error_message = str(e)
        return jsonify({"error": error_message}), 500

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
    result = save_transcript(session_id)
    if "error" in result:
        return jsonify(result), 500
    return jsonify(result), 200

@chat_bp.route("/sessions", methods=["GET"])
def get_sessions():
    """
    Get all sessions from database
    """
    try:
        sessions = list_sessions()
        return jsonify(sessions), 200
    except Exception as e:
        print(f"[ERROR] Failed to fetch sessions: {e}")
        return jsonify({"error": str(e)}), 500

@chat_bp.route("/session/<session_id>", methods=["GET"])
def get_session_detail(session_id):
    """
    Get specific session details
    """
    try:
        session = get_session(session_id)
        if not session:
            return jsonify({"error": "Session not found"}), 404
        return jsonify(session), 200
    except Exception as e:
        print(f"[ERROR] Failed to fetch session: {e}")
        return jsonify({"error": str(e)}), 500
