-- Seed streaming prompt templates if not present
INSERT INTO admin_prompt_templates (key, system_preamble, template, tokens_schema)
VALUES
  (
    'stream_course_structure',
    'You are streaming a course structure progressively. Keep outputs chunk-friendly and consistent.',
    'Stream course structure for {{course.title}} ({{course.knowledge_level}}) with {{multimedia.course_type}} style and {{multimedia.voice_tone}} tone. Include modules and lesson summaries in small chunks.',
    '{"limits": {"modules": 6, "lessons": 10}}'
  ),
  (
    'stream_lesson_content',
    'You are streaming lesson content progressively, suitable for SSE chunks.',
    'Stream enhanced lesson content for {{lesson.title}} in {{module.title}} using {{multimedia.voice_tone}} tone. Emit clear, short paragraphs per chunk.',
    '{"limits": {"lessons": 10}}'
  ),
  (
    'stream_quiz_questions',
    'You are streaming quiz questions progressively.',
    'Stream a mixed set of quiz questions for {{course.title}} suitable for {{course.knowledge_level}}. Keep each item self-contained and short.',
    '{"limits": {"items": 10}}'
  ),
  (
    'stream_assessment',
    'You are streaming assessment parts progressively.',
    'Stream assessment sections for {{course.title}} aligned with outcomes. Keep rubric items concise per chunk.',
    '{"limits": {"sections": 5}}'
  )
ON CONFLICT (key) DO NOTHING;

