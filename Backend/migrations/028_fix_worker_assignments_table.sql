-- +goose Up
-- Fix worker_assignments table by adding missing columns

-- Add missing columns to worker_assignments table
ALTER TABLE worker_assignments 
ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS assignment_notes TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS acceptance_notes TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS rejection_notes TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS rejection_reason TEXT DEFAULT '';

-- Update assigned_at column to have proper default
ALTER TABLE worker_assignments 
ALTER COLUMN assigned_at SET DEFAULT NOW();

-- +goose Down
-- Remove the added columns
ALTER TABLE worker_assignments 
DROP COLUMN IF EXISTS accepted_at,
DROP COLUMN IF EXISTS rejected_at,
DROP COLUMN IF EXISTS started_at,
DROP COLUMN IF EXISTS completed_at,
DROP COLUMN IF EXISTS assignment_notes,
DROP COLUMN IF EXISTS acceptance_notes,
DROP COLUMN IF EXISTS rejection_notes,
DROP COLUMN IF EXISTS rejection_reason;
