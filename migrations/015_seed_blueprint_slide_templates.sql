-- Seed per-blueprint slide templates
INSERT INTO admin_prompt_templates (key, system_preamble, template, tokens_schema)
VALUES
  (
    'slides_scenario_based',
    'You create concise, high-impact scenario-based slides with branching decisions and consequences. Output valid JSON only.',
    'Context:\nCourse: {{course.title}}\nModule: {{module.title}}\nLesson: {{lesson.title}}\nVoice: {{multimedia.voice_tone}}\nInstructional: {{instructional.model}}\nBlueprint: {{blueprint.type}}\n\nGenerate exactly 3 slides with fields: slideNumber, title, type (intro|content|conclusion), content (bullets), speakerNotes, mediaNote, learningObjective, interactionType.\nAdditionally include blueprint JSON with: characters, dialogue, decisions, consequences, flowchart.\nKeep bullets concise; return JSON array.',
    '{"limits": {"slides_per_lesson": 3}}'
  ),
  (
    'slides_software_sim',
    'You create software simulation slides with precise on-screen interactions. Output valid JSON only.',
    'Context:\nCourse: {{course.title}}\nModule: {{module.title}}\nLesson: {{lesson.title}}\nVoice: {{multimedia.voice_tone}}\nBlueprint: {{blueprint.type}}\n\nGenerate exactly 3 slides with: slideNumber, title, type, content, speakerNotes, mediaNote, learningObjective, interactionType.\nAdditionally include blueprint JSON with: screens, clicks, hotspots, errors, responses.\nReturn JSON array.',
    '{"limits": {"slides_per_lesson": 3}}'
  ),
  (
    'slides_video_based',
    'You create video-based storyboard slides with production guidance. Output valid JSON only.',
    'Context:\nCourse: {{course.title}}\nModule: {{module.title}}\nLesson: {{lesson.title}}\nVoice: {{multimedia.voice_tone}}\nBlueprint: {{blueprint.type}}\n\nGenerate exactly 3 slides with: slideNumber, title, type, content, speakerNotes, mediaNote, learningObjective, interactionType.\nAdditionally include blueprint JSON with: shots, cameraAngles, broll, graphics, captions.\nTimecodes are free-form (optional). Return JSON array.',
    '{"limits": {"slidaes_per_lesson": 3}}'
  ),
  (
    'slides_game_based',
    'You create game-based storyboard slides with mechanics and progression. Output valid JSON only.',
    'Context:\nCourse: {{course.title}}\nModule: {{module.title}}\nLesson: {{lesson.title}}\nVoice: {{multimedia.voice_tone}}\nBlueprint: {{blueprint.type}}\n\nGenerate exactly 3 slides with: slideNumber, title, type, content, speakerNotes, mediaNote, learningObjective, interactionType.\nAdditionally include blueprint JSON with: mechanics, scoring, levels, rewards, leaderboard.\nReturn JSON array.',
    '{"limits": {"slides_per_lesson": 3}}'
  ),
  (
    'slides_microlearning',
    'You create microlearning slides with minimal, focused content. Output valid JSON only.',
    'Context:\nCourse: {{course.title}}\nModule: {{module.title}}\nLesson: {{lesson.title}}\nVoice: {{multimedia.voice_tone}}\nBlueprint: {{blueprint.type}}\n\nGenerate exactly 3 slides with: slideNumber, title, type, content, speakerNotes, mediaNote, learningObjective, interactionType.\nAdditionally include blueprint JSON with: keyConcept, visual, interaction, quickAssessment.\nReturn JSON array.',
    '{"limits": {"slides_per_lesson": 3}}'
  )
ON CONFLICT (key) DO NOTHING;

