-- +goose Up
-- Create subscription_plans table (base table with no dependencies)
CREATE TABLE IF NOT EXISTS subscription_plans (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    name TEXT NOT NULL,
    duration TEXT NOT NULL,
    price DECIMAL NOT NULL,
    is_active BOOLEAN DEFAULT true,
    description TEXT
);

-- +goose Down
DROP TABLE IF EXISTS subscription_plans CASCADE;



