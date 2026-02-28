from flask import Blueprint, jsonify
from langchain_google_genai import ChatGoogleGenerativeAI
from services.supabase_client import supabase
import json

summarize_bp = Blueprint("summarize", __name__)

# TODO: Make this read from prompts text file
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

REGERENERATE_PROMPT = """You are given:
1. A conversation transcript between a product manager and a client
2. An initial AI-generated summary of that conversation
3. A set of reviewer comments, each tied to a highlighted portion of the summary

Your task is to produce an improved summary that incorporates the reviewer's feedback.
For each comment, consider the highlighted text it refers to and revise that section accordingly.
Keep the same heading structure as the original summary.

---
TRANSCRIPT:
{transcript}

---
INITIAL SUMMARY:
{summary}

---
REVIEWER COMMENTS:
{comments}

---
Now write the improved summary:
"""

# Helper functions for doing summary editing
def _fetch_and_format_transcript(session_id: str):
    """Download and format transcript from Supabase. Returns (formatted_str, error_response)."""
    try:
        transcript_bytes = supabase.storage.from_("transcripts").download(
            f"transcripts/{session_id}.json"
        )
        transcript_text = transcript_bytes.decode("utf-8")
    except Exception as e:
        return None, (jsonify({"detail": f"Transcript not found for session {session_id}: {e}"}), 404)

    try:
        messages = json.loads(transcript_text)
        formatted = "\n".join(
            f"{'AI' if m['role'] == 'bot' else 'Client'}: {m['message']}"
            for m in messages
        )
        return formatted, None
    except Exception as e:
        return None, (jsonify({"detail": f"Failed to parse transcript: {e}"}), 500)


def _call_llm(prompt: str) -> tuple[str | None, tuple | None]:
    """Invoke Gemini with a raw prompt string. Returns (text, error_response)."""
    try:
        llm = ChatGoogleGenerativeAI(model="gemini-flash-latest", temperature=0.5)
        response = llm.invoke([prompt])
        text = response.content
        if not isinstance(text, str):
            text = text[0]["text"]
        return text, None
    except Exception as e:
        return None, (jsonify({"detail": f"LLM call failed: {e}"}), 500)


def _upload_summary(session_id: str, summary_text: str):
    """Upload summary text to Supabase storage."""
    supabase.storage.from_("transcripts").upload(
        f"summaries/{session_id}.txt",
        summary_text.encode("utf-8"),
        {"content-type": "text/plain", "upsert": "true"},
    )


def save_summary_iteration(session_id: str, iteration: int, summary_text: str, comments: list = None):
    """
    Save a versioned summary iteration to Supabase.
    TODO: implement full versioning storage.
    """
    pass


# Routes

@summarize_bp.route("/summarize/<session_id>", methods=["POST"])
def summarize_transcript(session_id):
    """Generate initial summary from transcript"""
    # 1. Fetch and format transcript from Supabase
    try:
        transcript_bytes = supabase.storage.from_("transcripts").download(
            f"transcripts/{session_id}.json"
        )
        transcript_text = transcript_bytes.decode("utf-8")
    except Exception as e:
        return jsonify({"detail": f"Transcript not found for session {session_id}: {e}"}), 404

    try:
        messages = json.loads(transcript_text)
        formatted = "\n".join(
            f"{'AI' if m['role'] == 'bot' else 'Client'}: {m['message']}"
            for m in messages
        )
    except Exception as e:
        return jsonify({"detail": f"Failed to parse transcript: {e}"}), 500

    # 2. Call Gemini
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