-- +goose Up
-- Remove time_slot_id column from bookings table since we're moving to on-demand calculation

-- Drop the time_slot_id column from bookings table
ALTER TABLE bookings DROP COLUMN IF EXISTS time_slot_id;

-- +goose Down
-- Recreate time_slot_id column (if needed to rollback)

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS time_slot_id BIGINT;
