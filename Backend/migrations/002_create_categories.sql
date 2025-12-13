-- +goose Up
-- Create categories table with hierarchical support (self-referential)
-- Supports unlimited levels: Level 1 (root), Level 2, Level 3, etc.
CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    description TEXT,
    icon TEXT, -- Icon for the category (moved from subcategories)
    parent_id BIGINT, -- NULL for root categories (Level 1), references categories.id for nested
    is_active BOOLEAN DEFAULT true,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Create index on parent_id for better query performance
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);

-- +goose Down
DROP INDEX IF EXISTS idx_categories_parent_id;
DROP TABLE IF EXISTS categories CASCADE;



