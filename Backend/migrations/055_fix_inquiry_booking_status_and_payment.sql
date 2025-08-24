-- +goose Up
-- Migration: Fix inquiry booking status and payment status
-- Description: Fixes existing inquiry bookings that have incorrect status or null payment_status

-- Fix inquiry bookings that are incorrectly in confirmed status to pending status
UPDATE bookings 
SET status = 'pending' 
WHERE booking_type = 'inquiry' 
AND status = 'confirmed';

-- Fix inquiry bookings that have null payment_status to 'completed' (since no fee was required)
UPDATE bookings 
SET payment_status = 'completed' 
WHERE booking_type = 'inquiry' 
AND payment_status IS NULL;

-- Add index for better query performance on payment_status
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status_type ON bookings(payment_status, booking_type);

-- +goose Down
-- Revert inquiry booking status and payment status changes
UPDATE bookings 
SET status = 'confirmed' 
WHERE booking_type = 'inquiry' 
AND status = 'pending';

UPDATE bookings 
SET payment_status = NULL 
WHERE booking_type = 'inquiry' 
AND payment_status = 'completed';

DROP INDEX IF EXISTS idx_bookings_payment_status_type;
