-- +goose Up
-- Update call masking schema to use simplified approach

-- Rename table from call_masking_sessions to call_masking_enabled
ALTER TABLE call_masking_sessions RENAME TO call_masking_enabled;

-- Remove unnecessary columns
ALTER TABLE call_masking_enabled DROP COLUMN IF EXISTS exotel_session_id;
ALTER TABLE call_masking_enabled DROP COLUMN IF EXISTS status;

-- Rename terminated_at to disabled_at
ALTER TABLE call_masking_enabled RENAME COLUMN terminated_at TO disabled_at;

-- Update call_logs table to use new foreign key
ALTER TABLE call_logs RENAME COLUMN session_id TO call_masking_id;

-- Update foreign key constraint
ALTER TABLE call_logs DROP CONSTRAINT IF EXISTS call_logs_session_id_fkey;
ALTER TABLE call_logs ADD CONSTRAINT call_logs_call_masking_id_fkey 
    FOREIGN KEY (call_masking_id) REFERENCES call_masking_enabled(id) ON DELETE CASCADE;

-- Update indexes
DROP INDEX IF EXISTS idx_call_masking_sessions_booking_id;
DROP INDEX IF EXISTS idx_call_masking_sessions_status;
DROP INDEX IF EXISTS idx_call_logs_session_id;

CREATE INDEX IF NOT EXISTS idx_call_masking_enabled_booking_id ON call_masking_enabled(booking_id);
CREATE INDEX IF NOT EXISTS idx_call_masking_enabled_disabled_at ON call_masking_enabled(disabled_at);
CREATE INDEX IF NOT EXISTS idx_call_logs_call_masking_id ON call_logs(call_masking_id);

-- +goose Down
-- Revert call masking schema changes

-- Revert indexes
DROP INDEX IF EXISTS idx_call_masking_enabled_booking_id;
DROP INDEX IF EXISTS idx_call_masking_enabled_disabled_at;
DROP INDEX IF EXISTS idx_call_logs_call_masking_id;

CREATE INDEX IF NOT EXISTS idx_call_masking_sessions_booking_id ON call_masking_enabled(booking_id);
CREATE INDEX IF NOT EXISTS idx_call_masking_sessions_status ON call_masking_enabled(status);
CREATE INDEX IF NOT EXISTS idx_call_logs_session_id ON call_logs(call_masking_id);

-- Revert foreign key constraint
ALTER TABLE call_logs DROP CONSTRAINT IF EXISTS call_logs_call_masking_id_fkey;
ALTER TABLE call_logs ADD CONSTRAINT call_logs_session_id_fkey 
    FOREIGN KEY (call_masking_id) REFERENCES call_masking_enabled(id) ON DELETE CASCADE;

-- Revert column names
ALTER TABLE call_logs RENAME COLUMN call_masking_id TO session_id;
ALTER TABLE call_masking_enabled RENAME COLUMN disabled_at TO terminated_at;

-- Add back removed columns
ALTER TABLE call_masking_enabled ADD COLUMN exotel_session_id VARCHAR(255);
ALTER TABLE call_masking_enabled ADD COLUMN status VARCHAR(50) DEFAULT 'active';

-- Rename table back
ALTER TABLE call_masking_enabled RENAME TO call_masking_sessions;
