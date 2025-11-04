-- ============================================
-- ADD FIRST EXPORT SURVEY TRACKING TO PROFILES
-- ============================================
-- Adds a field to track if user has completed the first export survey

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS first_export_survey_completed BOOLEAN DEFAULT FALSE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_survey_completed 
ON profiles(first_export_survey_completed);

-- ============================================
-- CREATE SURVEY RESPONSES TABLE
-- ============================================
-- Stores survey responses from users

CREATE TABLE IF NOT EXISTS survey_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  survey_type TEXT NOT NULL CHECK (survey_type IN ('first_export', 'feedback', 'exit_survey')),
  responses JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_survey_responses_user_id ON survey_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_survey_type ON survey_responses(survey_type);
CREATE INDEX IF NOT EXISTS idx_survey_responses_created_at ON survey_responses(created_at DESC);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

-- Users can insert their own survey responses
CREATE POLICY survey_responses_insert ON survey_responses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can read their own survey responses
CREATE POLICY survey_responses_select ON survey_responses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can read all survey responses
CREATE POLICY survey_responses_admin_select ON survey_responses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND email IN ('your-admin-email@example.com')
    )
  );

-- ============================================
-- VERIFICATION
-- ============================================

-- Check if column was added
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'profiles' AND column_name = 'first_export_survey_completed';

-- Check survey_responses table
-- SELECT * FROM survey_responses LIMIT 5;

-- Update existing users to false (if needed)
-- UPDATE profiles SET first_export_survey_completed = FALSE WHERE first_export_survey_completed IS NULL;
