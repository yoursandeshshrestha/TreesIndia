-- +goose Up
-- Create subscription plans table (base table with no dependencies)
CREATE TABLE IF NOT EXISTS subscription_plans (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    name TEXT NOT NULL,
    description TEXT,
    features JSONB,
    is_active BOOLEAN DEFAULT true,
    
    -- Duration and pricing
    duration_type TEXT NOT NULL,       -- "monthly" or "yearly" only
    duration_days INTEGER NOT NULL,    -- 30 or 365
    price DECIMAL NOT NULL,
    
    -- Constraints
    UNIQUE(duration_type)              -- Only one monthly and one yearly record
);

-- +goose Down
DROP TABLE IF EXISTS subscription_plans CASCADE;



