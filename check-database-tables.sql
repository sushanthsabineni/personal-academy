-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'credits_transactions', 'payments', 'ai_generations')
ORDER BY table_name;

-- Check profiles table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Check credits_transactions table structure (if exists)
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'credits_transactions'
ORDER BY ordinal_position;

-- Check if your user has a profile
-- Replace 'YOUR_USER_ID' with your actual user ID from auth.users
-- SELECT id, email, credits_balance, is_premium FROM profiles WHERE id = 'YOUR_USER_ID';

-- Count records in each table
SELECT 
  (SELECT COUNT(*) FROM profiles) as profiles_count,
  (SELECT COUNT(*) FROM credits_transactions) as transactions_count,
  (SELECT COUNT(*) FROM payments) as payments_count,
  (SELECT COUNT(*) FROM ai_generations) as ai_generations_count;
