-- +goose Up
-- Create call masking tables for Exotel integration

-- Call masking sessions table
CREATE TABLE IF NOT EXISTS call_masking_sessions (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    -- Booking and user references
    booking_id BIGINT NOT NULL,
    worker_id BIGINT NOT NULL,
    customer_id BIGINT NOT NULL,
    
    -- Exotel session details
    exotel_session_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'active', -- active, terminated
    
    -- Session tracking
    call_count INTEGER DEFAULT 0,
    total_call_duration INTEGER DEFAULT 0, -- in seconds
    terminated_at TIMESTAMPTZ,
    
    -- Foreign key constraints
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (worker_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Unique constraint to prevent multiple active sessions per booking
    UNIQUE(booking_id)
);

-- Call logs table
CREATE TABLE IF NOT EXISTS call_logs (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    -- Session reference
    session_id BIGINT NOT NULL,
    caller_id BIGINT NOT NULL,
    
    -- Call details
    call_duration INTEGER NOT NULL, -- in seconds
    call_status VARCHAR(50) NOT NULL, -- completed, failed, missed, ringing
    exotel_call_sid VARCHAR(255), -- Exotel call SID for tracking
    
    -- Call metadata
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    
    -- Foreign key constraints
    FOREIGN KEY (session_id) REFERENCES call_masking_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (caller_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_call_masking_sessions_booking_id ON call_masking_sessions(booking_id);
CREATE INDEX IF NOT EXISTS idx_call_masking_sessions_status ON call_masking_sessions(status);
CREATE INDEX IF NOT EXISTS idx_call_logs_session_id ON call_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_caller_id ON call_logs(caller_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_created_at ON call_logs(created_at);

-- +goose Down
-- Drop call masking tables

DROP INDEX IF EXISTS idx_call_logs_created_at;
DROP INDEX IF EXISTS idx_call_logs_caller_id;
DROP INDEX IF EXISTS idx_call_logs_session_id;
DROP INDEX IF EXISTS idx_call_masking_sessions_status;
DROP INDEX IF EXISTS idx_call_masking_sessions_booking_id;

DROP TABLE IF EXISTS call_logs;
DROP TABLE IF EXISTS call_masking_sessions;
