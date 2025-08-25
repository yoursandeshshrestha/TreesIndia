-- +goose Up
-- Create users table (base table with no dependencies)
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    name TEXT,
    email TEXT UNIQUE,
    phone TEXT UNIQUE NOT NULL,
    user_type TEXT NOT NULL DEFAULT 'normal',
    avatar TEXT,
    gender TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMPTZ,
    role_application_status TEXT DEFAULT 'none',
    application_date TIMESTAMPTZ,
    approval_date TIMESTAMPTZ,
    wallet_balance DECIMAL DEFAULT 0,
    subscription_id BIGINT,
    has_active_subscription BOOLEAN DEFAULT false,
    subscription_expiry_date TIMESTAMPTZ
);

-- +goose Down
DROP TABLE IF EXISTS users CASCADE;



