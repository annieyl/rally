import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { ChatInterface } from "./components/ChatInterface";
import { ImprovedChatInterface } from "./components/ImprovedChatInterface";
import { ChatSessions } from "./components/ChatSessions";
import { Transcripts } from "./components/Transcripts";
import { TranscriptDetail } from "./components/TranscriptDetail";
import { TranscriptSummary } from "./components/TranscriptSummary";
import { TaggingRouting } from "./components/TaggingRouting";
import { AISummaries } from "./components/AISummaries";
import { Teams } from "./components/Teams";
import { Settings } from "./components/Settings";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "sessions", Component: ChatSessions },
      { path: "chat/:id", Component: ChatInterface },
      { path: "chat-form/:id", Component: ImprovedChatInterface },
      { path: "transcripts", Component: Transcripts },
      { path: "transcript/:id", Component: TranscriptDetail },
      { path: "transcript/:id/summary", Component: TranscriptSummary },
      { path: "tagging/:id", Component: TaggingRouting },
      { path: "summaries", Component: AISummaries },
      { path: "teams", Component: Teams },
      { path: "settings", Component: Settings },
    ],
  },
]);