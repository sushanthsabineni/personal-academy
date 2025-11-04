-- ============================================
-- AUTOMATIC PROFILE CREATION TRIGGER
-- ============================================
-- This trigger automatically creates a profile entry
-- when a new user signs up via Supabase Auth

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    credits_balance,
    is_premium,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    100, -- Starting credits
    false,
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger that fires after user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- NOTES:
-- ============================================
-- 1. Run this SQL in Supabase SQL Editor
-- 2. This will automatically create profiles for new users
-- 3. The API route /api/auth/create-profile is still useful
--    as a fallback for existing users or manual profile creation
