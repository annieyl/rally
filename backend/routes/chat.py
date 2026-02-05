# /api/chat (Gemini chat)
from flask import Blueprint, request, jsonify
from services.gemini import run_chat

chat_bp = Blueprint("chat", __name__)

@chat_bp.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_query = data.get("user_query")

    if not user_query:
        return jsonify({"response": "Please enter your question."})

    response = run_chat(user_query)
    return jsonify({"response": response})
