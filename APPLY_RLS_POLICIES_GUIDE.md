# 🚀 Quick Setup Guide - Apply RLS Policies

## ⚠️ IMPORTANT: Run These SQL Files in Order!

Your database tables are missing some columns that the RLS policies need. Follow these steps **IN ORDER**:

---

## Step-by-Step Instructions

### Step 0: Verify Database Structure (OPTIONAL but recommended)

1. Open **Supabase Dashboard**
2. Go to **SQL Editor**
3. Copy the content of `supabase_verify_structure.sql`
4. Paste and click **Run**
5. Read the NOTICE message to see what's missing

**This helps you understand what needs to be fixed!**

---

### Step 1: Add Missing Columns (REQUIRED)

1. Open **Supabase Dashboard**
2. Go to **SQL Editor**
3. Copy the content of `supabase_add_missing_columns.sql`
4. Paste and click **Run**
5. Wait for success messages

**Expected output:**
```
Added course_id column to lessons table
Populated and set course_id as NOT NULL in lessons table
Added course_id column to slides table
...
```

**This adds:**
- `course_id` to `lessons` table
- `course_id` and `module_id` to `slides` table
- `deleted_at` to `courses` table (for soft delete)

**All column name mismatches have been fixed!**

---

### Step 2: Apply RLS Policies (REQUIRED)

1. Still in **SQL Editor**
2. Copy the ENTIRE content of `supabase_rls_policies.sql`
3. Paste and click **Run**
4. Wait for all policies to be created

**Expected output:**
```
ALTER TABLE
ALTER TABLE
... (9 tables)
CREATE POLICY
CREATE POLICY
... (30+ policies)
```

---

### Step 3: Verify RLS is Enabled

1. Go to **Database** → **Tables**
2. Click on any table (e.g., `courses`)
3. Go to **Policies** tab
4. You should see multiple policies listed

---

### Step 4: Test the App

1. **Test 1: Login and View Dashboard**
   ```
   - Go to /login
   - Sign in with your account
   - Dashboard should load (may be empty if no courses yet)
   ```

2. **Test 2: Create a Course**
   ```
   - Click "Create New Course"
   - Fill in course details
   - Save course
   - Should appear in your dashboard
   ```

3. **Test 3: Multi-User Isolation** (if you have 2 accounts)
   ```
   - Login as User A → Create a course
   - Logout → Login as User B
   - Dashboard should be empty (can't see User A's course)
   - Create a course as User B
   - Logout → Login as User A again
   - Should only see User A's course
   ```

---

## ⚠️ If You Get Errors

### Error: "column lessons.course_id does not exist"
**Solution:** You skipped Step 1! Run `supabase_add_missing_columns.sql` first.

### Error: "column deleted_at does not exist"
**Solution:** You skipped Step 1! Run `supabase_add_missing_columns.sql` first.

### Error: "column referred_user_id does not exist"
**Solution:** Already fixed! The RLS policies now use `referee_id` (correct column name).

### Error: "policy already exists"
**Solution:** 
1. Go to SQL Editor
2. Run: `DROP POLICY IF EXISTS "policy-name" ON table_name;`
3. Then run the RLS policies SQL again

Or drop all policies at once:
```sql
-- Drop all existing policies (careful!)
DO $$ 
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT schemaname, tablename, policyname 
            FROM pg_policies 
            WHERE schemaname = 'public') 
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                   r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;
```

### Error: "relation does not exist"
**Solution:** The table hasn't been created yet. Run the main database schema SQL from `DATABASE_SCHEMA.md` first.

---

## 🎉 Success Indicators

✅ No errors when running RLS policies SQL  
✅ Can login and see dashboard  
✅ Can create courses  
✅ Courses are saved to database  
✅ Each user only sees their own courses  
✅ No localStorage warnings in console  

---

## 📝 What These Policies Do

**Security enforced at database level:**

- ✅ Users can ONLY view their own courses
- ✅ Users can ONLY edit their own courses
- ✅ Users can ONLY delete their own courses
- ✅ Users can ONLY view their own payments
- ✅ Users can ONLY view their own credit transactions
- ❌ Users CANNOT view other users' data (even with direct queries)
- ❌ Users CANNOT modify other users' data
- ❌ Users CANNOT bypass these restrictions from client-side

**Even if someone tries to hack the frontend, the database will reject unauthorized queries!**

---

## 🔧 Developer Notes

The app now handles the `deleted_at` column gracefully:
- If column exists → uses soft delete (keeps data)
- If column doesn't exist → uses hard delete (removes data)

Both methods work fine. Soft delete is better for data recovery.

---

Need help? Check the browser console for detailed error messages with emoji icons:
- 📚 = Course operations
- ✅ = Success
- ❌ = Error
- ⚠️ = Warning
