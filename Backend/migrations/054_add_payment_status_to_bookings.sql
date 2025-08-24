-- +goose Up
-- Migration: Add payment status to bookings table
-- Description: Adds separate payment status field to distinguish payment status from booking workflow status

-- Add payment_status column to bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'pending';

-- Update existing bookings to have appropriate payment status
-- For inquiry bookings that are confirmed, set payment status to completed
UPDATE bookings 
SET payment_status = 'completed' 
WHERE booking_type = 'inquiry' 
AND status = 'confirmed';

-- For regular bookings that are confirmed, set payment status to completed
UPDATE bookings 
SET payment_status = 'completed' 
WHERE booking_type = 'regular' 
AND status = 'confirmed';

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_status_payment_status ON bookings(status, payment_status);

-- Add comment for documentation
COMMENT ON COLUMN bookings.payment_status IS 'Payment status separate from booking workflow status';

-- +goose Down
-- Remove payment status column from bookings table
DROP INDEX IF EXISTS idx_bookings_status_payment_status;
DROP INDEX IF EXISTS idx_bookings_payment_status;

ALTER TABLE bookings DROP COLUMN IF EXISTS payment_status;
