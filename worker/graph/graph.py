"""LangGraph definition"""

from typing import TypedDict
from langgraph.graph import StateGraph, END
import sys
import os

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
    next: str  # The next node to route to (for conditional)
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


    if not isinstance(summary_text, str):
        summary_text = summary_text[0]['text']

    print(f"[DEBUG] Summary generated {summary_text}")

    return {"summary_text": summary_text}

def human_validate(state: ConditionalState) -> dict:
    """
    Ask human to read summary and provide feedback
    At this point, the summary_text in the state should already be occupied 
    and the summary has been printed to CLI.
    """
    print("[DEBUG] Entering node for human validation")
    while True:
        acceptance = input("Does this summary look correct? (y/n): ")
        if acceptance.lower() in {"y", "yes"}:
            print(f"[DEBUG] Accepted iteration {state.get("iteration")} of the summary")
            return {"next": "save_summary", "iteration": state.get("iteration") + 1}
        elif acceptance in {"n", "no"}:
            print(f"[DEBUG] Rejected iteration {state.get("iteration")} of the summary")
            feedback = input("Please provide feedback for why this looks incorrect: ")
            # Append new feedback to previous 
            prev_input = state.get("user_input", "")
            return {"next": "edit", "user_input": feedback + prev_input}
        else:
            print("Please enter (y/n)")
    

def edit(state: ConditionalState) -> dict:
    """Take human feedback, reprompt to fix"""
    print(f"[DEBUG] Entering node for prompting AI to edit summary")
    feedback = state.get("user_input", "")
    print(feedback)

def save_summary(state: ConditionalState) -> dict:
    """Passed human feedback, save to local file"""
    print("[DEBUG] Entering node for saving summary locally")
    os.makedirs("worker/summaries", exist_ok=True)
    filepath = f"worker/summaries/summary_test.txt" # fix this later
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            summary = state.get("summary_text", "")
            f.write(summary)
    except IOError as e:
        print(f"[ERROR] An error occurred when writing to the file: {e}")


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
    graph.add_node("human_validate", human_validate)
    graph.add_node("edit", edit)
    graph.add_node("save_summary", save_summary)

    # Set the entry point 
    graph.set_entry_point("get_transcript_local")

    # Add static edges
    graph.add_edge("get_transcript_local", "summarize")
    graph.add_edge("summarize", "human_validate") 

    # Add conditional edges
    graph.add_conditional_edges(
        "human_validate", # source node for decision
        path=lambda state: state["next"], # function to get the routing key from state
        path_map={
            "save_summary": "save_summary",
            "edit": "edit"
        }
    )

    # Compile and run
    app = graph.compile()
    app.invoke({"transcript_filepath": session_id, "iteration": 0})
