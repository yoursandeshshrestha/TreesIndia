-- +goose Up
-- Create tables that depend on services

-- Service configs table
CREATE TABLE IF NOT EXISTS service_configs (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    service_id BIGINT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    service_duration_minutes INTEGER NOT NULL,
    buffer_time_minutes INTEGER NOT NULL,
    advance_booking_days INTEGER NOT NULL,
    max_workers_per_slot INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    FOREIGN KEY (service_id) REFERENCES services(id)
);

-- Time slots table
CREATE TABLE IF NOT EXISTS time_slots (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    service_id BIGINT NOT NULL,
    date DATE NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    available_workers INTEGER NOT NULL,
    total_workers INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    FOREIGN KEY (service_id) REFERENCES services(id)
);

-- +goose Down
DROP TABLE IF EXISTS time_slots CASCADE;
DROP TABLE IF EXISTS service_configs CASCADE;



