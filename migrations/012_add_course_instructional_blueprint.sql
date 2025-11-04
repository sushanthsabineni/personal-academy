-- Add instructional_model and course_blueprint_type to courses
ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS instructional_model TEXT,
  ADD COLUMN IF NOT EXISTS course_blueprint_type TEXT;

-- Optional: basic CHECK constraints to limit common values (non-breaking if others used)
DO $$ BEGIN
  -- create enum-like constraints only if not present
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'courses_instructional_model_chk'
  ) THEN
    ALTER TABLE courses
      ADD CONSTRAINT courses_instructional_model_chk
      CHECK (
        instructional_model IS NULL OR instructional_model IN (
          'addie','sam','action_mapping','blooms_taxonomy','merrills_first_principles','seventy_twenty_ten','ai_decide'
        )
      );
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'courses_blueprint_type_chk'
  ) THEN
    ALTER TABLE courses
      ADD CONSTRAINT courses_blueprint_type_chk
      CHECK (
        course_blueprint_type IS NULL OR course_blueprint_type IN (
          'scenario_based','software_sim','video_based','game_based','microlearning'
        )
      );
  END IF;
END $$;

