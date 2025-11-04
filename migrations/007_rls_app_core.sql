-- PROFILES: user can read/update own
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_select_self" ON profiles;
CREATE POLICY "profiles_select_self" ON profiles FOR SELECT USING (id = auth.uid());
DROP POLICY IF EXISTS "profiles_update_self" ON profiles;
CREATE POLICY "profiles_update_self" ON profiles FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- COURSES: owner-only access
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "courses_owner_select" ON courses;
CREATE POLICY "courses_owner_select" ON courses FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS "courses_owner_insert" ON courses;
CREATE POLICY "courses_owner_insert" ON courses FOR INSERT WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "courses_owner_update" ON courses;
CREATE POLICY "courses_owner_update" ON courses FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "courses_owner_delete" ON courses;
CREATE POLICY "courses_owner_delete" ON courses FOR DELETE USING (user_id = auth.uid());

-- MODULES: access via parent course ownership
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "modules_course_owner_all" ON modules;
CREATE POLICY "modules_course_owner_all" ON modules FOR ALL
USING (EXISTS (SELECT 1 FROM courses c WHERE c.id = modules.course_id AND c.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM courses c WHERE c.id = modules.course_id AND c.user_id = auth.uid()));

-- LESSONS: access via parent module -> course ownership
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "lessons_course_owner_all" ON lessons;
CREATE POLICY "lessons_course_owner_all" ON lessons FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM modules m
    JOIN courses c ON c.id = m.course_id
    WHERE m.id = lessons.module_id AND c.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM modules m
    JOIN courses c ON c.id = m.course_id
    WHERE m.id = lessons.module_id AND c.user_id = auth.uid()
  )
);

-- SLIDES: access via parent lesson -> module -> course ownership
ALTER TABLE slides ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "slides_course_owner_all" ON slides;
CREATE POLICY "slides_course_owner_all" ON slides FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM lessons l
    JOIN modules m ON m.id = l.module_id
    JOIN courses c ON c.id = m.course_id
    WHERE l.id = slides.lesson_id AND c.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM lessons l
    JOIN modules m ON m.id = l.module_id
    JOIN courses c ON c.id = m.course_id
    WHERE l.id = slides.lesson_id AND c.user_id = auth.uid()
  )
);

-- FILE_UPLOADS: owner-only; optional course link if exists
ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "file_uploads_owner_all" ON file_uploads;
CREATE POLICY "file_uploads_owner_all" ON file_uploads FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- PAYMENTS: owner-only
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "payments_owner_all" ON payments;
CREATE POLICY "payments_owner_all" ON payments FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- AI_GENERATIONS: owner-only
ALTER TABLE ai_generations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ai_generations_owner_all" ON ai_generations;
CREATE POLICY "ai_generations_owner_all" ON ai_generations FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
