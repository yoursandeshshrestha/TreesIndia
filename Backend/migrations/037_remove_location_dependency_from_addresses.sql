-- +goose Up
-- Remove location dependency from addresses table

-- Drop the index on location_id
DROP INDEX idx_addresses_location_id;

-- Drop the location_id column
ALTER TABLE addresses DROP COLUMN location_id;

-- +goose Down
-- Revert location dependency changes

-- Add back the location_id column
ALTER TABLE addresses ADD COLUMN location_id BIGINT;

-- Recreate the index
CREATE INDEX idx_addresses_location_id ON addresses(location_id);
