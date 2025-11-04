-- =====================================================
-- ADD DELETED_AT COLUMN TO COURSES TABLE
-- Purpose: Enable soft delete functionality
-- =====================================================

-- Add deleted_at column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'courses' 
    AND column_name = 'deleted_at'
  ) THEN
    ALTER TABLE courses ADD COLUMN deleted_at TIMESTAMPTZ;
    RAISE NOTICE 'Added deleted_at column to courses table';
  ELSE
    RAISE NOTICE 'deleted_at column already exists in courses table';
  END IF;
END $$;

-- Create index for soft delete queries
CREATE INDEX IF NOT EXISTS idx_courses_deleted_at ON courses(deleted_at);

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
-- 
-- Run this SQL first, then run the RLS policies SQL
-- 
-- =====================================================
