// Transcript API endpoints

const API_BASE = "http://localhost:8000/api";

interface TranscriptUploadResponse {
  session_id: string;
  transcript_url: string;
  session_data?: {
    id: number;
    session_id: string;
    user_id?: string;
    transcript_url: string;
    created_at: string;
    ended_at: string;
  };
}

interface TranscriptContent {
  role: 'user' | 'bot';
  message: string;
}

interface Session {
  id: number;
  session_id: string;
  user_id?: string;
  transcript_url: string;
  created_at: string;
  ended_at: string;
}

interface ChatMessage {
  id: number;
  session_id: string;
  message_id: string;
  sender: 'ai' | 'client';
  text?: string;
  options?: string[];
  allow_other: boolean;
  selected_option?: string;
  custom_response?: string;
  timestamp: string;
}

/**
 * Upload transcript to Supabase and save session to database
 * @param sessionId - Session identifier
 * @param userId - Optional user identifier
 * @returns Response with transcript_url and session_data
 */
export async function uploadTranscript(
  sessionId: string,
  userId: string | null = null
): Promise<TranscriptUploadResponse> {
  try {
    const response = await fetch(`${API_BASE}/transcript/upload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session_id: sessionId,
        user_id: userId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data: TranscriptUploadResponse = await response.json();
    console.log("[DEBUG] Transcript uploaded successfully:", data);
    return data;
  } catch (error) {
    console.error("[ERROR] Failed to upload transcript:", error);
    throw error;
  }
}

/**
 * Get transcript from Supabase storage (requires public URL)
 * @param publicUrl - Public URL from Supabase
 * @returns Transcript content
 */
export async function getTranscript(publicUrl: string): Promise<TranscriptContent[]> {
  try {
    const response = await fetch(publicUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }
    const data: TranscriptContent[] = await response.json();
    return data;
  } catch (error) {
    console.error("[ERROR] Failed to get transcript:", error);
    throw error;
  }
}

/**
 * Fetch all sessions from database
 * @returns Array of sessions
 */
export async function fetchSessions(): Promise<Session[]> {
  try {
    const response = await fetch(`${API_BASE}/sessions`);
    if (!response.ok) {
      throw new Error(`Failed to fetch sessions: ${response.statusText}`);
    }
    const data: Session[] = await response.json();
    return data;
  } catch (error) {
    console.error("[ERROR] Failed to fetch sessions:", error);
    return [];
  }
}

/**
 * Fetch specific session details
 * @param sessionId - Session identifier
 * @returns Session data
 */
export async function fetchSessionDetail(sessionId: string): Promise<Session | null> {
  try {
    const response = await fetch(`${API_BASE}/session/${sessionId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch session: ${response.statusText}`);
    }
    const data: Session = await response.json();
    return data;
  } catch (error) {
    console.error("[ERROR] Failed to fetch session:", error);
    return null;
  }
}

/**
 * Save a chat message with selection state
 * @param sessionId - Session identifier
 * @param message - Chat message with UI state
 * @returns Saved message data
 */
export async function saveChatMessage(
  sessionId: string,
  message: Omit<ChatMessage, 'id' | 'session_id' | 'timestamp'>
): Promise<ChatMessage> {
  try {
    const response = await fetch(`${API_BASE}/chat/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session_id: sessionId,
        ...message,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to save message: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("[DEBUG] Chat message saved:", data);
    return data.message;
  } catch (error) {
    console.error("[ERROR] Failed to save chat message:", error);
    throw error;
  }
}


/**
 * Fetch all chat messages for a session
 * @param sessionId - Session identifier
 * @returns Array of chat messages with UI state
 */
export async function fetchChatMessages(sessionId: string): Promise<ChatMessage[]> {
  try {
    const response = await fetch(`${API_BASE}/chat/messages/${sessionId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch messages: ${response.statusText}`);
    }
    const data: ChatMessage[] = await response.json();
    console.log("[DEBUG] Fetched chat messages:", data);
    return data;
  } catch (error) {
    console.error("[ERROR] Failed to fetch chat messages:", error);
    return [];
  }
}
