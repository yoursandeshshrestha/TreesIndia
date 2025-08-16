-- +goose Up
-- Create wallet transactions table (depends on users, services, properties, and user_subscriptions)

CREATE TABLE IF NOT EXISTS wallet_transactions (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    user_id BIGINT NOT NULL,
    related_user_id BIGINT,
    transaction_type TEXT NOT NULL,
    amount DECIMAL NOT NULL,
    balance_after DECIMAL NOT NULL,
    description TEXT NOT NULL,
    reference_id TEXT,
    service_id BIGINT,
    property_id BIGINT,
    subscription_id BIGINT,
    status TEXT DEFAULT 'completed',
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (related_user_id) REFERENCES users(id),
    FOREIGN KEY (service_id) REFERENCES services(id),
    FOREIGN KEY (property_id) REFERENCES properties(id),
    FOREIGN KEY (subscription_id) REFERENCES user_subscriptions(id)
);

-- +goose Down
DROP TABLE IF EXISTS wallet_transactions CASCADE;



