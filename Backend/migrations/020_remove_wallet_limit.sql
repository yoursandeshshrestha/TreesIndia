-- +goose Up
-- Remove wallet_limit column from users table
ALTER TABLE users DROP COLUMN IF EXISTS wallet_limit;

-- +goose Down
-- Add back wallet_limit column (for rollback)
ALTER TABLE users ADD COLUMN wallet_limit DECIMAL DEFAULT 100000;
