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

-- Create index on session_id for faster lookups
CREATE INDEX idx_sessions_session_id ON sessions(session_id);

-- Create index on user_id for filtering by user
CREATE INDEX idx_sessions_user_id ON sessions(user_id);

-- Create index on created_at for sorting
CREATE INDEX idx_sessions_created_at ON sessions(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Optional: Create policies for RLS (adjust based on your auth setup)
-- CREATE POLICY "Users can view their own sessions"
-- ON sessions FOR SELECT
-- USING (auth.uid()::text = user_id OR user_id IS NULL);
