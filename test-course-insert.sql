-- Temporary: Disable RLS to test if that's the issue
-- WARNING: Only use this for debugging, re-enable RLS after testing!

-- Disable RLS temporarily
ALTER TABLE courses DISABLE ROW LEVEL SECURITY;

-- Test insert
INSERT INTO courses (id, user_id, title, description, status, current_step)
VALUES (
  gen_random_uuid(),
  auth.uid(),
  'Test Course',
  'Testing course creation',
  'draft',
  1
);

-- Check if insert worked
SELECT * FROM courses WHERE title = 'Test Course';

-- IMPORTANT: Re-enable RLS after testing!
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Clean up test data
DELETE FROM courses WHERE title = 'Test Course';
