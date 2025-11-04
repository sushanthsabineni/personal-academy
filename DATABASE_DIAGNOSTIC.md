# 🔍 URGENT: Database Setup Diagnostic

## Problem
- ✅ Account creation shows success message
- ❌ User appears in Supabase Authentication → Users
- ❌ **BUT profile is NOT created in profiles table**
- ❌ Google OAuth also doesn't create profile

## Root Cause
**You haven't run the SQL setup script yet!** The `profiles` table either:
1. Doesn't exist at all, OR
2. Exists but the trigger isn't installed

---

## 🚨 CRITICAL STEP: Run Database Setup

### Step 1: Open Supabase SQL Editor

1. Go to: https://supabase.com/dashboard
2. Select your project: **ajnactqadrohplimjnze**
3. Click **SQL Editor** in left sidebar
4. Click **New Query**

### Step 2: Copy & Run Complete Setup

1. Open file: `supabase-complete-setup.sql` in your project
2. **Copy ENTIRE file** (all ~304 lines)
3. **Paste** into SQL Editor
4. Click **Run** (or press Ctrl+Enter)
5. Wait for "Success" message

### Step 3: Verify Setup Worked

Run this query in SQL Editor to verify:

```sql
-- Check profiles table exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- Check trigger exists
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Count existing users vs profiles
SELECT 
  (SELECT COUNT(*) FROM auth.users) as total_users,
  (SELECT COUNT(*) FROM profiles) as total_profiles;
```

**Expected Results:**
- Should see ~14 columns for profiles table
- Should see trigger `on_auth_user_created`
- May see mismatch between users and profiles (that's the problem!)

---

## 📊 Run Diagnostics

### Option 1: Check Database Connection

Visit: http://localhost:3000/api/debug/check-db

This will show:
- ✅ Environment variables configured
- ✅ Profiles table exists/doesn't exist
- ✅ Auth users count
- ✅ Sample profile data

### Option 2: Check Test Endpoint

Visit: http://localhost:3000/api/test-db

Should show:
```json
{
  "status": "success",
  "profilesQuery": "Profiles table accessible"
}
```

If you see `"relation 'profiles' does not exist"` → **Run the SQL setup!**

---

## 🔄 After Running SQL Setup

### Test Profile Creation

1. **Create a new test account:**
   - Go to: http://localhost:3000/login
   - Use email: `testuser2@example.com`
   - Password: `Test123456`
   - Click "Create Account"

2. **Check browser console** (F12 → Console tab)
   - Should see: `📝 Creating profile for user: <uuid>`
   - Should see: `✅ Profile created successfully`

3. **Verify in Supabase:**
   - Dashboard → **Table Editor** → **profiles**
   - Should see new row with your email

### Fix Existing Users (If Needed)

If you have users but no profiles, run this in SQL Editor:

```sql
-- Create profiles for existing auth users
INSERT INTO profiles (id, email, full_name, credits_balance, is_premium, referral_code)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', SPLIT_PART(au.email, '@', 1)),
  100,
  false,
  UPPER(SUBSTRING(MD5(RANDOM()::TEXT || au.id::TEXT) FROM 1 FOR 8))
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
WHERE p.id IS NULL;
```

This creates profiles for all existing users who don't have one.

---

## 🐛 Debugging Steps

### 1. Check Server Logs

Open your terminal where `npm run dev` is running and look for:
- `🔷 Profile creation API called` - API is being hit
- `❌ Profile creation error` - Shows the actual error
- `✅ Profile created successfully` - Everything worked

### 2. Check Browser Console

Press F12 → Console tab and look for:
- `📝 Creating profile for user:` - Client calling API
- `📬 Profile creation response:` - API response
- `❌ Profile creation failed:` - Error details

### 3. Check Supabase Logs

1. Go to Supabase Dashboard
2. Click **Logs** → **Postgres Logs**
3. Look for errors during account creation
4. Check for trigger execution logs

---

## ✅ Expected Behavior After Setup

### What Should Happen:

```
User Creates Account
     ↓
1. auth.users row created ✅
     ↓
2. Database trigger fires automatically ✅
     ↓
3. Trigger creates profile in profiles table ✅
     ↓
4. API route double-checks (fallback) ✅
     ↓
5. User redirected to dashboard ✅
```

### What's Currently Happening:

```
User Creates Account
     ↓
1. auth.users row created ✅
     ↓
2. No profiles table OR no trigger ❌
     ↓
3. API route tries but fails ❌
     ↓
4. Success message shown (misleading) ⚠️
     ↓
5. User can't actually use the app ❌
```

---

## 🎯 Quick Fix Checklist

- [ ] 1. Open Supabase SQL Editor
- [ ] 2. Run complete `supabase-complete-setup.sql`
- [ ] 3. Verify trigger exists (query above)
- [ ] 4. Visit `/api/debug/check-db` to confirm
- [ ] 5. Create new test account
- [ ] 6. Check browser console for logs
- [ ] 7. Verify profile created in Supabase
- [ ] 8. Run fix query for existing users (if needed)

---

## 🆘 Still Not Working?

If you've done all the above and it still doesn't work:

1. **Check environment variables:**
   ```bash
   # In your terminal
   echo $NEXT_PUBLIC_SUPABASE_URL
   echo $SUPABASE_SERVICE_ROLE_KEY
   ```

2. **Share the output of:**
   - http://localhost:3000/api/debug/check-db
   - Browser console logs (F12)
   - Terminal server logs

3. **Common issues:**
   - ❌ Service role key is wrong/missing
   - ❌ Profiles table has wrong structure
   - ❌ RLS policies blocking inserts
   - ❌ Trigger not on correct schema (should be public.profiles)

---

**Next Step:** Run the SQL setup NOW and test again. The logging I added will show exactly what's happening! 🚀
