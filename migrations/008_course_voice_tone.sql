-- Add voice tone and branding guideline fields to courses (Step 2 multimedia)
ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS voice_tone TEXT NULL,
  ADD COLUMN IF NOT EXISTS brand_guidelines TEXT NULL;

-- Optional: constrain voice_tone to known presets via a CHECK (loose for now)
-- ALTER TABLE courses ADD CONSTRAINT chk_voice_tone_valid
--   CHECK (voice_tone IN ('professional','friendly','storytelling','guiding','authoritative'));

