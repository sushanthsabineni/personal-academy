-- =====================================================
-- MINIMAL SLIDES TABLE MIGRATION - ESSENTIAL COLUMNS ONLY
-- =====================================================
-- This adds ONLY the columns needed for AI slide generation
-- Use this if the full migration hasn't been run yet
-- Safe to run in Supabase SQL Editor

-- Step 1: Add the essential missing column that's causing the error
ALTER TABLE slides
ADD COLUMN IF NOT EXISTS ai_notes TEXT;

-- Step 2: Ensure narration column exists (for speaker notes)
ALTER TABLE slides
ADD COLUMN IF NOT EXISTS narration TEXT;

-- Step 3: Ensure media_notes column exists
ALTER TABLE slides
ADD COLUMN IF NOT EXISTS media_notes TEXT;

-- Step 4: Add optional metadata columns for workflow
ALTER TABLE slides
ADD COLUMN IF NOT EXISTS slide_type TEXT DEFAULT 'content';

ALTER TABLE slides
ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT FALSE;

-- Step 5: Create basic indexes for performance
CREATE INDEX IF NOT EXISTS idx_slides_ai_generated 
ON slides(ai_generated);

CREATE INDEX IF NOT EXISTS idx_slides_interaction_type 
ON slides(interaction_type);

-- Step 6: Verify the essential fields
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'slides' 
  AND column_name IN ('ai_notes', 'narration', 'media_notes', 'slide_type', 'is_edited')
ORDER BY column_name;

-- Expected result: All 5 columns should exist
