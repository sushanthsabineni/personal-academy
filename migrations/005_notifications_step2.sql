-- ============================================
-- STEP 3: Insert test notifications
-- IMPORTANT: Replace 'YOUR_USER_ID_HERE' with your actual user ID
-- ============================================

-- Example of what your user ID looks like:
-- '7f8e9d0c-1a2b-3c4d-5e6f-7a8b9c0d1e2f'

INSERT INTO notifications (user_id, title, body, type, icon, link, read) VALUES
  ('f2d50e68-fb4b-4a00-ae29-a5c401ab0ae0', 'Welcome to Personal Academy!', 'Your account has been set up successfully. Start creating your first course!', 'success', '🎉', '/dashboard', FALSE),
  ('f2d50e68-fb4b-4a00-ae29-a5c401ab0ae0', 'Credits Running Low', 'You have 50 credits remaining. Consider purchasing more to continue creating courses.', 'warning', '⚠️', '/account/credits', FALSE),
  ('f2d50e68-fb4b-4a00-ae29-a5c401ab0ae0', 'Course Completed! 🎓', 'Congratulations! Your course "Introduction to AI" has been completed and is ready to export.', 'course', '✅', '/dashboard', FALSE),
  ('f2d50e68-fb4b-4a00-ae29-a5c401ab0ae0', 'Referral Reward Earned! 🎁', 'You earned 500 credits from your referral! Your friend just made their first purchase.', 'referral', '💰', '/account/referrals', FALSE);

-- ============================================
-- STEP 4: Verify notifications were created
-- ============================================

SELECT id, title, body, type, read, created_at 
FROM notifications 
WHERE user_id = 'f2d50e68-fb4b-4a00-ae29-a5c401ab0ae0'
ORDER BY created_at DESC;

-- Check unread count
SELECT get_unread_notification_count('f2d50e68-fb4b-4a00-ae29-a5c401ab0ae0'::UUID) as unread_count;
