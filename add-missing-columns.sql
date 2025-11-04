-- ============================================
-- ADD MISSING COLUMNS TO PROFILES TABLE
-- ============================================
-- Your table is missing is_premium and auth_provider columns
-- Run this AFTER fix-existing-users.sql

-- Add is_premium column
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE;

-- Add auth_provider column
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS auth_provider TEXT DEFAULT 'email' 
CHECK (auth_provider IN ('email', 'google', 'github', 'microsoft'));

-- Add email_verified column (also missing)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

-- Add last_login_at column (also missing)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

-- Verify all columns now exist
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Update existing profiles to have correct auth_provider based on metadata
UPDATE public.profiles p
SET auth_provider = COALESCE(
  (SELECT au.raw_app_meta_data->>'provider' 
   FROM auth.users au 
   WHERE au.id = p.id),
  'email'
)
WHERE auth_provider IS NULL OR auth_provider = 'email';

-- Show final result
SELECT 
  id, 
  email, 
  full_name, 
  credits_balance, 
  is_premium,
  is_admin,
  auth_provider,
  referral_code,
  created_at
FROM public.profiles
ORDER BY created_at DESC;
