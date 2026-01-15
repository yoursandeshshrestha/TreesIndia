-- +goose Up
-- Remove due_date column from payment_segments table

ALTER TABLE payment_segments DROP COLUMN IF EXISTS due_date;

-- Remove the index on due_date if it exists
DROP INDEX IF EXISTS idx_payment_segments_due_date;

-- +goose Down
-- Add back due_date column to payment_segments table

ALTER TABLE payment_segments ADD COLUMN due_date TIMESTAMPTZ;

-- Recreate the index on due_date
CREATE INDEX IF NOT EXISTS idx_payment_segments_due_date ON payment_segments(due_date);
