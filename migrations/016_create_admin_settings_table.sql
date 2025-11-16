-- Create admin_settings table for storing admin OpenRouter configuration
-- This table stores admin-specific AI configuration like API keys, models, fallback models, etc.

CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  openrouter_api_key TEXT,
  openrouter_model TEXT DEFAULT 'openai/gpt-4o',
  openrouter_fallback_models TEXT, -- JSON array of fallback model IDs
  temperature NUMERIC DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 4096,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only manage their own settings
CREATE POLICY "Users can manage their own settings"
  ON admin_settings FOR ALL
  USING (auth.uid() = user_id);

-- Create trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_admin_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS admin_settings_updated_at ON admin_settings;
CREATE TRIGGER admin_settings_updated_at
  BEFORE UPDATE ON admin_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_settings_updated_at();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_settings_user_id ON admin_settings(user_id);
