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

For "mixed" inputType (Problem Definition survey):
ALWAYS include BOTH text AND sections:
- text: 2-5 sentence PM introduction with context
- sections: [
    {{'question': 'Question 1?', 'inputType': 'text', 'options': [], 'allowOther': false}},
    {{'question': 'Question 2?', 'inputType': 'options', 'options': ['Option A', 'Option B', 'Other'], 'allowOther': true}}
  ]

Rules:
1) For Problem Definition: ALWAYS use inputType="mixed" with BOTH text AND sections
2) Text is displayed first, sections displayed below for user input
3) Never skip the text field - always include PM insights
4) Keep all text fields and sections in single response
5) Output must be VALID JSON only
"""

prompt = ChatPromptTemplate.from_messages([
    ("system", system_prompt + "\n\n" + format_instructions + "\n\nPrevious messages: {session_history}"),
    ("user", "{message}")
])

chain = prompt | llm

def run_chat(user_message: str, session_history: str) -> str:
    result = chain.invoke({"message": user_message, 
                           "session_history": session_history}).content
    # print(f"[DEBUG] Full Result: {result}") 

    # Sometimes it returns a list of json (even though I tried to specify
    # in the prompt to return only plain text)
    # If you don't convert it you'll get [object Object] as the chat response
    if not isinstance(result, str):
        result = result[0]['text']

    return result
