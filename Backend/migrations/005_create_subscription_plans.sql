-- +goose Up
-- Create subscription plans table (base table with no dependencies)
CREATE TABLE IF NOT EXISTS subscription_plans (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    name TEXT NOT NULL UNIQUE,         -- Plan name (unique)
    description TEXT,
    features JSONB,
    is_active BOOLEAN DEFAULT true,
    pricing JSONB NOT NULL,            -- Pricing options array: [{"duration_type": "monthly", "duration_days": 30, "price": 599}, {"duration_type": "yearly", "duration_days": 365, "price": 4999}]
    
    -- Constraints
    CONSTRAINT valid_pricing_structure CHECK (jsonb_typeof(pricing) = 'array')
);

-- +goose Down
DROP TABLE IF EXISTS subscription_plans CASCADE;



