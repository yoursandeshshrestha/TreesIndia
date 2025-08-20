-- +goose Up
-- Remove service_configs table as we're using admin_config for all configuration

-- Drop the service_configs table
DROP TABLE IF EXISTS service_configs CASCADE;

-- +goose Down
-- Recreate service_configs table (if needed to rollback)

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
