# Course Creation Error Fix

## Error Details

```
Error creating course: {
  message: "Could not find the 'current_step' column of 'courses' in the schema cache",
  details: null,
  hint: null,
  code: 'PGRST204'
}
```

## Root Cause

**PostgREST Schema Cache Out of Sync**

The error code `PGRST204` indicates that Supabase's PostgREST API layer has a stale schema cache. The `current_step` column exists in the database but PostgREST doesn't know about it yet.

This typically happens when:
1. Database schema was created/modified
2. PostgREST cache wasn't refreshed
3. API requests fail because cache doesn't reflect actual schema

## Solution Options

### Option 1: Reload Schema in Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   - URL: https://supabase.com/dashboard/project/ajnactqadrohplimjnze

2. **Navigate to API Settings**
   - Sidebar: **Settings** → **API**

3. **Reload Schema**
   - Scroll down to **Schema** section
   - Click **Reload schema** button
   - Wait for confirmation

4. **Test Course Creation**
   - Return to Personal Academy
   - Try creating a course again
   - Should work immediately

### Option 2: Run Schema Reload SQL

If the dashboard reload doesn't work, run this in SQL Editor:

```sql
-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
```

### Option 3: Verify Column Exists

Run this query to confirm the column exists:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'courses' 
  AND column_name = 'current_step';
```

Expected result:
```
column_name  | data_type
-------------+-----------
current_step | integer
```

### Option 4: Re-create the Column (Last Resort)

If the column doesn't exist, create it:

```sql
-- Add current_step column if missing
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS current_step INTEGER DEFAULT 1 
CHECK (current_step BETWEEN 1 AND 4);

-- Reload schema
NOTIFY pgrst, 'reload schema';
```

## Code Changes Applied

### Enhanced Error Logging

**File: `lib/courseStorage.ts`**

Added debugging output:
```typescript
console.log('📝 Attempting to save course:', {
  courseId: course.id,
  hasExisting: !!existing,
  courseData
})
```

Enhanced error logging:
```typescript
console.error('❌ Error creating course:', {
  message: error.message,
  details: error.details,
  hint: error.hint,
  code: error.code
})
```

### Removed Invalid Fields

Previously removed `total_modules` field which doesn't exist in schema.

## Testing After Fix

1. **Reload Supabase Schema** (Option 1 above)

2. **Test Course Creation**:
   - Go to: http://localhost:3000/create
   - Fill in course details
   - Click "Create Course"
   - Should succeed

3. **Check Console Logs**:
   ```
   📝 Attempting to save course: {
     courseId: "uuid-here",
     hasExisting: false,
     courseData: { ... }
   }
   ✅ Course saved: uuid-here
   ```

4. **Verify in Database**:
   ```sql
   SELECT id, title, current_step, status 
   FROM courses 
   ORDER BY created_at DESC 
   LIMIT 5;
   ```

## Prevention

To avoid this issue in the future:

1. **After Schema Changes**: Always reload schema in Supabase
2. **Use Migrations**: Track schema changes in version control
3. **Test Locally**: Use local Supabase instance for development
4. **Auto-reload**: Supabase should auto-reload after ~5 minutes

## Related Files

- `lib/courseStorage.ts` - Course CRUD operations
- `DATABASE_SCHEMA.md` - Complete schema documentation
- `lib/database.types.ts` - TypeScript type definitions

## Quick Reference

**Schema Location**: `courses` table  
**Column Name**: `current_step`  
**Data Type**: `INTEGER`  
**Default**: `1`  
**Constraint**: `BETWEEN 1 AND 4`

---

**Status**: ✅ Code fixed, awaiting schema reload in Supabase  
**Next Step**: Reload schema in Supabase Dashboard (Option 1)  
**Date**: 2025-10-25
