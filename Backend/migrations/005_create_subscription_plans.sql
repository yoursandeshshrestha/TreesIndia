-- +goose Up
-- Create subscription plans table (base table with no dependencies)
CREATE TABLE IF NOT EXISTS subscription_plans (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL NOT NULL,
    duration_days INTEGER NOT NULL,
    features JSONB,
    is_active BOOLEAN DEFAULT true
);

-- +goose Down
DROP TABLE IF EXISTS subscription_plans CASCADE;



