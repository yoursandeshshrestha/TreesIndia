-- +goose Up
-- Create user subscriptions table (depends on users and subscription_plans)
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    user_id BIGINT NOT NULL,
    subscription_plan_id BIGINT NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'active',
    payment_method TEXT NOT NULL DEFAULT 'wallet',
    payment_id TEXT,
    amount DECIMAL NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (subscription_plan_id) REFERENCES subscription_plans(id)
);

-- +goose Down
DROP TABLE IF EXISTS user_subscriptions CASCADE;



