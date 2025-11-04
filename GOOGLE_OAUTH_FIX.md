# Google OAuth Fix - Using Supabase Native OAuth

## Problem
The application was experiencing `nextCookies.get is not a function` error during Google OAuth callback. This was caused by:
1. Incorrect usage of `createRouteHandlerClient` with async cookies wrapper
2. Attempting to use custom Google OAuth instead of Supabase's built-in OAuth

## Solution Applied

### 1. Fixed Cookie Handling in Auth Callback
**File**: `app/auth/callback/route.ts`

**Before (BROKEN)**:
```typescript
const cookieStore = await cookies()
const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })
```

**After (FIXED)**:
```typescript
const supabase = createRouteHandlerClient<Database>({ cookies })
```

**Why**: The `createRouteHandlerClient` from `@supabase/auth-helpers-nextjs` v0.10.0 expects the `cookies` function itself, not a wrapper. It calls `cookies()` internally.

### 2. Fixed Server Supabase Client
**File**: `lib/supabase/server.ts`

**Before (BROKEN)**:
```typescript
export const createServerSupabaseClient = async () => {
  const cookieStore = await cookies()
  return createRouteHandlerClient<Database>(
    { cookies: () => cookieStore }
  )
}
```

**After (FIXED)**:
```typescript
export const createServerSupabaseClient = async () => {
  return createRouteHandlerClient<Database>({ cookies })
}
```

## How to Configure Supabase OAuth (One-Time Setup)

### Step 1: Enable Google Provider in Supabase Dashboard

1. Go to: https://supabase.com/dashboard
2. Select your project: `ajnactqadrohplimjnze`
3. Navigate to: **Authentication** → **Providers**
4. Find **Google** and click to configure

### Step 2: Create Google OAuth Credentials

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click: **Create Credentials** → **OAuth 2.0 Client ID**
3. Application type: **Web application**
4. Name: `Personal Academy - Supabase Auth`

5. **Authorized JavaScript origins**:
   ```
   http://localhost:3000
   http://localhost:3001
   https://personalacademy.app
   ```

6. **Authorized redirect URIs** (IMPORTANT - Use Supabase's URL):
   ```
   https://ajnactqadrohplimjnze.supabase.co/auth/v1/callback
   ```
   
   **DO NOT USE**: `https://personalacademy.app/auth/callback` - This is handled by Supabase!

7. Click **Create** and copy:
   - Client ID
   - Client Secret

### Step 3: Configure in Supabase Dashboard

Back in Supabase Authentication → Providers → Google:

1. **Enable Google provider**: Toggle ON
2. Paste **Client ID** (from Google Console)
3. Paste **Client Secret** (from Google Console)
4. **Redirect URL** should show: `https://ajnactqadrohplimjnze.supabase.co/auth/v1/callback`
5. Click **Save**

### Step 4: Update Site URL in Supabase

1. In Supabase Dashboard: **Authentication** → **URL Configuration**
2. Set **Site URL**: 
   - Development: `http://localhost:3000`
   - Production: `https://personalacademy.app`
3. Add **Redirect URLs**:
   ```
   http://localhost:3000/auth/callback
   http://localhost:3001/auth/callback
   https://personalacademy.app/auth/callback
   ```
4. Click **Save**

### Step 5: Remove Unnecessary Environment Variables

Your `.env.local` file should **NOT** contain these (Supabase handles them):
```bash
# ❌ REMOVE THESE - Not needed with Supabase OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=...
```

Keep only Supabase credentials:
```bash
# ✅ KEEP THESE
NEXT_PUBLIC_SUPABASE_URL=https://ajnactqadrohplimjnze.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

## How OAuth Flow Works Now

### User Journey:
1. **User clicks** "Sign in with Google" on `/login` page
2. **Browser redirects** to Google consent screen
3. **User approves** → Google redirects to Supabase:
   ```
   https://ajnactqadrohplimjnze.supabase.co/auth/v1/callback?code=...
   ```
4. **Supabase processes** the OAuth code and redirects to your app:
   ```
   http://localhost:3000/auth/callback?code=...
   ```
5. **Your callback handler** (`app/auth/callback/route.ts`):
   - Exchanges code for session
   - Sets auth cookies
   - Creates profile in database (if needed)
   - Redirects to `/dashboard`

### Code Flow (app/login/page.tsx):
```typescript
const handleGoogleSignIn = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      // ☝️ This is YOUR app's callback, not Google's!
    },
  })
}
```

**Key Point**: The `redirectTo` is where Supabase sends the user AFTER processing OAuth with Google. It's not the same as Google's OAuth redirect URI.

## Testing the Fix

### Local Testing:
1. **Start dev server**:
   ```bash
   npm run dev
   ```

2. **Open browser**: http://localhost:3000/login

3. **Click "Sign in with Google"**

4. **Expected behavior**:
   - ✅ Google consent screen opens
   - ✅ After approval → brief redirect through Supabase
   - ✅ Lands on: `http://localhost:3000/auth/callback?code=...`
   - ✅ Callback processes successfully (no `nextCookies.get` error)
   - ✅ Redirects to: `http://localhost:3000/dashboard`
   - ✅ Dashboard shows user's courses
   - ✅ Header shows user's name and Google profile picture

### Check Server Logs:
You should see:
```
🔷 OAuth callback - exchanging code for session
✅ Session established for user: user@example.com
🔍 Checking if profile exists...
✅ Profile already exists
🎉 OAuth login complete, redirecting to dashboard
```

## Common Issues & Solutions

### Issue 1: "Invalid OAuth redirect URI"
**Cause**: Google Console redirect URI doesn't match Supabase's callback URL
**Fix**: In Google Console, use: `https://ajnactqadrohplimjnze.supabase.co/auth/v1/callback`

### Issue 2: "nextCookies.get is not a function"
**Cause**: Incorrect cookies usage in `createRouteHandlerClient`
**Fix**: Use `{ cookies }` directly, not `{ cookies: () => cookieStore }`
**Status**: ✅ FIXED in this commit

### Issue 3: Redirect loops after Google sign-in
**Cause**: Site URL not configured in Supabase
**Fix**: Set Site URL in Supabase Dashboard → Authentication → URL Configuration

### Issue 4: Profile not created after OAuth
**Cause**: Missing admin permissions or trigger not working
**Fix**: Callback uses service role key to create profile manually

## Files Changed

- ✅ `app/auth/callback/route.ts` - Fixed cookies usage
- ✅ `lib/supabase/server.ts` - Fixed createServerSupabaseClient
- ✅ `app/login/page.tsx` - Already correct (uses Supabase OAuth)

## Production Deployment

When deploying to production:

1. **Update Supabase Site URL**: `https://personalacademy.app`
2. **Add Google OAuth Origin**: `https://personalacademy.app`
3. **Verify Redirect URL**: Already includes personalacademy.app
4. **Test OAuth flow**: From production domain

## Verification Checklist

- [ ] Google OAuth credentials created in Google Console
- [ ] Redirect URI in Google Console: `https://ajnactqadrohplimjnze.supabase.co/auth/v1/callback`
- [ ] Google provider enabled in Supabase Dashboard
- [ ] Client ID and Secret configured in Supabase
- [ ] Site URL configured in Supabase: `http://localhost:3000`
- [ ] Redirect URLs added in Supabase
- [ ] Code changes applied (cookies fix)
- [ ] Tested locally: Google sign-in works
- [ ] No `nextCookies.get` error
- [ ] Profile created automatically
- [ ] User redirected to dashboard

## Next Steps

1. Complete the Supabase OAuth configuration (Steps 1-4 above)
2. Test Google sign-in locally
3. Verify profile creation
4. Check session persistence
5. Test on production domain

---

**Status**: ✅ Code fixes applied, awaiting Supabase OAuth configuration
**Last Updated**: 2025-10-25
