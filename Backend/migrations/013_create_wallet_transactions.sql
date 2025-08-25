-- +goose Up
-- Create wallet transactions table (depends on users)

CREATE TABLE IF NOT EXISTS wallet_transactions (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    user_id BIGINT NOT NULL,
    transaction_type TEXT NOT NULL,
    amount DECIMAL NOT NULL,
    balance_before DECIMAL NOT NULL,
    balance_after DECIMAL NOT NULL,
    description TEXT,
    reference_id BIGINT,
    reference_type TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- +goose Down
DROP TABLE IF EXISTS wallet_transactions CASCADE;



