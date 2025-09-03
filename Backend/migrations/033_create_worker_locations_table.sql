-- +goose Up
-- Create worker_locations table for real-time location tracking

CREATE TABLE IF NOT EXISTS worker_locations (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    -- Worker and Assignment References
    worker_id BIGINT NOT NULL,
    assignment_id BIGINT NOT NULL,
    booking_id BIGINT NOT NULL,
    
    -- GPS Coordinates
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    accuracy DOUBLE PRECISION, -- GPS accuracy in meters
    
    -- Status
    status TEXT DEFAULT 'tracking',
    
    -- Metadata
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Foreign Keys
    FOREIGN KEY (worker_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assignment_id) REFERENCES worker_assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    
    -- Indexes for performance
    CONSTRAINT unique_active_worker_location UNIQUE (worker_id, assignment_id, is_active)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_worker_locations_worker_id ON worker_locations(worker_id);
CREATE INDEX IF NOT EXISTS idx_worker_locations_assignment_id ON worker_locations(assignment_id);
CREATE INDEX IF NOT EXISTS idx_worker_locations_booking_id ON worker_locations(booking_id);
CREATE INDEX IF NOT EXISTS idx_worker_locations_status ON worker_locations(status);
CREATE INDEX IF NOT EXISTS idx_worker_locations_is_active ON worker_locations(is_active);
CREATE INDEX IF NOT EXISTS idx_worker_locations_last_updated ON worker_locations(last_updated);

-- +goose Down
DROP TABLE IF EXISTS worker_locations CASCADE;
