-- +goose Up
-- Modify service_areas table to support many-to-many relationship with services

-- First, create the junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS service_service_areas (
    service_id BIGINT NOT NULL,
    service_area_id BIGINT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (service_id, service_area_id),
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    FOREIGN KEY (service_area_id) REFERENCES service_areas(id) ON DELETE CASCADE
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_service_service_areas_service_id ON service_service_areas(service_id);
CREATE INDEX IF NOT EXISTS idx_service_service_areas_service_area_id ON service_service_areas(service_area_id);

-- Remove the service_id column from service_areas table
-- First, we need to migrate existing data to the junction table
INSERT INTO service_service_areas (service_id, service_area_id)
SELECT service_id, id FROM service_areas WHERE service_id IS NOT NULL;

-- Now remove the service_id column and its foreign key constraint
ALTER TABLE service_areas DROP CONSTRAINT IF EXISTS service_areas_service_id_fkey;
ALTER TABLE service_areas DROP COLUMN IF EXISTS service_id;

-- Remove the index on service_id since it no longer exists
DROP INDEX IF EXISTS idx_service_areas_service_id;
DROP INDEX IF EXISTS idx_service_areas_service_location;

-- +goose Down
-- Revert the changes

-- Add back the service_id column
ALTER TABLE service_areas ADD COLUMN IF NOT EXISTS service_id BIGINT;

-- Migrate data back from junction table
UPDATE service_areas 
SET service_id = ssa.service_id 
FROM service_service_areas ssa 
WHERE service_areas.id = ssa.service_area_id;

-- Add back the foreign key constraint
ALTER TABLE service_areas ADD CONSTRAINT service_areas_service_id_fkey 
FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE;

-- Add back the indexes
CREATE INDEX IF NOT EXISTS idx_service_areas_service_id ON service_areas(service_id);
CREATE INDEX IF NOT EXISTS idx_service_areas_service_location ON service_areas(service_id, city, state);

-- Drop the junction table
DROP TABLE IF EXISTS service_service_areas CASCADE;
