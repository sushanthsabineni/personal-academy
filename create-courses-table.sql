-- Create courses table from scratch
-- Run this in Supabase SQL Editor

-- First, check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'courses'
);

-- Drop existing table if it exists (CAUTION: This will delete all data!)
-- Only run this if you're sure you want to recreate the table
-- DROP TABLE IF EXISTS courses CASCADE;

-- Create the courses table with correct schema
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'archived')),
  current_step INTEGER DEFAULT 1 CHECK (current_step BETWEEN 1 AND 4),
  
  -- Course metadata (Step 1 data)
  industry TEXT,
  target_audience TEXT,
  knowledge_level TEXT CHECK (knowledge_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  learning_outcomes TEXT,
  duration INTEGER, -- in hours
  methodology TEXT,
  target_location TEXT,
  file_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  -- Soft delete
  deleted_at TIMESTAMPTZ
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_courses_user_id ON courses(user_id);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_created_at ON courses(created_at DESC);

-- Enable RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own courses" ON courses;
DROP POLICY IF EXISTS "Users can create own courses" ON courses;
DROP POLICY IF EXISTS "Users can update own courses" ON courses;
DROP POLICY IF EXISTS "Users can delete own courses" ON courses;

-- Create RLS policies
CREATE POLICY "Users can view own courses"
  ON courses FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can create own courses"
  ON courses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own courses"
  ON courses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own courses"
  ON courses FOR DELETE
  USING (auth.uid() = user_id);

-- Reload schema cache
NOTIFY pgrst, 'reload schema';

-- Verify table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'courses'
ORDER BY ordinal_position;

-- Verify RLS policies
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'courses';

-- Success message
SELECT 'courses table created successfully with ' || count(*) || ' columns' as status
FROM information_schema.columns
WHERE table_name = 'courses';
