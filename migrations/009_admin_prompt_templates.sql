-- Admin prompt templates for AI generations
CREATE TABLE IF NOT EXISTS admin_prompt_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  system_preamble TEXT,
  template TEXT NOT NULL,
  tokens_schema JSONB DEFAULT '{}'::jsonb,
  model TEXT,
  temperature NUMERIC,
  max_tokens INTEGER,
  top_p NUMERIC,
  frequency_penalty NUMERIC,
  presence_penalty NUMERIC,
  is_active BOOLEAN DEFAULT TRUE,
  version INTEGER DEFAULT 1,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER admin_prompt_templates_updated_at
BEFORE UPDATE ON admin_prompt_templates
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE admin_prompt_templates ENABLE ROW LEVEL SECURITY;

-- Admin-only access
CREATE POLICY IF NOT EXISTS "admin_prompt_templates_admin_all" ON admin_prompt_templates
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE));

-- Versions
CREATE TABLE IF NOT EXISTS admin_prompt_template_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES admin_prompt_templates(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  snapshot JSONB NOT NULL,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE admin_prompt_template_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "admin_prompt_template_versions_admin_all" ON admin_prompt_template_versions
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE));

-- Seed basic templates if not present
INSERT INTO admin_prompt_templates (key, system_preamble, template, tokens_schema)
VALUES
  (
    'learning_outcomes',
    'You are Personal Academy''s expert instructional designer. Produce specific, measurable outcomes.',
    'Course: {{course.title}}\nAudience: {{course.target_audience}}\nLevel: {{course.knowledge_level}}\nVoice: {{multimedia.voice_tone}}\nExisting outcomes (optional):\n{{essentials.learning_outcomes}}\n\nGenerate 5-7 refined outcomes using action verbs, aligned with {{course.knowledge_level}} and time constraints. Return JSON with fields: id, outcome, taxonomy, relatedTopics.',
    '{"limits": {"modules": 6, "lessons": 10, "files": 5}}'
  ),
  (
    'course_structure',
    'You are an expert course architect. Create logical modules and lessons with clear objectives.',
    'Course: {{course.title}}\nAudience: {{course.target_audience}}\nLevel: {{course.knowledge_level}}\nType: {{multimedia.course_type}}\nVoice: {{multimedia.voice_tone}}\nOutcomes: {{essentials.learning_outcomes}}\n\nCreate a course plan with modules (title, description, duration, learningObjectives) and estimated totals. Return JSON object.',
    '{"limits": {"modules": 6, "lessons": 10}}'
  ),
  (
    'lesson_enhance',
    'You are a pedagogy expert. Enhance lesson content with clarity and engagement.',
    'Course: {{course.title}} ({{course.knowledge_level}})\nModule: {{module.title}}\nLesson: {{lesson.title}}\nVoice: {{multimedia.voice_tone}}\n\nImprove the lesson content, keep facts accurate, add concrete examples, and maintain the chosen voice & tone. Return structured JSON sections.',
    '{"limits": {"examples": 3}}'
  ),
  (
    'slides',
    'You create concise, high-impact slides that teach effectively.',
    'Context:\nCourse: {{course.title}}\nModule: {{module.title}}\nLesson: {{lesson.title}}\nVoice: {{multimedia.voice_tone}}\nType: {{multimedia.course_type}}\n\nGenerate exactly 3 slides (intro/content/conclusion) with bullet content, speakerNotes, mediaNote, learningObjective, interactionType. Return JSON array.',
    '{"limits": {"slides_per_lesson": 3}}'
  )
ON CONFLICT (key) DO NOTHING;

