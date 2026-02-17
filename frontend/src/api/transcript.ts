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
