-- +goose Up
-- +goose StatementBegin
-- Remove wallet_transactions table since we're moving to unified payment system
-- All wallet transactions will now be handled by the payments table
DROP TABLE IF EXISTS wallet_transactions CASCADE;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
-- Recreate wallet_transactions table for rollback
CREATE TABLE wallet_transactions (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP,
    user_id BIGINT NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    amount DECIMAL(10,2) NOT NULL,
    balance_after DECIMAL(10,2) NOT NULL,
    reference_id VARCHAR(255) UNIQUE,
    description TEXT,
    related_user_id BIGINT,
    service_id BIGINT,
    property_id BIGINT,
    subscription_id BIGINT
);
-- +goose StatementEnd

-- +goose StatementBegin
-- Add indexes for rollback
CREATE INDEX idx_wallet_transactions_user_id ON wallet_transactions(user_id);
CREATE INDEX idx_wallet_transactions_reference_id ON wallet_transactions(reference_id);
CREATE INDEX idx_wallet_transactions_type ON wallet_transactions(transaction_type);
CREATE INDEX idx_wallet_transactions_status ON wallet_transactions(status);
-- +goose StatementEnd
