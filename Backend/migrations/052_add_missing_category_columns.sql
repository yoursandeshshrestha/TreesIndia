-- +goose Up
-- Add missing icon and parent_id columns to categories table
-- These should have been created in 002_create_categories.sql but may be missing in some databases

ALTER TABLE categories ADD COLUMN IF NOT EXISTS icon TEXT;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS parent_id BIGINT;

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'categories_parent_id_fkey'
    ) THEN
        ALTER TABLE categories 
        ADD CONSTRAINT categories_parent_id_fkey 
        FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add index if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);

-- +goose Down
-- Remove the columns and constraints
DROP INDEX IF EXISTS idx_categories_parent_id;
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_parent_id_fkey;
ALTER TABLE categories DROP COLUMN IF EXISTS parent_id;
ALTER TABLE categories DROP COLUMN IF EXISTS icon;

