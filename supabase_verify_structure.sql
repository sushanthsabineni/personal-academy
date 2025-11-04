-- =====================================================
-- VERIFY DATABASE STRUCTURE BEFORE APPLYING RLS
-- Purpose: Check if all required tables and columns exist
-- =====================================================

-- This query will show you what's missing in your database
-- Run this FIRST to see what needs to be added

DO $$ 
DECLARE
  missing_items TEXT := '';
BEGIN
  -- Check tables
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    missing_items := missing_items || E'\n❌ Table missing: profiles';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'courses') THEN
    missing_items := missing_items || E'\n❌ Table missing: courses';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'modules') THEN
    missing_items := missing_items || E'\n❌ Table missing: modules';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lessons') THEN
    missing_items := missing_items || E'\n❌ Table missing: lessons';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'slides') THEN
    missing_items := missing_items || E'\n❌ Table missing: slides';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'credits_transactions') THEN
    missing_items := missing_items || E'\n❌ Table missing: credits_transactions';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payments') THEN
    missing_items := missing_items || E'\n❌ Table missing: payments';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'referrals') THEN
    missing_items := missing_items || E'\n❌ Table missing: referrals';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'file_uploads') THEN
    missing_items := missing_items || E'\n❌ Table missing: file_uploads';
  END IF;
  
  -- Check critical columns in existing tables
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lessons') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'course_id') THEN
      missing_items := missing_items || E'\n❌ Column missing: lessons.course_id';
    END IF;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'slides') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'slides' AND column_name = 'course_id') THEN
      missing_items := missing_items || E'\n❌ Column missing: slides.course_id';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'slides' AND column_name = 'module_id') THEN
      missing_items := missing_items || E'\n❌ Column missing: slides.module_id';
    END IF;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'courses') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'deleted_at') THEN
      missing_items := missing_items || E'\n⚠️  Column missing (optional): courses.deleted_at';
    END IF;
  END IF;
  
  -- Print results
  IF missing_items = '' THEN
    RAISE NOTICE E'✅ ALL TABLES AND COLUMNS EXIST!\n\nYou can safely run the RLS policies SQL now.';
  ELSE
    RAISE NOTICE E'⚠️  MISSING ITEMS DETECTED:\n%\n\n🔧 ACTION REQUIRED:\nRun supabase_add_missing_columns.sql first, then run RLS policies.', missing_items;
  END IF;
END $$;

-- =====================================================
-- HOW TO USE THIS FILE
-- =====================================================
-- 
-- 1. Run this SQL in Supabase SQL Editor
-- 2. Check the NOTICE messages
-- 3. If everything exists → Run supabase_rls_policies.sql
-- 4. If items missing → Run supabase_add_missing_columns.sql first
-- 
-- =====================================================
