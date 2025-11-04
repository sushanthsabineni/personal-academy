-- Add the 'ai_generated' column to the 'lessons' table
ALTER TABLE lessons
ADD COLUMN ai_generated BOOLEAN DEFAULT FALSE;