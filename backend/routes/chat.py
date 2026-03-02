# /api/chat (Gemini chat)
from flask import Blueprint, request, jsonify
import json
from services.gemini import run_chat
from routes.transcript import add_message, save_transcript
from services.supabase_client import list_sessions, get_session

chat_bp = Blueprint("chat", __name__)

@chat_bp.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_query = data.get("user_query")
    session_id = data.get("session_id")
    question = data.get("question")  # The question being answered
    selected_option = data.get("selected_option")  # The option selected
    
    print(f"[DEBUG] Chat Request - Session: {session_id}")
    print(f"[DEBUG] User Query: {user_query}")
    print(f"[DEBUG] Question: {question}")
    print(f"[DEBUG] Selected Option: {selected_option}")

    if not user_query:
        return jsonify({"response": "Please enter your question."})

    transcript = add_message(session_id, "user", user_query, question=question, selected_option=selected_option)

    response = run_chat(user_query, transcript)
    parsed = None
    response_text = response
    input_type = "text"
    options = []
    allow_other = False
    sections = []

    try:
        parsed = json.loads(response)
        response_text = parsed.get("text", response_text)
        input_type = parsed.get("inputType", input_type)
        options = parsed.get("options", options) or []
        allow_other = parsed.get("allowOther", allow_other)
        sections = parsed.get("sections", []) or []
    except Exception as e:
        print(f"[DEBUG] Failed to parse JSON: {e}")
        parsed = None

    # Format complete message for transcript including all questions
    complete_transcript_message = response_text
    
    # Add sections if they exist (for Problem Definition or multi-part questions)
    if sections:
        complete_transcript_message += "\n\n"
        for idx, section in enumerate(sections, 1):
            complete_transcript_message += f"{idx}. {section.get('question', '')}\n"
    
    # Add options if they exist (for single-question options)
    elif options:
        complete_transcript_message += "\n\nOptions:\n"
        for option in options:
            complete_transcript_message += f"- {option}\n"
    
    print(f"[DEBUG] Complete Transcript Message: {complete_transcript_message[:200]}...")
    
    add_message(session_id, "bot", complete_transcript_message)

    return jsonify({
        "response": response_text,
        "input_type": input_type,
        "options": options,
        "allow_other": allow_other,
        "sections": sections
    })

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
