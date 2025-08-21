-- +goose Up
-- Update the check constraint to include new wallet payment types
ALTER TABLE payments DROP CONSTRAINT IF EXISTS chk_payments_type;

ALTER TABLE payments ADD CONSTRAINT chk_payments_type 
CHECK (type IN (
    'booking', 
    'subscription', 
    'refund', 
    'wallet_recharge', 
    'wallet_debit'
));

-- +goose Down
-- Revert the check constraint to original values
ALTER TABLE payments DROP CONSTRAINT IF EXISTS chk_payments_type;

ALTER TABLE payments ADD CONSTRAINT chk_payments_type 
CHECK (type IN ('booking', 'subscription', 'refund'));
