-- ============================================
-- CREDIT EXPIRATION SYSTEM
-- ============================================
-- Implements 365-day expiration for purchased credits
-- Automatically expires credits and maintains transaction history

-- Step 1: Add expiration date field to credits_transactions
ALTER TABLE credits_transactions 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Step 2: Ensure metadata column exists (it should already exist, but just in case)
ALTER TABLE credits_transactions 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Set expiration date for existing purchase transactions (365 days from creation)
UPDATE credits_transactions
SET expires_at = created_at + INTERVAL '365 days'
WHERE type = 'purchase' AND expires_at IS NULL;

-- Create index for expiration queries
CREATE INDEX IF NOT EXISTS idx_credits_expires_at ON credits_transactions(expires_at);
CREATE INDEX IF NOT EXISTS idx_credits_type_expires ON credits_transactions(type, expires_at);

-- ============================================
-- FUNCTION: Expire Old Credits
-- Runs daily to expire credits older than 365 days
-- ============================================
CREATE OR REPLACE FUNCTION expire_old_credits()
RETURNS JSON AS $$
DECLARE
  expired_count INTEGER := 0;
  total_expired_credits INTEGER := 0;
  user_record RECORD;
  expired_credits INTEGER;
BEGIN
  -- Find all purchase transactions with expired credits
  FOR user_record IN
    SELECT DISTINCT user_id
    FROM credits_transactions
    WHERE type = 'purchase'
      AND expires_at < NOW()
      AND metadata->>'expired' IS NULL  -- Not already processed
  LOOP
    -- Calculate total expired credits for this user
    SELECT COALESCE(SUM(amount), 0) INTO expired_credits
    FROM credits_transactions
    WHERE user_id = user_record.user_id
      AND type = 'purchase'
      AND expires_at < NOW()
      AND metadata->>'expired' IS NULL;
    
    IF expired_credits > 0 THEN
      -- Mark the expired purchase transactions
      UPDATE credits_transactions
      SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"expired": true}'::jsonb
      WHERE user_id = user_record.user_id
        AND type = 'purchase'
        AND expires_at < NOW()
        AND metadata->>'expired' IS NULL;
      
      -- Get current user balance
      DECLARE
        current_balance INTEGER;
        new_balance INTEGER;
      BEGIN
        SELECT credits_balance INTO current_balance
        FROM profiles
        WHERE id = user_record.user_id;
        
        -- Only deduct if user still has credits
        IF current_balance > 0 THEN
          new_balance := GREATEST(current_balance - expired_credits, 0);
          
          -- Update user's credit balance
          UPDATE profiles
          SET credits_balance = new_balance
          WHERE id = user_record.user_id;
          
          -- Create expiration transaction record
          INSERT INTO credits_transactions (
            user_id,
            amount,
            type,
            description,
            balance_after,
            metadata
          ) VALUES (
            user_record.user_id,
            -expired_credits,
            'refund',  -- Using refund type for expired credits
            'Credits expired (365 days)',
            new_balance,
            jsonb_build_object(
              'reason', 'expiration',
              'expired_credits', expired_credits,
              'expiration_date', NOW()
            )
          );
          
          expired_count := expired_count + 1;
          total_expired_credits := total_expired_credits + expired_credits;
        END IF;
      END;
    END IF;
  END LOOP;
  
  -- Return summary
  RETURN json_build_object(
    'success', true,
    'expired_users', expired_count,
    'total_credits_expired', total_expired_credits,
    'timestamp', NOW()
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'timestamp', NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION expire_old_credits() TO authenticated, service_role;

-- ============================================
-- FUNCTION: Get User's Active Credits
-- Returns only non-expired credits balance
-- ============================================
CREATE OR REPLACE FUNCTION get_active_credits(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  total_purchased INTEGER := 0;
  total_spent INTEGER := 0;
  total_earned INTEGER := 0;
  expired_credits INTEGER := 0;
  active_balance INTEGER := 0;
BEGIN
  -- Get total purchased credits (non-expired)
  SELECT COALESCE(SUM(amount), 0) INTO total_purchased
  FROM credits_transactions
  WHERE user_id = user_uuid
    AND type = 'purchase'
    AND (expires_at IS NULL OR expires_at > NOW())
    AND COALESCE((metadata->>'expired')::boolean, false) = false;
  
  -- Get total earned/bonus credits
  SELECT COALESCE(SUM(amount), 0) INTO total_earned
  FROM credits_transactions
  WHERE user_id = user_uuid
    AND type IN ('earned', 'bonus', 'referral');
  
  -- Get total spent credits
  SELECT COALESCE(SUM(ABS(amount)), 0) INTO total_spent
  FROM credits_transactions
  WHERE user_id = user_uuid
    AND type = 'spent';
  
  -- Get expired credits
  SELECT COALESCE(SUM(amount), 0) INTO expired_credits
  FROM credits_transactions
  WHERE user_id = user_uuid
    AND type = 'purchase'
    AND expires_at < NOW()
    AND COALESCE((metadata->>'expired')::boolean, false) = false;
  
  -- Calculate active balance
  active_balance := (total_purchased + total_earned) - total_spent;
  
  RETURN json_build_object(
    'active_balance', GREATEST(active_balance, 0),
    'total_purchased', total_purchased,
    'total_earned', total_earned,
    'total_spent', total_spent,
    'expired_credits', expired_credits,
    'has_expired_credits', expired_credits > 0
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_active_credits(UUID) TO authenticated, service_role;

-- ============================================
-- FUNCTION: Get Credits Expiring Soon
-- Returns credits expiring in next 30 days
-- ============================================
CREATE OR REPLACE FUNCTION get_expiring_credits(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  expiring_soon INTEGER := 0;
  expiring_transactions JSONB;
BEGIN
  -- Get total credits expiring in next 30 days
  SELECT COALESCE(SUM(amount), 0) INTO expiring_soon
  FROM credits_transactions
  WHERE user_id = user_uuid
    AND type = 'purchase'
    AND expires_at > NOW()
    AND expires_at < NOW() + INTERVAL '30 days'
    AND COALESCE((metadata->>'expired')::boolean, false) = false;
  
  -- Get list of expiring transactions
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'amount', amount,
      'expires_at', expires_at,
      'days_until_expiry', EXTRACT(DAY FROM (expires_at - NOW())),
      'invoice_number', invoice_number,
      'created_at', created_at
    ) ORDER BY expires_at
  ), '[]'::jsonb) INTO expiring_transactions
  FROM credits_transactions
  WHERE user_id = user_uuid
    AND type = 'purchase'
    AND expires_at > NOW()
    AND expires_at < NOW() + INTERVAL '30 days'
    AND COALESCE((metadata->>'expired')::boolean, false) = false;
  
  RETURN json_build_object(
    'expiring_soon', expiring_soon,
    'transactions', expiring_transactions,
    'has_expiring_credits', expiring_soon > 0
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_expiring_credits(UUID) TO authenticated, service_role;

-- ============================================
-- TRIGGER: Set Expiration Date on Purchase
-- Automatically sets 365-day expiration for new purchases
-- ============================================
CREATE OR REPLACE FUNCTION set_credit_expiration()
RETURNS TRIGGER AS $$
BEGIN
  -- Only set expiration for purchase transactions
  IF NEW.type = 'purchase' AND NEW.expires_at IS NULL THEN
    NEW.expires_at := NEW.created_at + INTERVAL '365 days';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trigger_set_credit_expiration ON credits_transactions;

CREATE TRIGGER trigger_set_credit_expiration
  BEFORE INSERT ON credits_transactions
  FOR EACH ROW
  EXECUTE FUNCTION set_credit_expiration();

-- ============================================
-- VIEW: Credits Expiring Soon
-- Shows all users with credits expiring in next 30 days
-- ============================================
CREATE OR REPLACE VIEW credits_expiring_soon AS
SELECT 
  p.id as user_id,
  p.email,
  p.full_name,
  SUM(ct.amount) as expiring_credits,
  MIN(ct.expires_at) as earliest_expiry,
  COUNT(*) as expiring_transactions
FROM profiles p
JOIN credits_transactions ct ON p.id = ct.user_id
WHERE ct.type = 'purchase'
  AND ct.expires_at > NOW()
  AND ct.expires_at < NOW() + INTERVAL '30 days'
  AND COALESCE((ct.metadata->>'expired')::boolean, false) = false
GROUP BY p.id, p.email, p.full_name
ORDER BY earliest_expiry;

-- Grant select permission on view
GRANT SELECT ON credits_expiring_soon TO authenticated, service_role;

-- ============================================
-- VIEW: Expired Credits Report
-- Shows all users with expired credits
-- ============================================
CREATE OR REPLACE VIEW expired_credits_report AS
SELECT 
  p.id as user_id,
  p.email,
  p.full_name,
  SUM(ct.amount) as expired_credits,
  MAX(ct.expires_at) as last_expiry_date,
  COUNT(*) as expired_transactions
FROM profiles p
JOIN credits_transactions ct ON p.id = ct.user_id
WHERE ct.type = 'purchase'
  AND ct.expires_at < NOW()
  AND COALESCE((ct.metadata->>'expired')::boolean, false) = false
GROUP BY p.id, p.email, p.full_name
ORDER BY last_expiry_date DESC;

-- Grant select permission on view
GRANT SELECT ON expired_credits_report TO authenticated, service_role;

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================
COMMENT ON FUNCTION expire_old_credits() IS 
'Runs daily (via cron) to expire credits older than 365 days. Deducts expired credits from user balance and creates expiration transaction records.';

COMMENT ON FUNCTION get_active_credits(UUID) IS 
'Returns users active (non-expired) credit balance excluding expired purchases.';

COMMENT ON FUNCTION get_expiring_credits(UUID) IS 
'Returns credits expiring in the next 30 days for a specific user. Useful for sending reminder emails.';

COMMENT ON VIEW credits_expiring_soon IS 
'Shows all users with credits expiring in the next 30 days. Use for automated reminder emails.';

COMMENT ON VIEW expired_credits_report IS 
'Shows all users with expired but not yet processed credits. Use for monitoring expiration job effectiveness.';

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these after installation to verify setup

-- 1. Check if expiration field was added
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'credits_transactions' AND column_name = 'expires_at';

-- 2. Check if trigger was created
-- SELECT tgname FROM pg_trigger WHERE tgname = 'trigger_set_credit_expiration';

-- 3. Test expiration function (dry run - won't actually expire anything yet)
-- SELECT expire_old_credits();

-- 4. View credits expiring soon
-- SELECT * FROM credits_expiring_soon;

-- 5. Check expired credits report
-- SELECT * FROM expired_credits_report;

-- ============================================
-- SETUP COMPLETE
-- ============================================
-- Next Steps:
-- 1. Add this to pg_cron schedule (runs daily at 3 AM UTC):
--    SELECT cron.schedule('expire-old-credits', '0 3 * * *', $$ SELECT expire_old_credits(); $$);
--
-- 2. Or create Next.js API endpoint at /api/cron/expire-credits
--
-- 3. Add email notifications when credits are about to expire (7 days, 1 day warnings)
--
-- 4. Update frontend to show expiration dates and warnings
