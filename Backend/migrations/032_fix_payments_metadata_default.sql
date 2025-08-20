-- +goose Up
-- Fix payments metadata field to have proper default value
ALTER TABLE payments ALTER COLUMN metadata SET DEFAULT '{}'::jsonb;

-- Update existing NULL metadata values to empty JSON object
UPDATE payments SET metadata = '{}'::jsonb WHERE metadata IS NULL;

-- +goose Down
-- Revert the changes
ALTER TABLE payments ALTER COLUMN metadata DROP DEFAULT;
