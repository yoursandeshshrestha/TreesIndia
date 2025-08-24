-- +goose Up
-- Add city, state, and country fields to addresses table for service area validation

-- Add the new columns
ALTER TABLE addresses ADD COLUMN IF NOT EXISTS city TEXT NOT NULL DEFAULT 'Unknown City';
ALTER TABLE addresses ADD COLUMN IF NOT EXISTS state TEXT NOT NULL DEFAULT 'Unknown State';
ALTER TABLE addresses ADD COLUMN IF NOT EXISTS country TEXT NOT NULL DEFAULT 'India';

-- Add indexes for better performance on location-based queries
CREATE INDEX IF NOT EXISTS idx_addresses_city ON addresses(city);
CREATE INDEX IF NOT EXISTS idx_addresses_state ON addresses(state);
CREATE INDEX IF NOT EXISTS idx_addresses_country ON addresses(country);
CREATE INDEX IF NOT EXISTS idx_addresses_location ON addresses(city, state, country);

-- Update existing addresses to extract city and state from the address field
-- This is a basic extraction - in production, you might want to use a more sophisticated approach
UPDATE addresses 
SET 
    city = CASE 
        WHEN address LIKE '%,%' THEN 
            TRIM(SPLIT_PART(address, ',', -2))
        ELSE 'Unknown City'
    END,
    state = CASE 
        WHEN address LIKE '%,%' THEN 
            TRIM(SPLIT_PART(address, ',', -1))
        ELSE 'Unknown State'
    END
WHERE city = 'Unknown City' OR state = 'Unknown State';

-- +goose Down
-- Remove the new columns and indexes

-- Drop indexes
DROP INDEX IF EXISTS idx_addresses_location;
DROP INDEX IF EXISTS idx_addresses_country;
DROP INDEX IF EXISTS idx_addresses_state;
DROP INDEX IF EXISTS idx_addresses_city;

-- Remove the columns
ALTER TABLE addresses DROP COLUMN IF EXISTS country;
ALTER TABLE addresses DROP COLUMN IF EXISTS state;
ALTER TABLE addresses DROP COLUMN IF EXISTS city;
