from dotenv import load_dotenv
import os 
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

system_prompt = read_system_prompt(f"{os.getcwd()}/backend/prompts/system.txt")

prompt = ChatPromptTemplate.from_messages([
    ("system", f"{system_prompt}, previous messages {{session_history}}"),
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
