-- +goose Up
-- Create service areas table (base table with no dependencies)

CREATE TABLE IF NOT EXISTS service_areas (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    country TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true
);

-- Create service-service_areas junction table
CREATE TABLE IF NOT EXISTS service_service_areas (
    service_id BIGINT NOT NULL,
    service_area_id BIGINT NOT NULL,
    PRIMARY KEY (service_id, service_area_id),
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    FOREIGN KEY (service_area_id) REFERENCES service_areas(id) ON DELETE CASCADE
);

-- +goose Down
DROP TABLE IF EXISTS service_service_areas CASCADE;
DROP TABLE IF EXISTS service_areas CASCADE;
