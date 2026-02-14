# /api/chat (Gemini chat)
from flask import Blueprint, request, jsonify
from services.gemini import run_chat
from routes.transcript import add_message, save_transcript, sessions

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

    response = run_chat(user_query, sessions[session_id])
    add_message(session_id, "bot", response)

    return jsonify({"response": response})

@chat_bp.route("/transcript/save/<session_id>", methods=["POST"])
def download_transcript(session_id):
    print("[DEBUG] Calling download_transcript in chat.py")
    save_transcript(session_id)
    return session_id