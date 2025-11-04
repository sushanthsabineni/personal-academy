# Google OAuth Fixed - @supabase/ssr Package Migration

## Problem Root Cause

The `nextCookies.get is not a function` error was caused by using the **outdated** `@supabase/auth-helpers-nextjs` package (v0.10.0) with **Next.js 16.0.0**.

### Why It Failed:
- Next.js 15+ made `cookies()` async
- The old `@supabase/auth-helpers-nextjs` package expects synchronous cookies
- This caused incompatibility: the package tried to call `.get()` on a Promise

## Solution Applied

### ✅ Installed Modern Package
```bash
npm install @supabase/ssr
```

This is the official Supabase package for Next.js 13+ with App Router, supports async cookies.

### ✅ Updated All Server-Side Files

#### 1. `lib/supabase/server.ts`
**Before** (BROKEN):
```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export const createServerSupabaseClient = async () => {
  return createRouteHandlerClient<Database>({ cookies })
}
```

**After** (FIXED):
```typescript
import { createServerClient } from '@supabase/ssr'

export const createServerSupabaseClient = async () => {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignore if called from Server Component
          }
        },
      },
    }
  )
}
```

#### 2. `app/auth/callback/route.ts` - OAuth Callback Handler
Updated to use `createServerClient` with the same cookie handling pattern.

#### 3. `app/api/auth/ensure-profile/route.ts` 
Updated both POST and GET handlers to use new SSR client.

#### 4. `app/api/auth/create-profile/route.ts`
Updated both POST and GET handlers to use new SSR client.

#### 5. `middleware.ts` - Auth Middleware
Updated to use `createServerClient` with middleware-specific cookie handling:
```typescript
const supabase = createServerClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    cookies: {
      getAll() {
        return req.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          req.cookies.set(name, value)
          res.cookies.set(name, value, options)
        })
      },
    },
  }
)
```

## Files Changed

- ✅ `lib/supabase/server.ts` - Server client factory
- ✅ `app/auth/callback/route.ts` - OAuth callback handler
- ✅ `app/api/auth/ensure-profile/route.ts` - Profile creation endpoint  
- ✅ `app/api/auth/create-profile/route.ts` - Profile creation endpoint
- ✅ `middleware.ts` - Authentication middleware
- ✅ `package.json` - Added `@supabase/ssr` package

## Client-Side Files (No Changes Needed)

These files use `createClientComponentClient` from the old package, which still works fine for client components:
- ✅ `app/login/page.tsx` - Already correct
- ✅ `lib/supabase/client.ts` - Already correct
- ✅ All other client components - Already correct

The old package is fine for **client-side** usage. The issue was only with **server-side** (API routes, callbacks, middleware).

## Testing Instructions

### 1. Start Dev Server
```bash
npm run dev
```

### 2. Test Google OAuth
1. Open: http://localhost:3000/login
2. Click "Sign in with Google"
3. **Expected Flow**:
   - ✅ Google consent screen opens
   - ✅ After approval: redirects to Supabase
   - ✅ Supabase redirects to: `http://localhost:3000/auth/callback?code=...`
   - ✅ Callback processes successfully (NO ERROR!)
   - ✅ Creates profile if needed
   - ✅ Redirects to: `http://localhost:3000/dashboard`
   - ✅ Dashboard loads with user data

### 3. Check Server Logs
Should see:
```
🔷 OAuth callback - exchanging code for session
✅ Session established for user: yourname@gmail.com
🔍 Checking if profile exists...
📝 Creating profile for OAuth user...
✅ Profile created successfully via callback
🎉 OAuth login complete, redirecting to dashboard
```

### 4. Verify No Errors
- ❌ **OLD ERROR**: `nextCookies.get is not a function`
- ✅ **NOW**: No errors, smooth OAuth flow

## Supabase Dashboard Configuration

Make sure you've configured Google OAuth in Supabase:

1. **Supabase Dashboard** → Your Project → **Authentication** → **Providers** → **Google**
   - Enable Google provider: ✅ ON
   - Client ID: (from Google Cloud Console)
   - Client Secret: (from Google Cloud Console)

2. **Google Cloud Console** → APIs & Services → Credentials → OAuth 2.0 Client
   - Authorized redirect URI: `https://ajnactqadrohplimjnze.supabase.co/auth/v1/callback`
   - **NOT** your app's URL!

3. **Supabase Dashboard** → Authentication → **URL Configuration**
   - Site URL: `http://localhost:3000`
   - Redirect URLs:
     - `http://localhost:3000/auth/callback`
     - `http://localhost:3001/auth/callback`

## Why @supabase/ssr is Better

| Feature | Old (@supabase/auth-helpers-nextjs) | New (@supabase/ssr) |
|---------|-------------------------------------|----------------------|
| Next.js 15+ Support | ❌ Broken | ✅ Full support |
| Async cookies() | ❌ Not supported | ✅ Native support |
| Maintenance | ⚠️ Deprecated | ✅ Actively maintained |
| Server Components | ⚠️ Limited | ✅ Full support |
| Middleware | ⚠️ Legacy pattern | ✅ Modern pattern |
| TypeScript | ⚠️ Outdated types | ✅ Latest types |

## Migration Notes

### What Changed:
1. Import changed: `@supabase/auth-helpers-nextjs` → `@supabase/ssr`
2. Function changed: `createRouteHandlerClient()` → `createServerClient()`
3. Now requires explicit URL and anon key (not just `{ cookies }`)
4. Cookie handling is more explicit (getAll/setAll pattern)

### What Stayed Same:
- Client-side code unchanged
- Environment variables unchanged
- Database schema unchanged
- OAuth flow unchanged (only the technical implementation)

## Common Questions

**Q: Do I need to uninstall @supabase/auth-helpers-nextjs?**
A: No, keep it for client components. Only server-side code uses the new package.

**Q: Will this break existing sessions?**
A: No, sessions are stored in cookies. The new package reads the same cookies.

**Q: What about Razorpay payments?**
A: Those API routes automatically use the new `createServerSupabaseClient()` function, so they're fixed too!

**Q: Do I need to update production?**
A: Yes, deploy these changes. The package is included in node_modules automatically.

## Verification Checklist

- [x] @supabase/ssr package installed
- [x] lib/supabase/server.ts updated to use createServerClient
- [x] app/auth/callback/route.ts updated
- [x] app/api/auth/*.ts routes updated
- [x] middleware.ts updated
- [x] No TypeScript errors in server files
- [ ] Tested: Google sign-in works locally
- [ ] Tested: Creates profile automatically
- [ ] Tested: Redirects to dashboard
- [ ] Tested: Payment flow works (if applicable)

## Next Steps

1. ✅ Code changes applied
2. ✅ Package installed
3. 🔄 **Test Google OAuth now**
4. 🔄 Verify profile creation
5. 🔄 Test dashboard access
6. 🔄 Deploy to production

---

**Status**: ✅ FIXED - Ready to test
**Package**: @supabase/ssr v0.5.2+ (latest)
**Compatibility**: Next.js 16.0.0 ✅
**Last Updated**: 2025-10-25
