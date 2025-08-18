-- +goose Up
-- Add is_active column to admin_configs table

ALTER TABLE admin_configs 
ADD COLUMN is_active BOOLEAN DEFAULT true;

-- Update existing records to have is_active = true
UPDATE admin_configs SET is_active = true WHERE is_active IS NULL;

-- +goose Down
-- Remove is_active column from admin_configs table

ALTER TABLE admin_configs DROP COLUMN IF EXISTS is_active;
