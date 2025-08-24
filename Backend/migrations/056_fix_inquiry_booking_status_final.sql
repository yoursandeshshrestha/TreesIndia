-- +goose Up
-- Migration: Fix inquiry booking status final
-- Description: Ensures all inquiry bookings have correct pending status and payment relationships

-- Fix inquiry bookings that are incorrectly in confirmed status to pending status
UPDATE bookings 
SET status = 'pending' 
WHERE booking_type = 'inquiry' 
AND status = 'confirmed';

-- Ensure all inquiry bookings have payment_status set to completed if they have payments
UPDATE bookings 
SET payment_status = 'completed' 
WHERE booking_type = 'inquiry' 
AND payment_status IS NULL 
AND EXISTS (
    SELECT 1 FROM payments 
    WHERE payments.related_entity_type = 'booking' 
    AND payments.related_entity_id = bookings.id 
    AND payments.status = 'completed'
);

-- Set payment_status to pending for inquiry bookings without completed payments
UPDATE bookings 
SET payment_status = 'pending' 
WHERE booking_type = 'inquiry' 
AND payment_status IS NULL;

-- Add index for better query performance on booking type and status
CREATE INDEX IF NOT EXISTS idx_bookings_type_status ON bookings(booking_type, status);

-- +goose Down
-- Revert inquiry booking status changes
UPDATE bookings 
SET status = 'confirmed' 
WHERE booking_type = 'inquiry' 
AND status = 'pending';

UPDATE bookings 
SET payment_status = NULL 
WHERE booking_type = 'inquiry' 
AND payment_status IN ('pending', 'completed');

DROP INDEX IF EXISTS idx_bookings_type_status;
