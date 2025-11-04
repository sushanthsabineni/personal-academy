-- Add blueprint fields to slides for storyboard richness
ALTER TABLE slides
  ADD COLUMN IF NOT EXISTS blueprint_type TEXT,
  ADD COLUMN IF NOT EXISTS blueprint JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS on_screen_text TEXT,
  ADD COLUMN IF NOT EXISTS visual_description TEXT,
  ADD COLUMN IF NOT EXISTS interaction_details TEXT,
  ADD COLUMN IF NOT EXISTS developer_notes TEXT,
  ADD COLUMN IF NOT EXISTS accessibility_notes TEXT,
  ADD COLUMN IF NOT EXISTS navigation_notes TEXT,
  ADD COLUMN IF NOT EXISTS assessment_mapping JSONB,
  ADD COLUMN IF NOT EXISTS media_assets JSONB;

-- Optional constraint on blueprint_type values
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'slides_blueprint_type_chk'
  ) THEN
    ALTER TABLE slides
      ADD CONSTRAINT slides_blueprint_type_chk
      CHECK (
        blueprint_type IS NULL OR blueprint_type IN (
          'scenario_based','software_sim','video_based','game_based','microlearning'
        )
      );
  END IF;
END $$;

