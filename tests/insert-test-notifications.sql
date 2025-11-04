-- Complete SQL script to create notifications table and insert test data
-- Run this entire script in Supabase SQL Editor

-- ============================================
-- STEP 1: Create notifications table
-- ============================================

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  icon TEXT,
  link TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Add RLS policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;
DROP POLICY IF EXISTS "Service can insert notifications" ON notifications;

-- Users can only view their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
  ON notifications
  FOR DELETE
  USING (auth.uid() = user_id);

-- Service role can insert notifications for any user
CREATE POLICY "Service can insert notifications"
  ON notifications
  FOR INSERT
  WITH CHECK (true);

-- Add comment
COMMENT ON TABLE notifications IS 'In-app notifications for users';

-- ============================================
-- STEP 2: Create helper function
-- ============================================

-- Create function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM notifications
    WHERE user_id = user_uuid AND read = FALSE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STEP 3: Insert test notifications
-- ============================================

-- First, get your user ID (uncomment and run this query first):
-- SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- Then replace 'YOUR_USER_ID_HERE' with your actual user ID in the queries below:

-- Test notification 1: Welcome message
INSERT INTO notifications (user_id, title, body, type, icon, link, read)
VALUES (
  'YOUR_USER_ID_HERE',
  'Welcome to Personal Academy!',
  'Your account has been set up successfully. Start creating your first course!',
  'success',
  '🎉',
  '/dashboard',
  FALSE
);

-- Test notification 2: Credits warning
INSERT INTO notifications (user_id, title, body, type, icon, link, read)
VALUES (
  'YOUR_USER_ID_HERE',
  'Credits Running Low',
  'You have 50 credits remaining. Consider purchasing more to continue creating courses.',
  'warning',
  '⚠️',
  '/account/credits',
  FALSE
);

-- Test notification 3: Course completed
INSERT INTO notifications (user_id, title, body, type, icon, link, read)
VALUES (
  'YOUR_USER_ID_HERE',
  'Course Completed! 🎓',
  'Congratulations! Your course "Introduction to AI" has been completed and is ready to export.',
  'course',
  '✅',
  '/dashboard',
  FALSE
);

-- Test notification 4: Referral reward
INSERT INTO notifications (user_id, title, body, type, icon, link, read)
VALUES (
  'YOUR_USER_ID_HERE',
  'Referral Reward Earned! 🎁',
  'You earned 500 credits from your referral! Your friend just made their first purchase.',
  'referral',
  '💰',
  '/account/referrals',
  FALSE
);

-- ============================================
-- STEP 4: Verify notifications were created
-- ============================================

-- Verify the notifications (replace YOUR_USER_ID_HERE):
-- SELECT id, title, body, type, read, created_at 
-- FROM notifications 
-- WHERE user_id = 'YOUR_USER_ID_HERE' 
-- ORDER BY created_at DESC;

-- Check unread count:
-- SELECT get_unread_notification_count('YOUR_USER_ID_HERE');
