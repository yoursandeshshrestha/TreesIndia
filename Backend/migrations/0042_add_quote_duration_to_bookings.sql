-- +goose Up
-- Add quote_duration column to bookings table
-- This column stores the service duration specified in quotes for inquiry bookings
ALTER TABLE bookings 
ADD COLUMN quote_duration VARCHAR(50) DEFAULT NULL;

-- Add comment to explain the column purpose
COMMENT ON COLUMN bookings.quote_duration IS 'Service duration specified in quote for inquiry bookings (e.g., "2h30m", "3h", "1h45m")';

-- +goose Down
-- Remove quote_duration column from bookings table
ALTER TABLE bookings 
DROP COLUMN IF EXISTS quote_duration;
