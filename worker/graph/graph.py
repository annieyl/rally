"""LangGraph definition"""

from typing import TypedDict
from langgraph.graph import StateGraph, END
import sys

from dotenv import load_dotenv
load_dotenv()

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate


# The state of the conditional graph
class ConditionalState(TypedDict):
    user_input: str # User's feedback
    transcript_filepath: str # Filepath to transcript -- TODO: figure out supabase
    transcript_text: str
    summary_filepath: str # Filepath to generated summary
    summary_text: str
    next: str  # The next node to route to
    iteration: int # Helpful for debugging; track which iteration of human feedback we're on

# The functions for each node
def get_transcript_local(state: ConditionalState) -> dict:
    """Get filepath of the transcript given a session id; provide as input to next"""
    print("[DEBUG] Entering node to get local transcript")
    filepath = state.get("transcript_filepath", "")
    # print(f"[DEBUG] Transcript filepath: {filepath}")
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            text = f.read()
        # print(text[:30])
        return {"transcript_text": text}
    except Exception as e:
        print(f"[ERROR] Unable to get local transcript; error {e}")

def get_transcript_supabase(state: ConditionalState) -> dict:
    pass 

def summarize(state: ConditionalState) -> dict:
    """Call AI agent to summarize transcript text"""
    print("[DEBUG] Entering node to summarize transcript")
    
    transcript = state.get("transcript_text", "")
    if not transcript:
        raise ValueError("[ERROR] No transcript_text found in state")
    
    llm = ChatGoogleGenerativeAI(
        model="gemini-flash-latest",
        temperature=0.5,
    )
    
    def read_system_prompt(filepath):
        """Making this a function for future prompt txt file reading"""
        with open(filepath, 'r', encoding='utf-8') as f:
            text = f.read()
        return text

    system_prompt = read_system_prompt("worker/prompts/summarize.txt")

    response = llm.invoke([system_prompt, transcript])
    summary_text = response.content

    print(f"[DEBUG] Summary generated {summary_text}")

    return {"summary_text": summary_text}

def human_validate(state: ConditionalState) -> dict:
    """Ask human to read summary and provide feedback"""
    pass 

def edit(state: ConditionalState) -> dict:
    """Take human feedback, reprompt to fix"""
    pass 

def check_query(state: ConditionalState) -> dict:
    """Checks the query and returns a routing decision."""
    query = state.get("input", "").lower()
    if "pricing" in query:
        return {"next": "pricing"}
    else:
        return {"next": "general"}

def pricing_info(state: ConditionalState) -> dict:
    """Provides pricing information."""
    print("Here’s detailed pricing information.")
    return {}



if __name__ == "__main__":
    
    # Take in CLI arg for transcript session id
    # FOR NOW, LET'S JUST INPUT THE TRANSCRIPT FILEPATH
    if len(sys.argv) != 2:
        print(f"Usage: {sys.argv[0]} <transcript filepath>")
        sys.exit(1)

    session_id = sys.argv[1]
    print(f"[DEBUG] Starting LangGraph for session {session_id}")

    # Set up the graph
    graph = StateGraph(ConditionalState)
    graph.add_node("get_transcript_local", get_transcript_local)
    graph.add_node("summarize", summarize)

    # Set the entry point 
    graph.set_entry_point("get_transcript_local")

    # Add static edges
    graph.add_edge("get_transcript_local", "summarize")
    graph.add_edge("summarize", END) # temporary

    # Add conditional edges
    # graph.add_conditional_edges(
    #     "check", # The source node for the decision
    #     lambda state: state["next"], # A function to extract the routing key from the state
    #     {
    #         # A map of routing keys to destination nodes
    #         "pricing": "pricing",
    #         "general": "general"
    #     }
    # )

    # Compile and run
    initial_state = {
        "iteration": 0,
    }
    app = graph.compile()
    app.invoke({"transcript_filepath": session_id})
