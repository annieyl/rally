"""LangGraph definition"""

from typing import TypedDict
from langgraph.graph import StateGraph, END
import sys

# The state of the conditional graph
class ConditionalState(TypedDict):
    user_input: str # User's feedback
    transcript_filepath: str # Filepath to transcript -- TODO: figure out supabase
    summary_filepath: str # Filepath to generated summary
    next: str  # The next node to route to
    iteration: int # Helpful for debugging; track which iteration of human feedback we're on

# The functions for each node
def get_transcript_local(state: ConditionalState) -> dict:
    """Get filepath of the transcript given a session id; provide as input to next"""
    pass 

def get_transcript_supabase(state: ConditionalState) -> dict:
    pass 

def summarize(state: ConditionalState) -> dict:
    """Call AI agent to summarize transcript text"""
    pass 

def human_validate(state: ConditionalState) -> dict:
    """Ask human to read summary and provide feedback"""
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

def general_info(state: ConditionalState) -> dict:
    """Provides general information."""
    print("Here’s some general information.")
    return {}


if __name__ == "__main__":
    
    # Take in CLI arg for transcript session id
    # FOR NOW, LET'S JUST INPUT THE TRANSCRIPT FILEPATH
    if len(sys.argv) != 2:
        print(f"Usage: {sys.argv[0]} <session_id>")
        sys.exit(1)

    session_id = sys.argv[1]
    print(f"[DEBUG] Starting LangGraph for session {session_id}")

    # Set up the graph
    graph = StateGraph(ConditionalState)
    graph.add_node("check", check_query)
    graph.add_node("pricing", pricing_info)
    graph.add_node("general", general_info)

    # Set the entry point and the conditional edges
    graph.set_entry_point("check")
    graph.add_conditional_edges(
        "check", # The source node for the decision
        lambda state: state["next"], # A function to extract the routing key from the state
        {
            # A map of routing keys to destination nodes
            "pricing": "pricing",
            "general": "general"
        }
    )

    # Add edges from the final nodes to the end
    graph.add_edge("pricing", END)
    graph.add_edge("general", END)

    # Compile and run
    app = graph.compile()
    app.invoke({"input": "I need to know about your plans."})
