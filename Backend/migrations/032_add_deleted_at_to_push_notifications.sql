-- +goose Up
-- Migration: Add deleted_at column to push_notifications table
-- Created: 2025-09-02

-- Add deleted_at column to push_notifications table
ALTER TABLE push_notifications 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Update existing records to have NULL deleted_at
UPDATE push_notifications SET deleted_at = NULL WHERE deleted_at IS NULL;

-- Create index on deleted_at for soft delete queries
CREATE INDEX IF NOT EXISTS idx_push_notifications_deleted_at ON push_notifications(deleted_at);

-- +goose Down
-- Remove deleted_at column from push_notifications table
DROP INDEX IF EXISTS idx_push_notifications_deleted_at;
ALTER TABLE push_notifications DROP COLUMN IF EXISTS deleted_at;
