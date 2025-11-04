-- Seed module_enhance prompt template if not present
INSERT INTO admin_prompt_templates (key, system_preamble, template, tokens_schema)
VALUES (
  'module_enhance',
  'You are a pedagogy expert who writes concise, engaging module descriptions that set clear expectations.',
  'Course: {{course.title}} ({{course.knowledge_level}})\nModule: {{module.title}}\nVoice: {{multimedia.voice_tone}}\n\nEnhance the module description (2-3 sentences) to be compelling, outcomes-focused, and consistent with the course tone and type.',
  '{"limits": {}}'
)
ON CONFLICT (key) DO NOTHING;

