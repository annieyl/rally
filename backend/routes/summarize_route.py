from flask import Blueprint, jsonify, request
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

REGENERATE_PROMPT = """You are given:
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
    formatted, err = _fetch_and_format_transcript(session_id)
    if err:
        return err

    full_prompt = f"{SUMMARIZE_PROMPT}\n\nTRANSCRIPT:\n{formatted}"
    summary_text, err = _call_llm(full_prompt)
    if err:
        return err

    try:
        _upload_summary(session_id, summary_text)
    except Exception as e:
        return jsonify({"detail": f"Failed to upload summary: {e}"}), 500

    return jsonify({"session_id": session_id, "summary": summary_text})

@summarize_bp.route("/summarize/<session_id>/regenerate", methods=["POST"])
def regenerate_summary(session_id):
    """
    Regenerate summary using the original summary + reviewer comments.

    Expected request body:
    {
        "summary": "...the current summary text...",
        "comments": [
            {
                "id": "abc123",
                "highlightedText": "some text the user selected",
                "comment": "This section should mention X"
            },
            ...
        ]
    }
    """
    body = request.get_json(silent=True) or {}
    original_summary = body.get("summary", "").strip()
    comments: list = body.get("comments", [])

    if not original_summary:
        return jsonify({"detail": "summary is required"}), 400
    if not comments:
        return jsonify({"detail": "No comments provided"}), 400

    # Fetch transcript
    formatted_transcript, err = _fetch_and_format_transcript(session_id)
    if err:
        return err

    # Format comments for the prompt
    formatted_comments = "\n".join(
        f"{i + 1}. Highlighted: \"{c.get('highlightedText', '')}\"\n   Comment: {c.get('comment', '')}"
        for i, c in enumerate(comments)
    )

    full_prompt = REGENERATE_PROMPT.format(
        transcript=formatted_transcript,
        summary=original_summary,
        comments=formatted_comments,
    )

    new_summary, err = _call_llm(full_prompt)
    if err:
        return err

    # Upload the new summary (overwrites previous)
    try:
        _upload_summary(session_id, new_summary)
    except Exception as e:
        return jsonify({"detail": f"Failed to upload regenerated summary: {e}"}), 500

    # Stub: save this iteration for audit/history
    save_summary_iteration(session_id, iteration=1, summary_text=new_summary, comments=comments)

    return jsonify({"session_id": session_id, "summary": new_summary})
