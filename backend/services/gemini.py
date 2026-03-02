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
Return ONLY valid JSON with these exact keys:
- text: string (brief response or introduction)
- inputType: "options", "text", or "mixed"
- options: array of option strings (only for single-question options, leave empty for "mixed")
- allowOther: boolean
- sections: ONLY for inputType="mixed" - array of section objects

STAGE DETECTION - Look for keywords in the transcript:
- If transcript contains "What is the specific problem" or "What is the scope" → Problem Definition has been asked
- If transcript contains "Functional requirements" → Check for Technical requirements next
- If transcript contains "Technical requirements" → Check for Logistics next
- If transcript contains "Logistics" → Check for Team next
- If transcript contains "Team" questions → Next ask for completion
NEVER repeat sections once they've been asked. Follow the linear progression.

For "mixed" inputType (Problem Definition survey):
ALWAYS include BOTH text AND sections:
- text: 2-5 sentence PM introduction with context
- sections: [
    {{'question': 'Question 1?', 'inputType': 'text', 'options': [], 'allowOther': false}},
    {{'question': 'Question 2?', 'inputType': 'options', 'options': ['Option A', 'Option B', 'Other'], 'allowOther': true}}
  ]

Rules:
1) Only return Problem Definition (with 6 sections) once - when you have exactly 2 AI messages
2) NEVER ask Problem Definition questions more than once
3) Use message count to track progression, not exact text matching
4) For Project Scoping: follow linear order Functional → Technical → Logistics → Team → Completion
5) Output must be VALID JSON only
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
