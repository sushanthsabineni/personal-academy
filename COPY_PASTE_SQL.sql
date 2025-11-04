-- =====================================================
-- COPY-PASTE THIS ENTIRE BLOCK INTO SUPABASE SQL EDITOR
-- =====================================================
-- Step 1: Go to https://supabase.com/dashboard
-- Step 2: Select your Personal Academy project
-- Step 3: Click SQL Editor → New Query
-- Step 4: Paste this entire SQL block
-- Step 5: Click RUN
-- Step 6: You're done! Slides will now work.

-- =====================================================
-- ADD MISSING COLUMNS TO SLIDES TABLE
-- =====================================================

ALTER TABLE slides
ADD COLUMN IF NOT EXISTS ai_notes TEXT;

ALTER TABLE slides
ADD COLUMN IF NOT EXISTS narration TEXT;

ALTER TABLE slides
ADD COLUMN IF NOT EXISTS media_notes TEXT;

ALTER TABLE slides
ADD COLUMN IF NOT EXISTS slide_type TEXT DEFAULT 'content';

ALTER TABLE slides
ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT FALSE;

-- =====================================================
-- ADD INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_slides_ai_generated 
ON slides(ai_generated);

CREATE INDEX IF NOT EXISTS idx_slides_interaction_type 
ON slides(interaction_type);

-- =====================================================
-- VERIFY THE CHANGES (Results will show below)
-- =====================================================

SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'slides' 
  AND column_name IN ('ai_notes', 'narration', 'media_notes', 'slide_type', 'is_edited')
ORDER BY column_name;

-- If successful, you should see these 5 rows:
-- ai_notes        | text    | YES
-- is_edited       | boolean | YES
-- media_notes     | text    | YES
-- narration       | text    | YES
-- slide_type      | text    | YES
