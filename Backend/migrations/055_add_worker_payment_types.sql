-- +goose Up
-- Add worker_earnings and worker_withdrawal to payment types, and bank_transfer to payment methods
ALTER TABLE payments DROP CONSTRAINT IF EXISTS chk_payments_type;

ALTER TABLE payments ADD CONSTRAINT chk_payments_type
CHECK (type IN (
    'booking',
    'subscription',
    'wallet_recharge',
    'wallet_debit',
    'refund',
    'segment_pay',
    'quote',
    'manual',
    'worker_earnings',
    'worker_withdrawal'
));

ALTER TABLE payments DROP CONSTRAINT IF EXISTS chk_payments_method;

ALTER TABLE payments ADD CONSTRAINT chk_payments_method
CHECK (method IN ('razorpay', 'wallet', 'cash', 'admin', 'bank_transfer'));

-- +goose Down
-- Revert payment type constraint
ALTER TABLE payments DROP CONSTRAINT IF EXISTS chk_payments_type;

ALTER TABLE payments ADD CONSTRAINT chk_payments_type
CHECK (type IN (
    'booking',
    'subscription',
    'wallet_recharge',
    'wallet_debit',
    'refund',
    'segment_pay',
    'quote',
    'manual'
));

-- Revert payment method constraint
ALTER TABLE payments DROP CONSTRAINT IF EXISTS chk_payments_method;

ALTER TABLE payments ADD CONSTRAINT chk_payments_method
CHECK (method IN ('razorpay', 'wallet', 'cash', 'admin'));
