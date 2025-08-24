-- +goose Up
-- Migration: Fix inquiry booking status
-- Description: Updates existing inquiry bookings from confirmed to pending status

-- Update inquiry bookings that are incorrectly in confirmed status to pending status
UPDATE bookings 
SET status = 'pending' 
WHERE booking_type = 'inquiry' 
AND status = 'confirmed';

-- +goose Down
-- Revert inquiry booking status changes
UPDATE bookings 
SET status = 'confirmed' 
WHERE booking_type = 'inquiry' 
AND status = 'pending';
