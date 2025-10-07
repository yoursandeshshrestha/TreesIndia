-- +goose Up
-- Create OTPs table for authentication and verification
CREATE TABLE IF NOT EXISTS otps (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    phone VARCHAR(20) NOT NULL,
    code VARCHAR(10) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    purpose VARCHAR(50) NOT NULL,
    attempts INTEGER DEFAULT 0
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_otps_phone ON otps(phone);
CREATE INDEX IF NOT EXISTS idx_otps_expires_at ON otps(expires_at);
CREATE INDEX IF NOT EXISTS idx_otps_phone_purpose ON otps(phone, purpose);
CREATE INDEX IF NOT EXISTS idx_otps_deleted_at ON otps(deleted_at);

-- Add comments
COMMENT ON TABLE otps IS 'Stores OTPs for authentication and verification purposes';
COMMENT ON COLUMN otps.phone IS 'Phone number to which OTP is sent (format: +919876543210)';
COMMENT ON COLUMN otps.code IS 'The 6-digit OTP code';
COMMENT ON COLUMN otps.expires_at IS 'Expiration timestamp for the OTP';
COMMENT ON COLUMN otps.is_verified IS 'Whether the OTP has been successfully verified';
COMMENT ON COLUMN otps.purpose IS 'Purpose of the OTP (login, account_deletion, etc.)';
COMMENT ON COLUMN otps.attempts IS 'Number of verification attempts made';

-- +goose Down
-- Drop OTPs table
DROP INDEX IF EXISTS idx_otps_deleted_at;
DROP INDEX IF EXISTS idx_otps_phone_purpose;
DROP INDEX IF EXISTS idx_otps_expires_at;
DROP INDEX IF EXISTS idx_otps_phone;
DROP TABLE IF EXISTS otps CASCADE;

