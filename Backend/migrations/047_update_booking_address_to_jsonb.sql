-- +goose Up
-- Update booking address column to JSONB type to store complete address objects

-- First, backup existing address data (optional - for safety)
-- CREATE TABLE bookings_address_backup AS SELECT id, address FROM bookings WHERE address IS NOT NULL;

-- Update the address column to JSONB type
ALTER TABLE bookings ALTER COLUMN address TYPE JSONB USING 
  CASE 
    WHEN address IS NULL THEN NULL
    ELSE json_build_object(
      'name', 'Legacy Address',
      'address', address,
      'city', 'Unknown City',
      'state', 'Unknown State',
      'country', 'India',
      'postal_code', '',
      'latitude', 0,
      'longitude', 0,
      'landmark', '',
      'house_number', ''
    )
  END;

-- Add index for better performance on JSONB queries (after converting to JSONB)
CREATE INDEX IF NOT EXISTS idx_bookings_address_city ON bookings ((address->>'city'));
CREATE INDEX IF NOT EXISTS idx_bookings_address_state ON bookings ((address->>'state'));

-- +goose Down
-- Revert changes

-- Drop the indexes
DROP INDEX IF EXISTS idx_bookings_address_city;
DROP INDEX IF EXISTS idx_bookings_address_state;

-- Revert address column back to text
ALTER TABLE bookings ALTER COLUMN address TYPE TEXT USING 
  CASE 
    WHEN address IS NULL THEN NULL
    ELSE address->>'address'
  END;
