-- Migration: add team_members table
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS team_members (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  team TEXT NOT NULL CHECK (team IN ('Frontend', 'Backend', 'Design', 'Business', 'DevOps', 'QA')),
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(team);

-- Disable RLS for now (enable and add policies if you add auth later)
ALTER TABLE team_members DISABLE ROW LEVEL SECURITY;
