-- Per-course storyboard export and column settings
CREATE TABLE IF NOT EXISTS course_storyboard_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  columns_enabled JSONB NOT NULL DEFAULT '{}'::jsonb,
  export_format TEXT NOT NULL DEFAULT 'csv', -- csv|xlsx|json (extend later)
  numbering_scheme TEXT NOT NULL DEFAULT 'sequential', -- sequential|module_lesson_slide
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(course_id)
);

CREATE TRIGGER course_storyboard_settings_updated_at
BEFORE UPDATE ON course_storyboard_settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE course_storyboard_settings ENABLE ROW LEVEL SECURITY;

-- RLS: owner-only access via course ownership
DROP POLICY IF EXISTS "course_storyboard_settings_owner_all" ON course_storyboard_settings;
CREATE POLICY "course_storyboard_settings_owner_all" ON course_storyboard_settings FOR ALL
  USING (EXISTS (
    SELECT 1 FROM courses c WHERE c.id = course_storyboard_settings.course_id AND c.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM courses c WHERE c.id = course_storyboard_settings.course_id AND c.user_id = auth.uid()
  ));

