-- +goose Up
-- Drop worker pool tables (no longer needed with Go-based availability calculation)

-- Drop worker pool reservations table first (due to foreign key constraints)
DROP TABLE IF EXISTS worker_pool_reservations CASCADE;

-- Drop worker pools table
DROP TABLE IF EXISTS worker_pools CASCADE;

-- +goose Down
-- Recreate worker pool tables (if needed to rollback)

-- Worker pools table
CREATE TABLE IF NOT EXISTS worker_pools (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    total_capacity INTEGER NOT NULL DEFAULT 0,
    reserved_slots INTEGER NOT NULL DEFAULT 0,
    available_slots INTEGER NOT NULL DEFAULT 0,
    service_id BIGINT,
    location VARCHAR(255),
    FOREIGN KEY (service_id) REFERENCES services(id)
);

-- Create indexes for worker pools
CREATE INDEX IF NOT EXISTS idx_worker_pools_start_time ON worker_pools(start_time);
CREATE INDEX IF NOT EXISTS idx_worker_pools_end_time ON worker_pools(end_time);
CREATE INDEX IF NOT EXISTS idx_worker_pools_service_id ON worker_pools(service_id);
CREATE INDEX IF NOT EXISTS idx_worker_pools_location ON worker_pools(location);

-- Worker pool reservations table
CREATE TABLE IF NOT EXISTS worker_pool_reservations (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    pool_id BIGINT NOT NULL,
    booking_id BIGINT NOT NULL UNIQUE,
    reserved_at TIMESTAMPTZ NOT NULL,
    expires_at TIMESTAMPTZ,
    status TEXT DEFAULT 'reserved',
    assigned_worker_id BIGINT,
    assigned_at TIMESTAMPTZ,
    assigned_by BIGINT,
    FOREIGN KEY (pool_id) REFERENCES worker_pools(id),
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    FOREIGN KEY (assigned_worker_id) REFERENCES users(id),
    FOREIGN KEY (assigned_by) REFERENCES users(id)
);

-- Create indexes for worker pool reservations
CREATE INDEX IF NOT EXISTS idx_worker_pool_reservations_pool_id ON worker_pool_reservations(pool_id);
CREATE INDEX IF NOT EXISTS idx_worker_pool_reservations_booking_id ON worker_pool_reservations(booking_id);
CREATE INDEX IF NOT EXISTS idx_worker_pool_reservations_status ON worker_pool_reservations(status);
