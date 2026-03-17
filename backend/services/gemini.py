from dotenv import load_dotenv
import os 
import sys
import re
load_dotenv()

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate

llm = ChatGoogleGenerativeAI(
    model="gemini-flash-latest",   # or "gemini-pro-latest"
    temperature=0.5
)

def read_system_prompt(filepath):
    """Making this a function for future prompt txt file reading"""
    with open(filepath, 'r', encoding='utf-8') as f:
        text = f.read()
    return text

# Get the backend directory path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
system_prompt = read_system_prompt(os.path.join(backend_dir, "prompts", "system.txt"))

format_instructions = """
CRITICAL: You MUST return ONLY valid JSON. No plain text, no explanations outside JSON.

JSON structure with these exact keys:
- text: string (PM kickoff / readback / instructions ONLY - DO NOT include questions here)
- inputType: "options", "text", or "mixed"
- options: array of strings (only for inputType="options", otherwise [])
- allowOther: boolean
- sections: array of section objects (REQUIRED for inputType="mixed", otherwise [])

SECTION object structure:

- question: string

- inputType: "text" or "options"

- options: array of strings (ONLY for section inputType="options"; otherwise [])


CONVERSATIONAL TONE REQUIREMENTS:

- Always sound like a PM meeting a client for the first time.
- Use short, warm, human language in "text" (2–5 sentences).
- Always include a "Fast path" line in the text when inputType="mixed":
  e.g., "Fast path: answer #1 and #3 + pick stakeholders, and I’ll draft the rest."
- Never put questions inside "text".

STAGE DETECTION - Check transcript for these EXACT texts:
1. Problem Definition keywords: "What is the specific problem you want to solve", "What is the scope of the problem"
2. Functional Requirements keywords: "What kind of features", "mission-critical features"
3. Technical Requirements keywords: "What is our budget", "tech stack"
4. Logistics keywords: "in scope/out of scope", "deliverables"
5. Team keywords: "team members", "teams involved"

IF you find Problem Definition keywords → Move to Functional Requirements
IF you find Functional Requirements keywords → Move to Technical Requirements
IF you find Technical Requirements keywords → Move to Logistics
IF you find Logistics keywords → Move to Team
IF you find Team keywords → Ask "Is there anything else you want to add?"

IMPORTANT: READBACK SPEC RULE
- When moving from Problem Definition → Functional Requirements, you MUST start by summarizing a short "readback spec" in the text field (problem, users, success, constraints) BEFORE asking Functional sections.
- It should also contain a vague suggestion of the project, like ("To address your problem statements, a possible approach would be like building a tutoring web-app for college students to connect with alumni with features...") 
- When the user have not answered much Problem Definition questions yet, make your own suggestions, but after containing the details from the response, make sure to integrate that to the project suggestion
- The readback must NOT contain questions.

PROBLEM DEFINITION (After user's first message):
- User just told you their project idea
- Transcript does NOT contain Problem Definition keywords
- You MUST return inputType="mixed" with 6 sections
- DO NOT write questions in the text field
- Put questions ONLY in sections array

Example for Problem Definition (COPY THIS STRUCTURE EXACTLY):
{{
  "text": "Great idea! To understand your vision better, I need to explore the core challenges.",
  "inputType": "mixed",
  "sections": [
    {{"question": "What is the specific problem you want to solve?", "inputType": "text", "options": [], "allowOther": false}},
    {{"question": "What is the scope of the problem?", "inputType": "text", "options": [], "allowOther": false}},
    {{"question": "What are some specific examples of when you faced this problem?", "inputType": "text", "options": [], "allowOther": false}},
    {{"question": "What have you or others already tried to do to solve this problem?", "inputType": "text", "options": [], "allowOther": false}},
    {{"question": "Who are the stakeholders in this problem?", "inputType": "options", "options": ["Students", "Faculty", "Staff", "Other"], "allowOther": true}},
    {{"question": "Who cares most about this problem being solved?", "inputType": "options", "options": ["Students", "Faculty", "Staff", "Other"], "allowOther": true}}
  ],
  "options": [],
  "allowOther": false
}}

RULES:
1) ALWAYS return valid JSON only
2) For Problem Definition, MUST use inputType="mixed" with sections
3) Check transcript BEFORE generating response
4) NEVER repeat questions already answered
5) Questions go in sections array, NOT in text field
"""

prompt = ChatPromptTemplate.from_messages([
    ("system", system_prompt + "\n\n" + format_instructions + "\n\nPrevious messages: {session_history}"),
    ("user", "{message}")
])

chain = prompt | llm

def run_chat(user_message: str, session_history: str) -> str:
    print(f"[DEBUG] === Running Chat ===")
    print(f"[DEBUG] User Message: {user_message[:200]}...")
    if session_history:
        print(f"[DEBUG] Session History (last 500 chars): ...{session_history[-500:]}")
        print(f"[DEBUG] Session History (first 500 chars): ...{session_history[:500]}")
    else:
        print(f"[DEBUG] Session History: None (new session)")
    
    result = chain.invoke({"message": user_message, 
                           "session_history": session_history or ""}).content
    # print(f"[DEBUG] Full Result: {result}") 

    # Sometimes it returns a list of json (even though I tried to specify
    # in the prompt to return only plain text)
    # If you don't convert it you'll get [object Object] as the chat response
    if not isinstance(result, str):
        result = result[0]['text']

    print(f"[DEBUG] LLM Response: {result[:200]}...")
    return result


def _clean_title(raw_title: str, max_words: int = 4) -> str:
    text = (raw_title or "").strip()
    text = text.replace("\n", " ").replace("\r", " ")
    text = text.strip('"\'`')
    text = re.sub(r"\s+", " ", text)

    words = []
    for token in text.split(" "):
        cleaned_token = re.sub(r"^[^\w&+-]+|[^\w&+-]+$", "", token)
        if cleaned_token:
            words.append(cleaned_token)
        if len(words) >= max_words:
            break

    return " ".join(words).title()


def _fallback_title(text: str, max_words: int = 4) -> str:
    stopwords = {
        "a", "an", "and", "are", "as", "at", "be", "build", "by", "for",
        "from", "i", "in", "is", "it", "my", "need", "of", "on", "or",
        "our", "project", "that", "the", "this", "to", "want", "we", "with"
    }

    tokens = re.findall(r"[A-Za-z0-9&+-]+", text.lower())
    key_tokens = [token for token in tokens if token not in stopwords]
    selected_tokens = key_tokens[:max_words] if key_tokens else tokens[:max_words]

    if not selected_tokens:
        return "New Project"

    return " ".join(selected_tokens).title()


def generate_title(text: str) -> str:
    """Generate a concise summary title with a maximum of 4 words."""
    title_prompt = ChatPromptTemplate.from_messages([
        ("system", """Generate a concise project summary title.

Rules:
- Return ONLY the title text.
- Use MAX 4 words.
- Make it a short noun phrase that summarizes the user's request.
- Avoid prefixes like 'I want', 'Need', 'Build', 'Create'.
- No extra punctuation or quotes.

Examples:
- Meal Plan Tracker
- Career Advisor App
- Student Attendance Tracker
"""),
        ("user", "{text}")
    ])
    
    title_chain = title_prompt | llm
    
    try:
        result = title_chain.invoke({"text": text}).content
        cleaned_title = _clean_title(result, max_words=4)
        return cleaned_title if cleaned_title else _fallback_title(text, max_words=4)
    except Exception as e:
        print(f"[ERROR] Failed to generate title: {e}")
        return _fallback_title(text, max_words=4)
