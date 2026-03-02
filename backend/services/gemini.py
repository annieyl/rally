from dotenv import load_dotenv
import os 
import sys
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
- text: string (brief PM commentary - DO NOT include questions here)
- inputType: "options", "text", or "mixed"
- options: array of strings (only for inputType="options")
- allowOther: boolean
- sections: array of section objects (REQUIRED for inputType="mixed")

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


def generate_title(text: str) -> str:
    """Generate a 3-5 word title from the given text"""
    title_prompt = ChatPromptTemplate.from_messages([
        ("system", "Generate a concise 3-5 word title for this project or product. Return ONLY the title, nothing else."),
        ("user", "{text}")
    ])
    
    title_chain = title_prompt | llm
    
    try:
        result = title_chain.invoke({"text": text}).content
        # Clean up the result
        title = result.strip().strip('"').strip("'")
        # Limit to 5 words max
        words = title.split()[:5]
        return " ".join(words)
    except Exception as e:
        print(f"[ERROR] Failed to generate title: {e}")
        # Fallback: use first few words
        words = text.split()[:4]
        return " ".join(words) if words else "New Project"
