# Slides Table Database Migration - AI Slide Generation System

**Date:** November 3, 2025  
**Purpose:** Update Supabase slides table to fully support AI-powered slide generation  
**Status:** Ready to deploy  
**Risk Level:** ✅ LOW - Only adds columns, no data modification

---

## 📋 Quick Summary

The AI slide generation system needs the slides table to have proper field mapping and metadata columns. This migration:
- ✅ Adds missing metadata columns (if they don't exist)
- ✅ Ensures data integrity with proper constraints
- ✅ Optimizes database performance with indexes
- ✅ Is completely safe and idempotent (can run multiple times)
- ✅ Does NOT delete or modify existing data

---

## 🚀 How to Apply the Migration

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Click: **SQL Editor** (left sidebar)
4. Click: **New Query**
5. Copy the entire contents of `SUPABASE_SLIDES_MIGRATION.sql`
6. Paste into the SQL editor
7. Click: **Run**
8. Verify: You should see no errors, and the verification queries will confirm success

### Option 2: Using psql Command Line

```bash
psql -h your-supabase-host -U postgres -d your_database < SUPABASE_SLIDES_MIGRATION.sql
```

### Option 3: Using Quick Migration File

Use the `quick-slides-migration.sql` file for a minimal version.

---

## 📊 What Gets Updated

### NEW COLUMNS ADDED (if they don't exist):

| Column | Type | Purpose | Example |
|--------|------|---------|---------|
| `slide_type` | TEXT | Slide purpose | 'intro', 'content', 'conclusion' |
| `is_edited` | BOOLEAN | Edited after generation | true/false |
| `edit_notes` | TEXT | Notes about edits | "Added more details to example" |
| `approved_at` | TIMESTAMPTZ | When instructor approved | 2025-11-03 10:30:00 |
| `approved_by` | UUID | Who approved (user ID) | (uuid of instructor) |

### EXISTING COLUMNS (used by AI generation):

These columns already exist and are used:

| Column | Type | Used For |
|--------|------|----------|
| `title` | TEXT | Slide title |
| `content` | TEXT | Main content (bullet points) |
| `narration` | TEXT | Speaker notes |
| `media_notes` | TEXT | Media recommendations |
| `learning_objective` | TEXT | Learning goal (SMART) |
| `interaction_type` | TEXT | Engagement type (quiz, video, etc) |
| `ai_notes` | TEXT | AI metadata |
| `ai_generated` | BOOLEAN | Was AI-generated |

### INDEXES ADDED (for performance):

- `idx_slides_ai_generated` - Query AI-generated slides quickly
- `idx_slides_interaction_type` - Find slides by engagement type
- `idx_slides_lesson_slide_number` - Proper ordering
- `idx_slides_approved` - Find approved/unapproved slides

---

## 🔄 Data Flow: AI Generation → Database

```
AI Generates Slide (OpenRouter API)
           ↓
slideGenerator.ts formats the slide
           ↓
formatSlidesForDatabase() maps fields:
    - slide.speakerNotes → narration
    - slide.mediaNote → media_notes
    - slide.learningObjective → learning_objective
    - slide.interactionType → interaction_type
    - slide.type (intro|content|conclusion) → slide_type
           ↓
Supabase inserts into slides table
           ↓
Database stores with:
    - ai_generated = true
    - is_edited = false (initially)
    - approved_at = NULL (until instructor approves)
```

---

## ✅ Verification After Migration

### Run these in Supabase SQL Editor to confirm:

**1. Check column structure:**
```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'slides'
ORDER BY ordinal_position;
```

**Expected Output:** Should show ~24 columns including slide_type, is_edited, edit_notes, approved_at, approved_by

**2. Check indexes:**
```sql
SELECT indexname FROM pg_indexes WHERE tablename = 'slides';
```

**Expected Output:** Should include idx_slides_ai_generated, idx_slides_interaction_type, etc.

**3. Check a slide record:**
```sql
SELECT 
  slide_number, title, slide_type, ai_generated, 
  is_edited, approved_at, narration, media_notes
FROM slides
LIMIT 1;
```

**Expected Output:** Shows one slide with proper field structure

---

## 🛑 If Something Goes Wrong

### The migration failed or caused errors?

**Don't panic!** This migration is READ-ONLY mostly. If there's an issue:

1. **Constraint errors:** Usually means the column already exists. This is fine - the migration is idempotent.
2. **Foreign key errors:** The `approved_by` field references `profiles.id`. Ensure that table exists.
3. **Run again:** You can run the migration multiple times safely.

### Rollback (if absolutely needed):

```sql
-- Remove the new columns (only if you must):
ALTER TABLE slides DROP COLUMN IF EXISTS slide_type CASCADE;
ALTER TABLE slides DROP COLUMN IF EXISTS is_edited CASCADE;
ALTER TABLE slides DROP COLUMN IF EXISTS edit_notes CASCADE;
ALTER TABLE slides DROP COLUMN IF EXISTS approved_at CASCADE;
ALTER TABLE slides DROP COLUMN IF EXISTS approved_by CASCADE;

-- Drop new indexes:
DROP INDEX IF EXISTS idx_slides_ai_generated;
DROP INDEX IF EXISTS idx_slides_interaction_type;
DROP INDEX IF EXISTS idx_slides_lesson_slide_number;
DROP INDEX IF EXISTS idx_slides_approved;
```

---

## 📝 Files in This Migration

1. **SUPABASE_SLIDES_MIGRATION.sql** ← Use this one for Supabase
2. **quick-slides-migration.sql** - Minimal version
3. **update-slides-table.sql** - Detailed with comments
4. **SLIDES_DB_MIGRATION_GUIDE.md** ← This file

---

## 🎯 Next Steps

After running the migration:

1. ✅ Test slide generation again in the storyboard page
2. ✅ Verify slides are being inserted successfully
3. ✅ Check browser console for [Storyboard] logs
4. ✅ View generated slides in the sidebar

---

## 📞 Support

If you encounter any issues:

1. Check the SQL error message in Supabase
2. Verify the `profiles` table exists
3. Ensure your Supabase role has appropriate permissions
4. Try running the "quick" version instead

---

## 🔐 Security Notes

- ✅ No data is deleted or modified
- ✅ All new columns have reasonable defaults
- ✅ Foreign keys properly reference existing tables
- ✅ Constraints ensure data integrity
- ✅ Triggers maintain audit timestamps

---

Generated: 2025-11-03
For: Personal Academy AI Slide Generation System
