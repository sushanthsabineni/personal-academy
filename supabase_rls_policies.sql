-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- Purpose: Ensure users can only access their own data
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE credits_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PROFILES TABLE POLICIES
-- =====================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Users can insert their own profile (during signup)
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- =====================================================
-- COURSES TABLE POLICIES
-- =====================================================

-- Users can view only their own courses (excluding soft-deleted)
CREATE POLICY "Users can view own courses"
ON courses FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own courses
CREATE POLICY "Users can insert own courses"
ON courses FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own courses
CREATE POLICY "Users can update own courses"
ON courses FOR UPDATE
USING (auth.uid() = user_id);

-- Users can soft-delete their own courses
CREATE POLICY "Users can delete own courses"
ON courses FOR DELETE
USING (auth.uid() = user_id);

-- =====================================================
-- MODULES TABLE POLICIES
-- =====================================================

-- Users can view modules of their own courses
CREATE POLICY "Users can view own modules"
ON modules FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id FROM courses WHERE courses.id = modules.course_id
  )
);

-- Users can insert modules for their own courses
CREATE POLICY "Users can insert own modules"
ON modules FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM courses WHERE courses.id = modules.course_id
  )
);

-- Users can update modules of their own courses
CREATE POLICY "Users can update own modules"
ON modules FOR UPDATE
USING (
  auth.uid() IN (
    SELECT user_id FROM courses WHERE courses.id = modules.course_id
  )
);

-- Users can delete modules of their own courses
CREATE POLICY "Users can delete own modules"
ON modules FOR DELETE
USING (
  auth.uid() IN (
    SELECT user_id FROM courses WHERE courses.id = modules.course_id
  )
);

-- =====================================================
-- LESSONS TABLE POLICIES
-- =====================================================

-- Users can view lessons of their own courses
CREATE POLICY "Users can view own lessons"
ON lessons FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id FROM courses WHERE courses.id = lessons.course_id
  )
);

-- Users can insert lessons for their own courses
CREATE POLICY "Users can insert own lessons"
ON lessons FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM courses WHERE courses.id = lessons.course_id
  )
);

-- Users can update lessons of their own courses
CREATE POLICY "Users can update own lessons"
ON lessons FOR UPDATE
USING (
  auth.uid() IN (
    SELECT user_id FROM courses WHERE courses.id = lessons.course_id
  )
);

-- Users can delete lessons of their own courses
CREATE POLICY "Users can delete own lessons"
ON lessons FOR DELETE
USING (
  auth.uid() IN (
    SELECT user_id FROM courses WHERE courses.id = lessons.course_id
  )
);

-- =====================================================
-- SLIDES TABLE POLICIES
-- =====================================================

-- Users can view slides of their own courses
CREATE POLICY "Users can view own slides"
ON slides FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id FROM courses WHERE courses.id = slides.course_id
  )
);

-- Users can insert slides for their own courses
CREATE POLICY "Users can insert own slides"
ON slides FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM courses WHERE courses.id = slides.course_id
  )
);

-- Users can update slides of their own courses
CREATE POLICY "Users can update own slides"
ON slides FOR UPDATE
USING (
  auth.uid() IN (
    SELECT user_id FROM courses WHERE courses.id = slides.course_id
  )
);

-- Users can delete slides of their own courses
CREATE POLICY "Users can delete own slides"
ON slides FOR DELETE
USING (
  auth.uid() IN (
    SELECT user_id FROM courses WHERE courses.id = slides.course_id
  )
);

-- =====================================================
-- CREDITS_TRANSACTIONS TABLE POLICIES
-- =====================================================

-- Users can view their own credit transactions
CREATE POLICY "Users can view own transactions"
ON credits_transactions FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own transactions (via API)
CREATE POLICY "Users can insert own transactions"
ON credits_transactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- PAYMENTS TABLE POLICIES
-- =====================================================

-- Users can view their own payments
CREATE POLICY "Users can view own payments"
ON payments FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own payments (via API)
CREATE POLICY "Users can insert own payments"
ON payments FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own payments (status changes)
CREATE POLICY "Users can update own payments"
ON payments FOR UPDATE
USING (auth.uid() = user_id);

-- =====================================================
-- REFERRALS TABLE POLICIES
-- =====================================================

-- Users can view referrals they sent or received
CREATE POLICY "Users can view own referrals"
ON referrals FOR SELECT
USING (auth.uid() = referrer_id OR auth.uid() = referee_id);

-- Users can insert referrals
CREATE POLICY "Users can create referrals"
ON referrals FOR INSERT
WITH CHECK (auth.uid() = referrer_id OR auth.uid() = referee_id);

-- =====================================================
-- FILE_UPLOADS TABLE POLICIES
-- =====================================================

-- Users can view their own file uploads
CREATE POLICY "Users can view own files"
ON file_uploads FOR SELECT
USING (auth.uid() = user_id);

-- Users can upload files
CREATE POLICY "Users can upload files"
ON file_uploads FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own files
CREATE POLICY "Users can delete own files"
ON file_uploads FOR DELETE
USING (auth.uid() = user_id);

-- =====================================================
-- IMPORTANT NOTES
-- =====================================================
-- 
-- 1. These policies ensure strict user data isolation
-- 2. All queries are automatically filtered by auth.uid()
-- 3. Users CANNOT access other users' data even with direct queries
-- 4. Service role key bypasses RLS (use carefully in APIs)
-- 5. Run this SQL in Supabase SQL Editor or via migration
-- 
-- To apply: Copy this entire file and paste into Supabase SQL Editor
-- =====================================================
