-- +goose Up
-- Add source column to locations table

ALTER TABLE locations ADD COLUMN IF NOT EXISTS source TEXT;

-- Add comment to explain the column
COMMENT ON COLUMN locations.source IS 'Source of location data: gps, manual, etc.';

-- +goose Down
-- Remove source column from locations table

ALTER TABLE locations DROP COLUMN IF EXISTS source;
