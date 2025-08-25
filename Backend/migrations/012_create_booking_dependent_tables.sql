-- +goose Up
-- Create booking-dependent tables

-- Worker assignments table
CREATE TABLE IF NOT EXISTS worker_assignments (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    booking_id BIGINT NOT NULL,
    worker_id BIGINT NOT NULL,
    assigned_by BIGINT NOT NULL,
    status TEXT DEFAULT 'assigned',
    assigned_at TIMESTAMPTZ NOT NULL,
    accepted_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    notes TEXT,
    acceptance_notes TEXT,
    rejection_notes TEXT,
    rejection_reason TEXT,
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    FOREIGN KEY (worker_id) REFERENCES workers(id),
    FOREIGN KEY (assigned_by) REFERENCES users(id)
);

-- Buffer requests table
CREATE TABLE IF NOT EXISTS buffer_requests (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    booking_id BIGINT NOT NULL,
    worker_id BIGINT NOT NULL,
    request_type TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    notes TEXT,
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    FOREIGN KEY (worker_id) REFERENCES workers(id)
);

-- +goose Down
DROP TABLE IF EXISTS buffer_requests CASCADE;
DROP TABLE IF EXISTS worker_assignments CASCADE;



