-- +goose Up
-- Create categories table (base table with no dependencies)
CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    description TEXT,
    image TEXT,
    is_active BOOLEAN DEFAULT true
);

-- +goose Down
DROP TABLE IF EXISTS categories CASCADE;



