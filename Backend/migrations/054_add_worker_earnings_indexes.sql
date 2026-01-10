-- +goose Up
-- Add indexes for worker earnings queries to improve performance

-- Composite index for worker assignments earnings queries
-- This optimizes queries that filter by worker_id, status='completed', and order by completed_at
CREATE INDEX IF NOT EXISTS idx_worker_assignments_earnings
ON worker_assignments(worker_id, status, completed_at DESC)
WHERE deleted_at IS NULL;

-- +goose Down
-- Remove the earnings indexes

DROP INDEX IF EXISTS idx_worker_assignments_earnings;
