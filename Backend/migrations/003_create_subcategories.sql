-- +goose Up
-- Create subcategories table (depends on categories)
CREATE TABLE IF NOT EXISTS subcategories (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    parent_id BIGINT,
    is_active BOOLEAN DEFAULT true,
    FOREIGN KEY (parent_id) REFERENCES categories(id)
);

-- +goose Down
DROP TABLE IF EXISTS subcategories CASCADE;



