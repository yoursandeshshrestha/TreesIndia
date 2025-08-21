-- +goose Up
-- Add balance_after column to payments table for wallet operations
ALTER TABLE payments ADD COLUMN balance_after DECIMAL(10,2) NULL;

-- Create index for better query performance
CREATE INDEX idx_payments_balance_after ON payments(balance_after);

-- +goose Down
-- Remove balance_after column from payments table
DROP INDEX IF EXISTS idx_payments_balance_after;
ALTER TABLE payments DROP COLUMN IF EXISTS balance_after;
