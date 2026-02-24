-- Supabase SQL Schema for Rally
-- Run this in your Supabase SQL Editor

-- Create sessions table
CREATE TABLE sessions (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  session_id TEXT UNIQUE NOT NULL,
  user_id TEXT,
  transcript_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Create chat_messages table to store individual messages with UI state. 
-- Added because when calling chat session back, need to save UI state as well
CREATE TABLE chat_messages (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  session_id TEXT NOT NULL,
  message_id TEXT NOT NULL,
  sender TEXT NOT NULL,
  test TEXT,
  options TEXT[] DEFAULT NULL,
  allow_other BOOLEAN DEFAULT FALSE,
  selected_option TEXT,
  custom_response TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE,
  UNIQUE(session_id, message_id)
);

-- Create index on session_id for faster lookups
CREATE INDEX idx_sessions_session_id ON sessions(session_id);

-- Create index on user_id for filtering by user
CREATE INDEX idx_sessions_user_id ON sessions(user_id);

-- Create index on created_at for sorting
CREATE INDEX idx_sessions_created_at ON sessions(created_at DESC);

-- Create index for chat_messages lookups
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);

-- Create index for timestamp sorting
CREATE INDEX idx_chat_messages_timestamp ON chat_messages(session_id, timestamp);

-- Enable RLS (Row Level Security)
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

