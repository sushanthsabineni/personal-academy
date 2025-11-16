# Database Table Creation - UPDATED INSTRUCTIONS

## Issue Found

The error you got was:
```
ERROR: 42P01: relation "admin_settings" does not exist
```

**Reason:** The `admin_settings` table doesn't exist in your Supabase database yet. The code expects it, but it needs to be created first.

---

## Solution: Create the Table

### Option 1: Use the Migration File (Recommended)

A complete migration file has been created at:
```
migrations/016_create_admin_settings_table.sql
```

**Step 1:** Open Supabase SQL Editor  
**Step 2:** Copy the entire contents of `migrations/016_create_admin_settings_table.sql`  
**Step 3:** Paste into Supabase SQL Editor  
**Step 4:** Click "Execute" or press Ctrl+Enter  

This will:
- ✅ CREATE the `admin_settings` table
- ✅ ADD the `openrouter_fallback_models` column
- ✅ Enable Row Level Security (RLS)
- ✅ Create the proper policy
- ✅ Add auto-update trigger
- ✅ Create indexes

---

### Option 2: Copy-Paste (If you prefer quick commands)

Run this in Supabase SQL Editor:

```sql
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  openrouter_api_key TEXT,
  openrouter_model TEXT DEFAULT 'openai/gpt-4o',
  openrouter_fallback_models TEXT,
  temperature NUMERIC DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 4096,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own settings"
  ON admin_settings FOR ALL
  USING (auth.uid() = user_id);
```

---

## After Creating the Table

Once the table is created:

1. ✅ Deploy the code changes:
   ```bash
   git add .
   git commit -m "Fix: Implement fallback model persistence and validation"
   git push
   ```

2. ✅ Test the feature:
   - Go to `/admin/config/openrouter`
   - Fill in OpenRouter API key, primary model, fallback models
   - Click "Save" → data should save to database
   - Go to `/create/essentials`
   - Click "AI Enhance" → should work without errors

---

## Table Structure

| Column | Type | Purpose |
|--------|------|---------|
| `id` | UUID | Primary key |
| `user_id` | UUID | References auth.users |
| `openrouter_api_key` | TEXT | Admin's OpenRouter API key |
| `openrouter_model` | TEXT | Primary model (default: gpt-4o) |
| `openrouter_fallback_models` | TEXT | JSON array of fallback models |
| `temperature` | NUMERIC | AI temperature setting |
| `max_tokens` | INTEGER | Max tokens per response |
| `created_at` | TIMESTAMPTZ | When record created |
| `updated_at` | TIMESTAMPTZ | When record last updated |

---

## What This Fixes

Before: `admin_settings` table didn't exist → App tried to read from non-existent table → ERROR  
After: Table exists → Admin can save config → API can fetch config → Everything works ✅

---

## Next Steps

1. Execute the SQL migration (Option 1 or 2 above)
2. Deploy code changes
3. Test end-to-end
4. Enjoy working AI Enhance feature!
