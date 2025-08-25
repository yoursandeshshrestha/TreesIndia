-- +goose Up
-- Create admin configs table (base table with no dependencies)

CREATE TABLE IF NOT EXISTS admin_configs (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    type TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true
);

-- Create index on key for better performance
CREATE INDEX IF NOT EXISTS idx_admin_configs_key ON admin_configs(key);

-- +goose Down
DROP TABLE IF EXISTS admin_configs CASCADE;



