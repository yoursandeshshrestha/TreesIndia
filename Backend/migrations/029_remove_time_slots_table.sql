-- +goose Up
-- Remove time_slots table as we're moving to on-demand calculation

-- Drop the time_slots table
DROP TABLE IF EXISTS time_slots CASCADE;

-- +goose Down
-- Recreate time_slots table (if needed to rollback)

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
