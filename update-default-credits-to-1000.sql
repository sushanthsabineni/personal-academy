-- ============================================
-- UPDATE DEFAULT CREDITS FROM 100 TO 1000
-- ============================================
-- Updates the default credits_balance for new users from 100 to 1000

-- Update the default value in the profiles table
ALTER TABLE profiles 
ALTER COLUMN credits_balance SET DEFAULT 1000;

-- Optional: Update existing users who still have exactly 100 credits (haven't made purchases or spent credits)
-- Uncomment the following lines if you want to give existing users the additional 900 credits:

-- UPDATE profiles
-- SET credits_balance = 1000
-- WHERE credits_balance = 100;

-- Add a transaction record for users who received the bonus (optional)
-- INSERT INTO credits_transactions (user_id, amount, type, description, balance_after, metadata)
-- SELECT 
--   id as user_id,
--   900 as amount,
--   'bonus' as type,
--   'Welcome bonus - Credits upgrade from 100 to 1000' as description,
--   1000 as balance_after,
--   jsonb_build_object('reason', 'credits_upgrade', 'previous_balance', 100) as metadata
-- FROM profiles
-- WHERE credits_balance = 100;

-- ============================================
-- VERIFICATION
-- ============================================
-- Check that the default has been updated
-- SELECT column_name, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'profiles' AND column_name = 'credits_balance';

-- Result should show: column_default = '1000'

-- ============================================
-- NOTES
-- ============================================
-- 1. This only affects NEW users signing up after this change
-- 2. To update existing users, uncomment the UPDATE and INSERT statements above
-- 3. The transaction record helps maintain audit trail for the bonus credits
-- 4. Run this in your Supabase SQL editor
