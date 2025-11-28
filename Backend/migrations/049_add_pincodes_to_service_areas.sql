-- +goose Up
-- Add pincodes column to service_areas table
ALTER TABLE service_areas ADD COLUMN IF NOT EXISTS pincodes TEXT[];

-- Create index for pincode searches
CREATE INDEX IF NOT EXISTS idx_service_areas_pincodes ON service_areas USING GIN (pincodes);

-- +goose Down
DROP INDEX IF EXISTS idx_service_areas_pincodes;
ALTER TABLE service_areas DROP COLUMN IF EXISTS pincodes;
