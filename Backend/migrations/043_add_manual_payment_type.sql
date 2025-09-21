-- +goose Up
-- Add 'manual' to the payment type constraint

-- Drop the existing constraint
ALTER TABLE payments DROP CONSTRAINT IF EXISTS chk_payments_type;

-- Add the new constraint with 'manual' included
ALTER TABLE payments ADD CONSTRAINT chk_payments_type 
    CHECK (type IN ('booking', 'subscription', 'wallet_recharge', 'wallet_debit', 'refund', 'segment_pay', 'quote', 'manual'));

-- +goose Down
-- Revert the constraint back to original values

-- Drop the new constraint
ALTER TABLE payments DROP CONSTRAINT IF EXISTS chk_payments_type;

-- Add back the original constraint
ALTER TABLE payments ADD CONSTRAINT chk_payments_type 
    CHECK (type IN ('booking', 'subscription', 'wallet_recharge', 'wallet_debit', 'refund', 'segment_pay', 'quote'));
