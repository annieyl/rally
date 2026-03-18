-- Migration 001: Initial Rally schema
-- Run first in Supabase SQL Editor.

-- Sessions
CREATE TABLE IF NOT EXISTS sessions (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  session_id TEXT UNIQUE NOT NULL,
  user_id TEXT,
  title TEXT,
  transcript_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat messages (persisted UI + transcript state)
CREATE TABLE IF NOT EXISTS chat_messages (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  session_id TEXT NOT NULL,
  message_id TEXT NOT NULL,
  sender TEXT NOT NULL,
  text TEXT,
  options TEXT[] DEFAULT NULL,
  allow_other BOOLEAN DEFAULT FALSE,
  selected_option TEXT,
  custom_response TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE,
  UNIQUE(session_id, message_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sessions_session_id ON sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON chat_messages(session_id, timestamp);

-- RLS (no policies included yet)
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
