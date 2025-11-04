-- Migration: Add user_preferences table for settings
-- Created: 2025-10-27

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Notification preferences
  email_new_features BOOLEAN DEFAULT TRUE,
  email_product_updates BOOLEAN DEFAULT TRUE,
  email_tips BOOLEAN DEFAULT FALSE,
  email_marketing BOOLEAN DEFAULT FALSE,
  push_course_complete BOOLEAN DEFAULT TRUE,
  push_credits_low BOOLEAN DEFAULT TRUE,
  push_referrals BOOLEAN DEFAULT TRUE,
  
  -- User preferences
  language TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'America/Los_Angeles',
  date_format TEXT DEFAULT 'MM/DD/YYYY',
  default_export_format TEXT DEFAULT 'pdf',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add updated_at trigger
CREATE TRIGGER user_preferences_updated_at
BEFORE UPDATE ON user_preferences
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Add index for faster lookups
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

-- Add RLS policies
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Users can only read their own preferences
CREATE POLICY "Users can view own preferences"
  ON user_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own preferences
CREATE POLICY "Users can insert own preferences"
  ON user_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update own preferences"
  ON user_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own preferences
CREATE POLICY "Users can delete own preferences"
  ON user_preferences
  FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE user_preferences IS 'User notification and application preferences';
