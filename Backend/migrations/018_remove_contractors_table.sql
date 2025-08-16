-- +goose Up
-- Remove contractors table (no longer needed)

-- Drop the contractors table
DROP TABLE IF EXISTS contractors CASCADE;

-- +goose Down
-- Recreate contractors table (for rollback)
CREATE TABLE IF NOT EXISTS contractors (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    user_id BIGINT NOT NULL,
    company_name TEXT NOT NULL,
    license_number TEXT NOT NULL,
    experience_years INTEGER NOT NULL,
    specialization TEXT,
    is_verified BOOLEAN DEFAULT false,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
