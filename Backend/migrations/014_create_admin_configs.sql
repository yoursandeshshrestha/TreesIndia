-- +goose Up
-- Create admin configs table (base table with no dependencies)

CREATE TABLE IF NOT EXISTS admin_configs (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    type TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT
);

-- +goose Down
DROP TABLE IF EXISTS admin_configs CASCADE;



