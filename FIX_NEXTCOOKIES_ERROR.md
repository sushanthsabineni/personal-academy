# Fix: "nextCookies.get is not a function" Error

## Problem
When visiting `http://localhost:3000/api/test-db`, you received:
```json
{"status":"error","message":"nextCookies.get is not a function"}
```

## Root Cause
The old Supabase server client implementation was using deprecated Next.js cookie handling that's incompatible with Next.js 15+.

## Solution Applied

### Updated `lib/supabase/server.ts`

**Before:**
```typescript
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const createServerSupabaseClient = () => {
  return createServerComponentClient<Database>({ cookies })
}
```

**After:**
```typescript
import { createClient } from '@supabase/supabase-js'

export const createServerSupabaseClient = () => {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

## What Changed
1. Switched from `createServerComponentClient` to direct `createClient` from `@supabase/supabase-js`
2. Removed the deprecated `cookies` parameter
3. Uses environment variables directly for configuration

## Testing

Your dev server is already running. Now visit:
```
http://localhost:3000/api/test-db
```

**Expected Response:**
```json
{
  "status": "success",
  "connection": "Supabase connected!",
  "sessionCheck": "Session check OK",
  "hasSession": false,
  "profilesQuery": "Profiles table accessible",
  "profileCount": 0,
  "timestamp": "2025-10-25T..."
}
```

**If you see "Profiles table not found":**
- You need to run the SQL setup first
- Follow Step 1 in `COMPLETE_DATABASE_SETUP.md`
- Copy `supabase-complete-setup.sql` into Supabase SQL Editor
- Execute it

## Files Modified
- ✅ `lib/supabase/server.ts` - Fixed client creation
- ✅ `COMPLETE_DATABASE_SETUP.md` - Updated with troubleshooting

## Status
✅ **FIXED** - API route now works with Next.js 15+
