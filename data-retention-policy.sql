-- ============================================
-- DATA RETENTION POLICY IMPLEMENTATION
-- ============================================
-- Active account data: Retained while active + 6 months
-- Deleted account data: Removed within 30 days
-- Payment records: Retained for 7 years (Indian tax law compliance)

-- Step 1: Add retention fields to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deletion_scheduled_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS inactive_since TIMESTAMPTZ;

-- Create index for cleanup queries
CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at ON profiles(deleted_at);
CREATE INDEX IF NOT EXISTS idx_profiles_deletion_scheduled ON profiles(deletion_scheduled_at);
CREATE INDEX IF NOT EXISTS idx_profiles_last_activity ON profiles(last_activity_at);

-- Step 2: Add retention fields to other tables
ALTER TABLE courses ADD COLUMN IF NOT EXISTS should_retain_until TIMESTAMPTZ;
ALTER TABLE credits_transactions ADD COLUMN IF NOT EXISTS should_retain_until TIMESTAMPTZ;
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS should_retain_until TIMESTAMPTZ;
ALTER TABLE file_uploads ADD COLUMN IF NOT EXISTS should_retain_until TIMESTAMPTZ;

-- Payment records need special handling for 7-year retention
ALTER TABLE payments ADD COLUMN IF NOT EXISTS should_retain_until TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 years';

CREATE INDEX IF NOT EXISTS idx_payments_retain_until ON payments(should_retain_until);

-- ============================================
-- FUNCTION: Schedule Account Deletion
-- Called when user requests account deletion
-- ============================================
CREATE OR REPLACE FUNCTION schedule_account_deletion(
  user_uuid UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Mark account for deletion in 30 days
  UPDATE profiles
  SET 
    deletion_scheduled_at = NOW(),
    deleted_at = NOW() + INTERVAL '30 days'
  WHERE id = user_uuid;
  
  -- Set retention periods for user data (6 months from deletion)
  UPDATE courses
  SET should_retain_until = NOW() + INTERVAL '6 months'
  WHERE user_id = user_uuid;
  
  UPDATE credits_transactions
  SET should_retain_until = NOW() + INTERVAL '6 months'
  WHERE user_id = user_uuid;
  
  UPDATE referrals
  SET should_retain_until = NOW() + INTERVAL '6 months'
  WHERE referrer_id = user_uuid OR referee_id = user_uuid;
  
  UPDATE file_uploads
  SET should_retain_until = NOW() + INTERVAL '6 months'
  WHERE user_id = user_uuid;
  
  -- Payment records retain for 7 years (already set by default)
  -- No update needed for payments table
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCTION: Cancel Account Deletion
-- Called if user logs in during 30-day grace period
-- ============================================
CREATE OR REPLACE FUNCTION cancel_account_deletion(
  user_uuid UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Remove deletion schedule
  UPDATE profiles
  SET 
    deletion_scheduled_at = NULL,
    deleted_at = NULL
  WHERE id = user_uuid;
  
  -- Remove retention periods from user data
  UPDATE courses
  SET should_retain_until = NULL
  WHERE user_id = user_uuid;
  
  UPDATE credits_transactions
  SET should_retain_until = NULL
  WHERE user_id = user_uuid;
  
  UPDATE referrals
  SET should_retain_until = NULL
  WHERE referrer_id = user_uuid OR referee_id = user_uuid;
  
  UPDATE file_uploads
  SET should_retain_until = NULL
  WHERE user_id = user_uuid;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCTION: Mark Inactive Accounts
-- Run daily to identify accounts inactive for 6+ months
-- ============================================
CREATE OR REPLACE FUNCTION mark_inactive_accounts()
RETURNS INTEGER AS $$
DECLARE
  affected_count INTEGER;
BEGIN
  UPDATE profiles
  SET inactive_since = NOW()
  WHERE 
    last_activity_at < NOW() - INTERVAL '6 months'
    AND inactive_since IS NULL
    AND deleted_at IS NULL;
  
  GET DIAGNOSTICS affected_count = ROW_COUNT;
  RETURN affected_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCTION: Cleanup Deleted User Data
-- Run daily to remove data past deletion date
-- ============================================
CREATE OR REPLACE FUNCTION cleanup_deleted_user_data()
RETURNS JSON AS $$
DECLARE
  deleted_profiles INTEGER := 0;
  deleted_courses INTEGER := 0;
  deleted_transactions INTEGER := 0;
  deleted_referrals INTEGER := 0;
  deleted_files INTEGER := 0;
  result JSON;
BEGIN
  -- Delete file_uploads first (has foreign keys)
  DELETE FROM file_uploads
  WHERE should_retain_until IS NOT NULL 
    AND should_retain_until < NOW();
  GET DIAGNOSTICS deleted_files = ROW_COUNT;
  
  -- Delete courses and related data
  DELETE FROM slides
  WHERE lesson_id IN (
    SELECT l.id FROM lessons l
    JOIN courses c ON l.course_id = c.id
    WHERE c.should_retain_until IS NOT NULL 
      AND c.should_retain_until < NOW()
  );
  
  DELETE FROM lessons
  WHERE course_id IN (
    SELECT id FROM courses
    WHERE should_retain_until IS NOT NULL 
      AND should_retain_until < NOW()
  );
  
  DELETE FROM modules
  WHERE course_id IN (
    SELECT id FROM courses
    WHERE should_retain_until IS NOT NULL 
      AND should_retain_until < NOW()
  );
  
  DELETE FROM courses
  WHERE should_retain_until IS NOT NULL 
    AND should_retain_until < NOW();
  GET DIAGNOSTICS deleted_courses = ROW_COUNT;
  
  -- Delete expired transactions (but keep payment records)
  DELETE FROM credits_transactions
  WHERE should_retain_until IS NOT NULL 
    AND should_retain_until < NOW();
  GET DIAGNOSTICS deleted_transactions = ROW_COUNT;
  
  -- Delete expired referrals
  DELETE FROM referrals
  WHERE should_retain_until IS NOT NULL 
    AND should_retain_until < NOW();
  GET DIAGNOSTICS deleted_referrals = ROW_COUNT;
  
  -- Finally, delete profiles past deletion date
  DELETE FROM profiles
  WHERE deleted_at IS NOT NULL 
    AND deleted_at < NOW();
  GET DIAGNOSTICS deleted_profiles = ROW_COUNT;
  
  -- Return summary
  result := json_build_object(
    'deleted_profiles', deleted_profiles,
    'deleted_courses', deleted_courses,
    'deleted_transactions', deleted_transactions,
    'deleted_referrals', deleted_referrals,
    'deleted_files', deleted_files,
    'timestamp', NOW()
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCTION: Cleanup Old Payment Records
-- Run monthly to remove payment records older than 7 years
-- ============================================
CREATE OR REPLACE FUNCTION cleanup_old_payment_records()
RETURNS JSON AS $$
DECLARE
  deleted_payments INTEGER := 0;
  result JSON;
BEGIN
  -- Delete payment records older than 7 years
  DELETE FROM payments
  WHERE should_retain_until IS NOT NULL 
    AND should_retain_until < NOW();
  GET DIAGNOSTICS deleted_payments = ROW_COUNT;
  
  result := json_build_object(
    'deleted_payments', deleted_payments,
    'timestamp', NOW()
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCTION: Update Last Activity
-- Called on user login/activity
-- ============================================
CREATE OR REPLACE FUNCTION update_user_activity(
  user_uuid UUID
)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET 
    last_activity_at = NOW(),
    inactive_since = NULL
  WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGER: Auto-update activity on profile update
-- ============================================
CREATE OR REPLACE FUNCTION trigger_update_activity()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_activity_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_activity_update ON profiles;
CREATE TRIGGER profiles_activity_update
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  WHEN (OLD.* IS DISTINCT FROM NEW.*)
  EXECUTE FUNCTION trigger_update_activity();

-- ============================================
-- VIEW: Accounts Scheduled for Deletion
-- For admin monitoring
-- ============================================
CREATE OR REPLACE VIEW accounts_pending_deletion AS
SELECT 
  id,
  email,
  full_name,
  deletion_scheduled_at,
  deleted_at,
  deleted_at - NOW() as days_until_deletion
FROM profiles
WHERE deletion_scheduled_at IS NOT NULL
ORDER BY deleted_at ASC;

-- ============================================
-- VIEW: Inactive Accounts
-- For admin monitoring
-- ============================================
CREATE OR REPLACE VIEW inactive_accounts AS
SELECT 
  id,
  email,
  full_name,
  last_activity_at,
  inactive_since,
  NOW() - last_activity_at as inactive_duration
FROM profiles
WHERE inactive_since IS NOT NULL
  AND deleted_at IS NULL
ORDER BY last_activity_at ASC;

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================
COMMENT ON FUNCTION schedule_account_deletion IS 'Schedules account deletion with 30-day grace period. Sets retention periods for user data.';
COMMENT ON FUNCTION cancel_account_deletion IS 'Cancels scheduled account deletion if user returns within grace period.';
COMMENT ON FUNCTION cleanup_deleted_user_data IS 'Removes user data past retention period (30 days after deletion). Run daily.';
COMMENT ON FUNCTION cleanup_old_payment_records IS 'Removes payment records older than 7 years per Indian tax law. Run monthly.';
COMMENT ON FUNCTION mark_inactive_accounts IS 'Identifies accounts inactive for 6+ months. Run daily.';
COMMENT ON FUNCTION update_user_activity IS 'Updates last activity timestamp for user.';

-- ============================================
-- GRANT PERMISSIONS
-- ============================================
GRANT EXECUTE ON FUNCTION schedule_account_deletion TO authenticated;
GRANT EXECUTE ON FUNCTION cancel_account_deletion TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_activity TO authenticated;

-- Only service role can run cleanup functions
REVOKE EXECUTE ON FUNCTION cleanup_deleted_user_data FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION cleanup_old_payment_records FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION mark_inactive_accounts FROM PUBLIC;

-- ============================================
-- SETUP COMPLETE
-- ============================================
-- Next steps:
-- 1. Set up Supabase Edge Functions or cron jobs to run:
--    - cleanup_deleted_user_data() - Daily
--    - cleanup_old_payment_records() - Monthly
--    - mark_inactive_accounts() - Daily
-- 2. Implement account deletion API endpoint
-- 3. Update privacy policy with retention details
