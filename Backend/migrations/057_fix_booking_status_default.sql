-- +goose Up
-- Migration: Fix booking status default
-- Description: Ensures booking status default is correctly set to pending

-- Set the default value for status column to 'pending'
ALTER TABLE bookings ALTER COLUMN status SET DEFAULT 'pending';

-- Set the default value for payment_status column to 'pending'
ALTER TABLE bookings ALTER COLUMN payment_status SET DEFAULT 'pending';

-- +goose Down
-- Revert booking status default changes
-- Note: We don't revert this as it's a fix for incorrect defaults
