-- Migration: Update user_preferences table - Remove unused columns
-- Created: 2025-10-27
-- Description: Removes email_product_updates and language columns

-- Remove email_product_updates column (redundant with email_new_features)
ALTER TABLE user_preferences 
DROP COLUMN IF EXISTS email_product_updates;

-- Remove language column (not implemented in app)
ALTER TABLE user_preferences 
DROP COLUMN IF EXISTS language;

-- Add comment
COMMENT ON TABLE user_preferences IS 'User notification and application preferences - Updated to remove unused fields';
