-- ============================================
-- FIX: Create Profiles for Existing Users
-- ============================================
-- Run this in Supabase SQL Editor to fix the 4 existing users

-- First, let's check the trigger function exists
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- Now create profiles for all existing users who don't have one
-- Note: Only inserting columns that exist in your profiles table
INSERT INTO public.profiles (
  id, 
  email, 
  full_name, 
  credits_balance,
  is_admin,
  referral_code
)
SELECT 
  au.id,
  au.email,
  COALESCE(
    au.raw_user_meta_data->>'full_name',
    au.raw_user_meta_data->>'name',
    SPLIT_PART(au.email, '@', 1)
  ) as full_name,
  100 as credits_balance,
  false as is_admin,
  UPPER(SUBSTRING(MD5(RANDOM()::TEXT || au.id::TEXT) FROM 1 FOR 8)) as referral_code
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL;

-- Verify the fix worked
SELECT 
  (SELECT COUNT(*) FROM auth.users) as total_users,
  (SELECT COUNT(*) FROM public.profiles) as total_profiles,
  (SELECT COUNT(*) FROM auth.users au LEFT JOIN public.profiles p ON p.id = au.id WHERE p.id IS NULL) as missing_profiles;

-- Show the profiles that were created
SELECT id, email, full_name, credits_balance, referral_code, created_at
FROM public.profiles
ORDER BY created_at DESC;
