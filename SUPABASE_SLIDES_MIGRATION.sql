-- =====================================================
-- SUPABASE SQL MIGRATION: Slides Table for AI Generation
-- =====================================================
-- Copy and paste this entire script into Supabase SQL Editor
-- https://supabase.com/dashboard → Your Project → SQL Editor
-- 
-- This is completely safe - it only adds columns if they don't exist
-- =====================================================

-- Step 1: Add missing columns for slide metadata and approval workflow
ALTER TABLE slides
ADD COLUMN IF NOT EXISTS slide_type TEXT DEFAULT 'content';

ALTER TABLE slides
ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT FALSE;

ALTER TABLE slides
ADD COLUMN IF NOT EXISTS edit_notes TEXT;

ALTER TABLE slides
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

ALTER TABLE slides
ADD COLUMN IF NOT EXISTS approved_by UUID;

-- Step 2: Add constraint on slide_type to ensure valid values
ALTER TABLE slides
ADD CONSTRAINT check_slide_type 
CHECK (slide_type IN ('intro', 'content', 'conclusion'))
ON CONFLICT DO NOTHING;

-- Step 3: Ensure data integrity with NOT NULL on required fields
ALTER TABLE slides 
ALTER COLUMN title SET NOT NULL;

ALTER TABLE slides 
ALTER COLUMN content SET NOT NULL;

-- Step 4: Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_slides_ai_generated 
ON slides(ai_generated) WHERE ai_generated = true;

CREATE INDEX IF NOT EXISTS idx_slides_interaction_type 
ON slides(interaction_type);

CREATE INDEX IF NOT EXISTS idx_slides_lesson_slide_number 
ON slides(lesson_id, slide_number);

CREATE INDEX IF NOT EXISTS idx_slides_approved 
ON slides(approved_at DESC NULLS LAST);

-- Step 5: Ensure timestamp update trigger
DROP TRIGGER IF EXISTS slides_updated_at ON slides;

CREATE TRIGGER slides_updated_at
BEFORE UPDATE ON slides
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- VERIFICATION: Run these queries to confirm success
-- =====================================================

-- Check that all columns exist:
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'slides'
ORDER BY ordinal_position;

-- Expected result - you should see these columns:
-- id, lesson_id, module_id, course_id, slide_number, title, learning_objective,
-- content, media_notes, interaction_type, assessment_type, color, narration,
-- ai_notes, duration, engagement_score, ai_generated, created_at, updated_at,
-- slide_type, is_edited, edit_notes, approved_at, approved_by

-- Check indexes:
SELECT indexname FROM pg_indexes WHERE tablename = 'slides';

-- Expected: Multiple indexes including idx_slides_ai_generated, etc.

-- =====================================================
-- FIELD REFERENCE FOR AI SLIDE GENERATION
-- =====================================================
-- These fields are used by the slide generation system:

-- CORE FIELDS (populated by AI):
-- - title: Slide title (5-8 words)
-- - content: Main content as bullet points
-- - narration: Speaker notes (presenter talking points)
-- - media_notes: Media recommendations (videos, graphics, etc)
-- - learning_objective: SMART learning objective
-- - interaction_type: Type of learner engagement (quiz, video, interactive, discussion, reflection, image)

-- METADATA FIELDS:
-- - slide_type: 'intro' (hook), 'content' (main), or 'conclusion' (summary)
-- - ai_notes: Additional notes from AI generation
-- - ai_generated: true when created by AI system

-- EDITORIAL WORKFLOW FIELDS:
-- - is_edited: true if instructor has modified after generation
-- - edit_notes: Notes about what was changed
-- - approved_at: When the slide was approved
-- - approved_by: User ID of instructor who approved

-- OPTIONAL FIELDS:
-- - assessment_type: Type of assessment (quiz, reflection, etc)
-- - duration: Slide duration in seconds
-- - engagement_score: 0-100 score for engagement level
-- - color: Hex color for slide theme
