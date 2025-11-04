-- Migration: Add is_approved column to modules table
ALTER TABLE modules ADD COLUMN is_approved boolean DEFAULT false;