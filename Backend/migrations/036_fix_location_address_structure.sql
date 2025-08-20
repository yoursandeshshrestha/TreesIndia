-- +goose Up
-- Fix location and address structure

-- First, drop the existing locations table
DROP TABLE IF EXISTS locations CASCADE;

-- Create locations table (one per user)
CREATE TABLE IF NOT EXISTS locations (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    user_id BIGINT NOT NULL UNIQUE,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    country TEXT NOT NULL,
    address TEXT,
    postal_code TEXT,
    latitude DECIMAL,
    longitude DECIMAL,
    is_active BOOLEAN DEFAULT true,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create addresses table (multiple per user)
CREATE TABLE IF NOT EXISTS addresses (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    user_id BIGINT NOT NULL,
    location_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    postal_code TEXT,
    latitude DECIMAL,
    longitude DECIMAL,
    is_default BOOLEAN DEFAULT false,
    landmark TEXT,
    house_number TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (location_id) REFERENCES locations(id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_locations_user_id ON locations(user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_location_id ON addresses(location_id);

-- +goose Down
-- Revert changes

-- Drop the new tables
DROP TABLE IF EXISTS addresses CASCADE;
DROP TABLE IF EXISTS locations CASCADE;

-- Recreate the original locations table structure
CREATE TABLE IF NOT EXISTS locations (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    user_id BIGINT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    latitude DECIMAL,
    longitude DECIMAL,
    is_default BOOLEAN DEFAULT false,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
