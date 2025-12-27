-- +goose Up
-- Add missing icon and parent_id columns to categories table
-- These should have been created in 002_create_categories.sql but may be missing in some databases

ALTER TABLE categories ADD COLUMN IF NOT EXISTS icon TEXT;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS parent_id BIGINT;

-- Add index if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);

-- +goose Down
-- Remove the columns and constraints
DROP INDEX IF EXISTS idx_categories_parent_id;
ALTER TABLE categories DROP COLUMN IF EXISTS parent_id;
ALTER TABLE categories DROP COLUMN IF EXISTS icon;

