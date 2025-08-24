-- +goose Up
-- Migration: Add quote fields to bookings table
-- Description: Adds quote management fields for inquiry-based bookings

-- Add quote-related columns to bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS quote_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS quote_notes TEXT,
ADD COLUMN IF NOT EXISTS quote_provided_by BIGINT,
ADD COLUMN IF NOT EXISTS quote_provided_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS quote_accepted_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS quote_expires_at TIMESTAMP;

-- Add foreign key constraint for quote_provided_by
ALTER TABLE bookings 
ADD CONSTRAINT fk_bookings_quote_provided_by 
FOREIGN KEY (quote_provided_by) REFERENCES users(id) ON DELETE SET NULL;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bookings_quote_provided_at ON bookings(quote_provided_at);
CREATE INDEX IF NOT EXISTS idx_bookings_quote_expires_at ON bookings(quote_expires_at);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_type_status ON bookings(booking_type, status);

-- Add comments for documentation
COMMENT ON COLUMN bookings.quote_amount IS 'Final quote amount for inquiry bookings';
COMMENT ON COLUMN bookings.quote_notes IS 'Admin notes provided with the quote';
COMMENT ON COLUMN bookings.quote_provided_by IS 'Admin ID who provided the quote';
COMMENT ON COLUMN bookings.quote_provided_at IS 'Timestamp when quote was provided';
COMMENT ON COLUMN bookings.quote_accepted_at IS 'Timestamp when customer accepted quote';
COMMENT ON COLUMN bookings.quote_expires_at IS 'Timestamp when quote expires';

-- +goose Down
-- Remove quote-related columns from bookings table
DROP INDEX IF EXISTS idx_bookings_booking_type_status;
DROP INDEX IF EXISTS idx_bookings_quote_expires_at;
DROP INDEX IF EXISTS idx_bookings_quote_provided_at;

ALTER TABLE bookings DROP CONSTRAINT IF EXISTS fk_bookings_quote_provided_by;

ALTER TABLE bookings 
DROP COLUMN IF EXISTS quote_amount,
DROP COLUMN IF EXISTS quote_notes,
DROP COLUMN IF EXISTS quote_provided_by,
DROP COLUMN IF EXISTS quote_provided_at,
DROP COLUMN IF EXISTS quote_accepted_at,
DROP COLUMN IF EXISTS quote_expires_at;
