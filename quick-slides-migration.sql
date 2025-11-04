-- =====================================================
-- QUICK SLIDES TABLE MIGRATION - AI SLIDE GENERATION
-- =====================================================
-- Safe to run - only adds missing columns and ensures proper setup
-- Run in Supabase SQL Editor

BEGIN;

-- Add missing columns if they don't exist
ALTER TABLE slides
ADD COLUMN IF NOT EXISTS slide_type TEXT DEFAULT 'content' 
  CHECK (slide_type IN ('intro', 'content', 'conclusion'));

ALTER TABLE slides
ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT FALSE;

ALTER TABLE slides
ADD COLUMN IF NOT EXISTS edit_notes TEXT;

ALTER TABLE slides
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

ALTER TABLE slides
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Ensure title and content are NOT NULL for data integrity
ALTER TABLE slides ALTER COLUMN title SET NOT NULL;
ALTER TABLE slides ALTER COLUMN content SET NOT NULL;

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_slides_ai_generated ON slides(ai_generated);
CREATE INDEX IF NOT EXISTS idx_slides_interaction_type ON slides(interaction_type);
CREATE INDEX IF NOT EXISTS idx_slides_approved ON slides(approved_at);

-- Verify/recreate update timestamp trigger
DROP TRIGGER IF EXISTS slides_updated_at ON slides;

CREATE TRIGGER slides_updated_at
BEFORE UPDATE ON slides
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

COMMIT;

-- Verify the migration
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'slides' 
ORDER BY ordinal_position;
