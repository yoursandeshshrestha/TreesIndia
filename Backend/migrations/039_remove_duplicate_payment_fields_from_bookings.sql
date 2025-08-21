-- +goose Up
-- +goose StatementBegin
-- Remove duplicate payment fields from bookings table
-- These fields are now handled by the payments table
ALTER TABLE bookings DROP COLUMN IF EXISTS payment_status;
-- +goose StatementEnd

-- +goose StatementBegin
ALTER TABLE bookings DROP COLUMN IF EXISTS total_amount;
-- +goose StatementEnd

-- +goose StatementBegin
ALTER TABLE bookings DROP COLUMN IF EXISTS razorpay_order_id;
-- +goose StatementEnd

-- +goose StatementBegin
ALTER TABLE bookings DROP COLUMN IF EXISTS payment_completed_at;
-- +goose StatementEnd

-- +goose StatementBegin
ALTER TABLE bookings DROP COLUMN IF EXISTS payment_id;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
-- Add back the removed columns for rollback
ALTER TABLE bookings ADD COLUMN payment_status VARCHAR(20) DEFAULT 'pending';
-- +goose StatementEnd

-- +goose StatementBegin
ALTER TABLE bookings ADD COLUMN total_amount DECIMAL(10,2);
-- +goose StatementEnd

-- +goose StatementBegin
ALTER TABLE bookings ADD COLUMN razorpay_order_id VARCHAR(255);
-- +goose StatementEnd

-- +goose StatementBegin
ALTER TABLE bookings ADD COLUMN payment_completed_at TIMESTAMP;
-- +goose StatementEnd

-- +goose StatementBegin
ALTER TABLE bookings ADD COLUMN payment_id VARCHAR(255);
-- +goose StatementEnd
