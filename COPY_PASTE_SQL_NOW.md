# QUICK FIX - Table Creation (1 minute)

## Problem
```
ERROR: 42P01: relation "admin_settings" does not exist
```

## Solution

### 1. Open Supabase SQL Editor
Go to your Supabase project → SQL Editor → New Query

### 2. Run This SQL

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

### 3. Click Execute

Done! ✅

### 4. Deploy Code

```bash
git add .
git commit -m "Fix: Implement fallback model persistence and validation"
git push
```

### 5. Test

- Admin: `/admin/config/openrouter`
- User: `/create/essentials` → "AI Enhance" button

---

**Time to completion:** 1 minute  
**Status:** Table creation in progress
