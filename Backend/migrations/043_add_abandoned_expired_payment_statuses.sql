-- +goose Up
-- Update the check constraint to include new payment statuses
ALTER TABLE payments DROP CONSTRAINT IF EXISTS chk_payments_status;

ALTER TABLE payments ADD CONSTRAINT chk_payments_status 
CHECK (status IN (
    'pending', 
    'completed', 
    'failed', 
    'refunded',
    'abandoned',
    'expired'
));

-- +goose Down
-- Revert the check constraint to original values
ALTER TABLE payments DROP CONSTRAINT IF EXISTS chk_payments_status;

ALTER TABLE payments ADD CONSTRAINT chk_payments_status 
CHECK (status IN ('pending', 'completed', 'failed', 'refunded'));
