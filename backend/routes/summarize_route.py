from flask import Blueprint, jsonify
from langchain_google_genai import ChatGoogleGenerativeAI
from services.supabase_client import supabase
import json

summarize_bp = Blueprint("summarize", __name__)

SUMMARIZE_PROMPT = """You are given a document that is a conversation between a product manager and a client. 

Please summarize the contents of this document into a few paragraphs with the following headings:

- High-level goals/business objectives
    - Problem they are trying to solve
        - Specific situations they anticipate
    - Concrete description of project 
    - Stakeholders
- Functional & non-functional capabilities/features
    - Each feature + how it addresses the problem + "need" vs. "nice-to-have"
    - How each feature will be implemented, technologies involved
- Technical considerations
    - Resource plan
    - Maintenance
    - Tools/frameworks
    - Tech stack
- Requirements/constraints 
    - Budget, scale, scope, etc.
- Teams/team members
- Project assumptions 
- Project deliverables
"""

@summarize_bp.route("/summarize/<session_id>", methods=["POST"])
def summarize_transcript(session_id):
    # 1. Fetch transcript from Supabase
    try:
        transcript_bytes = supabase.storage.from_("transcripts").download(
            f"transcripts/{session_id}.json"
        )
        transcript_text = transcript_bytes.decode("utf-8")
    except Exception as e:
        return jsonify({"detail": f"Transcript not found for session {session_id}: {e}"}), 404

    # 2. Format transcript for the LLM
    try:
        messages = json.loads(transcript_text)
        formatted = "\n".join(
            f"{'AI' if m['role'] == 'bot' else 'Client'}: {m['message']}"
            for m in messages
        )
    except Exception as e:
        return jsonify({"detail": f"Failed to parse transcript: {e}"}), 500

    # 3. Call Gemini
    try:
        llm = ChatGoogleGenerativeAI(model="gemini-flash-latest", temperature=0.5)
        response = llm.invoke([SUMMARIZE_PROMPT, formatted])
        summary_text = response.content
        if not isinstance(summary_text, str):
            summary_text = summary_text[0]["text"]
    except Exception as e:
        return jsonify({"detail": f"LLM summarization failed: {e}"}), 500

    # 4. Upload summary to Supabase
    try:
        supabase.storage.from_("transcripts").upload(
            f"summaries/{session_id}.txt",
            summary_text.encode("utf-8"),
            {"content-type": "text/plain", "upsert": "true"},
        )
    except Exception as e:
        return jsonify({"detail": f"Failed to upload summary: {e}"}), 500

    return jsonify({"session_id": session_id, "summary": summary_text})