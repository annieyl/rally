-- Migration: Add title column to sessions table
-- Run this in your Supabase SQL Editor if you already have a sessions table

ALTER TABLE sessions ADD COLUMN IF NOT EXISTS title TEXT;
