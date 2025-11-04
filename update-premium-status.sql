-- ============================================
-- UPDATE PREMIUM STATUS FOR PAYING USERS
-- ============================================
-- Ensures users who have made purchases are marked as premium
-- and grants unlimited course creation access

-- ============================================
-- 1. UPDATE EXISTING USERS WHO PURCHASED
-- ============================================
-- Mark all users who have completed payments as premium
UPDATE profiles
SET is_premium = true
WHERE id IN (
  SELECT DISTINCT user_id 
  FROM payments 
  WHERE status = 'completed'
)
AND is_premium = false;

-- Verify the update
SELECT 
  COUNT(*) as total_premium_users,
  COUNT(CASE WHEN is_premium = true THEN 1 END) as premium_count
FROM profiles;

-- ============================================
-- 2. CREATE FUNCTION TO AUTO-SET PREMIUM
-- ============================================
-- Automatically sets is_premium when payment completes
CREATE OR REPLACE FUNCTION set_premium_on_purchase()
RETURNS TRIGGER AS $$
BEGIN
  -- If payment status changed to 'completed', mark user as premium
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    UPDATE profiles
    SET is_premium = true
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS trigger_set_premium_on_purchase ON payments;

-- Create trigger on payments table
CREATE TRIGGER trigger_set_premium_on_purchase
  AFTER INSERT OR UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION set_premium_on_purchase();

-- ============================================
-- 3. VERIFICATION QUERIES
-- ============================================

-- Check premium users count
-- SELECT COUNT(*) as premium_users FROM profiles WHERE is_premium = true;

-- Check users with purchases but not premium (should be 0)
-- SELECT p.id, p.email, p.full_name, p.is_premium
-- FROM profiles p
-- INNER JOIN payments pay ON p.id = pay.user_id
-- WHERE pay.status = 'completed' AND p.is_premium = false;

-- View all premium users with their purchase info
-- SELECT 
--   p.id,
--   p.email,
--   p.full_name,
--   p.credits_balance,
--   p.is_premium,
--   COUNT(pay.id) as total_purchases,
--   SUM(pay.credits_purchased) as total_credits_purchased,
--   SUM(pay.amount) as total_spent_inr,
--   MIN(pay.created_at) as first_purchase,
--   MAX(pay.completed_at) as last_purchase
-- FROM profiles p
-- LEFT JOIN payments pay ON p.id = pay.user_id AND pay.status = 'completed'
-- WHERE p.is_premium = true
-- GROUP BY p.id, p.email, p.full_name, p.credits_balance, p.is_premium
-- ORDER BY total_spent_inr DESC;

-- ============================================
-- 4. NOTES
-- ============================================
-- After running this SQL:
-- 1. ✅ All existing users with completed payments are marked premium
-- 2. ✅ New payments automatically grant premium status via trigger
-- 3. ✅ Premium users get unlimited course creation (no 3-course limit)
-- 4. ✅ Banner about course limits won't show for premium users
-- 5. ✅ Frontend checks is_premium to hide restrictions

-- IMPORTANT: 
-- - Run this ONCE in Supabase SQL Editor
-- - The trigger ensures future purchases auto-upgrade users
-- - No manual intervention needed for new purchases
