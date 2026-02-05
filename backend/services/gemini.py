from dotenv import load_dotenv
load_dotenv()

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate

llm = ChatGoogleGenerativeAI(
    model="gemini-flash-latest",   # or "gemini-pro-latest"
    temperature=0.5
)

prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful chatbot."),
    ("user", "{message}")
])

chain = prompt | llm

def run_chat(user_message: str) -> str:
    return chain.invoke({"message": user_message}).content
