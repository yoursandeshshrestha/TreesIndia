-- +goose Up
-- Add service duration and buffer duration columns to time_slots table

ALTER TABLE time_slots ADD COLUMN service_duration_minutes INTEGER NOT NULL DEFAULT 60;
ALTER TABLE time_slots ADD COLUMN buffer_duration_minutes INTEGER NOT NULL DEFAULT 30;

COMMENT ON COLUMN time_slots.service_duration_minutes IS 'Duration of the service in minutes';
COMMENT ON COLUMN time_slots.buffer_duration_minutes IS 'Buffer time between services in minutes';

-- +goose Down
-- Remove service duration and buffer duration columns from time_slots table

ALTER TABLE time_slots DROP COLUMN IF EXISTS service_duration_minutes;
ALTER TABLE time_slots DROP COLUMN IF EXISTS buffer_duration_minutes;
