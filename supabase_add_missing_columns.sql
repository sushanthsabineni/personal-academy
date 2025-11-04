-- =====================================================
-- ADD MISSING COLUMNS TO LESSONS AND SLIDES TABLES
-- Purpose: Ensure course_id foreign keys exist for RLS policies
-- =====================================================

-- Add course_id to lessons table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lessons' 
    AND column_name = 'course_id'
  ) THEN
    ALTER TABLE lessons ADD COLUMN course_id UUID REFERENCES courses(id) ON DELETE CASCADE;
    RAISE NOTICE 'Added course_id column to lessons table';
    
    -- Create index for performance
    CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);
    
    -- Populate course_id from modules (if data exists)
    UPDATE lessons 
    SET course_id = modules.course_id 
    FROM modules 
    WHERE lessons.module_id = modules.id;
    
    -- Make it NOT NULL after populating
    ALTER TABLE lessons ALTER COLUMN course_id SET NOT NULL;
    
    RAISE NOTICE 'Populated and set course_id as NOT NULL in lessons table';
  ELSE
    RAISE NOTICE 'course_id column already exists in lessons table';
  END IF;
END $$;

-- Add course_id to slides table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'slides' 
    AND column_name = 'course_id'
  ) THEN
    ALTER TABLE slides ADD COLUMN course_id UUID REFERENCES courses(id) ON DELETE CASCADE;
    RAISE NOTICE 'Added course_id column to slides table';
    
    -- Create index for performance
    CREATE INDEX IF NOT EXISTS idx_slides_course_id ON slides(course_id);
    
    -- Populate course_id from lessons (if data exists)
    UPDATE slides 
    SET course_id = lessons.course_id 
    FROM lessons 
    WHERE slides.lesson_id = lessons.id;
    
    -- Make it NOT NULL after populating
    ALTER TABLE slides ALTER COLUMN course_id SET NOT NULL;
    
    RAISE NOTICE 'Populated and set course_id as NOT NULL in slides table';
  ELSE
    RAISE NOTICE 'course_id column already exists in slides table';
  END IF;
END $$;

-- Add module_id to slides table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'slides' 
    AND column_name = 'module_id'
  ) THEN
    ALTER TABLE slides ADD COLUMN module_id UUID REFERENCES modules(id) ON DELETE CASCADE;
    RAISE NOTICE 'Added module_id column to slides table';
    
    -- Create index for performance
    CREATE INDEX IF NOT EXISTS idx_slides_module_id ON slides(module_id);
    
    -- Populate module_id from lessons (if data exists)
    UPDATE slides 
    SET module_id = lessons.module_id 
    FROM lessons 
    WHERE slides.lesson_id = lessons.id;
    
    -- Make it NOT NULL after populating
    ALTER TABLE slides ALTER COLUMN module_id SET NOT NULL;
    
    RAISE NOTICE 'Populated and set module_id as NOT NULL in slides table';
  ELSE
    RAISE NOTICE 'module_id column already exists in slides table';
  END IF;
END $$;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
-- 
-- Run this SQL FIRST, then run the RLS policies SQL
-- This ensures all required columns exist for the policies
-- 
-- =====================================================
