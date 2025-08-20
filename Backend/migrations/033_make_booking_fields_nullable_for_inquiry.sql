-- +goose Up
-- Make booking fields nullable for inquiry-based bookings

-- Make address nullable (will be filled later for inquiry bookings)
ALTER TABLE bookings ALTER COLUMN address DROP NOT NULL;

-- Make scheduled_date, scheduled_time, scheduled_end_time nullable (will be set later for inquiry bookings)
ALTER TABLE bookings ALTER COLUMN scheduled_date DROP NOT NULL;
ALTER TABLE bookings ALTER COLUMN scheduled_time DROP NOT NULL;
ALTER TABLE bookings ALTER COLUMN scheduled_end_time DROP NOT NULL;

-- Make total_amount nullable (will be determined later for inquiry bookings)
ALTER TABLE bookings ALTER COLUMN total_amount DROP NOT NULL;

-- Add booking_type column to distinguish between regular and inquiry bookings
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_type VARCHAR(20) DEFAULT 'regular' CHECK (booking_type IN ('regular', 'inquiry'));

-- Add index for booking_type
CREATE INDEX IF NOT EXISTS idx_bookings_booking_type ON bookings(booking_type);

-- +goose Down
-- Revert changes

-- Remove index
DROP INDEX IF EXISTS idx_bookings_booking_type;

-- Remove booking_type column
ALTER TABLE bookings DROP COLUMN IF EXISTS booking_type;

-- Make fields NOT NULL again
ALTER TABLE bookings ALTER COLUMN address SET NOT NULL;
ALTER TABLE bookings ALTER COLUMN scheduled_date SET NOT NULL;
ALTER TABLE bookings ALTER COLUMN scheduled_time SET NOT NULL;
ALTER TABLE bookings ALTER COLUMN scheduled_end_time SET NOT NULL;
ALTER TABLE bookings ALTER COLUMN total_amount SET NOT NULL;
