-- +goose Up
-- Add closed_at and closed_reason to chat_rooms table

ALTER TABLE chat_rooms 
ADD COLUMN closed_at TIMESTAMPTZ,
ADD COLUMN closed_reason TEXT;

-- Add indexes for better performance
CREATE INDEX idx_chat_rooms_closed_at ON chat_rooms(closed_at);
CREATE INDEX idx_chat_rooms_booking_status ON chat_rooms(booking_id, is_active);

-- +goose Down
-- Remove indexes and columns
DROP INDEX IF EXISTS idx_chat_rooms_closed_at;
DROP INDEX IF EXISTS idx_chat_rooms_booking_status;

ALTER TABLE chat_rooms 
DROP COLUMN IF EXISTS closed_at,
DROP COLUMN IF EXISTS closed_reason;
