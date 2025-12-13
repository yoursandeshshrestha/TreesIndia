-- +goose Up
-- Add details column to services table for detailed descriptions
ALTER TABLE services ADD COLUMN IF NOT EXISTS details TEXT;

-- +goose Down
-- Remove details column from services table
ALTER TABLE services DROP COLUMN IF EXISTS details;
