-- +goose Up
-- Add service_updates column to user_notification_settings table

ALTER TABLE user_notification_settings 
ADD COLUMN IF NOT EXISTS service_updates BOOLEAN DEFAULT true;

-- +goose Down
-- Remove service_updates column from user_notification_settings table

ALTER TABLE user_notification_settings 
DROP COLUMN IF EXISTS service_updates;
