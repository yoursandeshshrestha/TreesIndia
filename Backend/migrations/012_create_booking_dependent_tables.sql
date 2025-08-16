-- +goose Up
-- Create tables that depend on bookings

-- Worker assignments table
CREATE TABLE IF NOT EXISTS worker_assignments (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    booking_id BIGINT NOT NULL,
    worker_id BIGINT NOT NULL,
    assigned_by BIGINT NOT NULL,
    assigned_at TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'assigned',
    notes TEXT,
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    FOREIGN KEY (worker_id) REFERENCES users(id),
    FOREIGN KEY (assigned_by) REFERENCES users(id)
);

-- Buffer requests table
CREATE TABLE IF NOT EXISTS buffer_requests (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    booking_id BIGINT NOT NULL,
    worker_id BIGINT NOT NULL,
    request_type TEXT NOT NULL,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    approved_by BIGINT,
    approved_at TIMESTAMPTZ,
    notes TEXT,
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    FOREIGN KEY (worker_id) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- +goose Down
DROP TABLE IF EXISTS buffer_requests CASCADE;
DROP TABLE IF EXISTS worker_assignments CASCADE;



