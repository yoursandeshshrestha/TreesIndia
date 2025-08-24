-- +goose Up
-- Create service_areas table

CREATE TABLE IF NOT EXISTS service_areas (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    service_id BIGINT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'India',
    is_active BOOLEAN DEFAULT true,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_service_areas_service_id ON service_areas(service_id);
CREATE INDEX IF NOT EXISTS idx_service_areas_city ON service_areas(city);
CREATE INDEX IF NOT EXISTS idx_service_areas_state ON service_areas(state);
CREATE INDEX IF NOT EXISTS idx_service_areas_location ON service_areas(city, state);
CREATE INDEX IF NOT EXISTS idx_service_areas_active ON service_areas(is_active);
CREATE INDEX IF NOT EXISTS idx_service_areas_service_location ON service_areas(service_id, city, state);

-- +goose Down
-- Drop service_areas table

DROP TABLE IF EXISTS service_areas CASCADE;
