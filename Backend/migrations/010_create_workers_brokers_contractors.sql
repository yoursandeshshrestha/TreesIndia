-- +goose Up
-- Create worker and broker tables (depend on users and services)

-- Workers table
CREATE TABLE IF NOT EXISTS workers (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    user_id BIGINT NOT NULL,
    service_id BIGINT NOT NULL,
    hourly_rate DECIMAL NOT NULL,
    is_available BOOLEAN DEFAULT true,
    rating DECIMAL DEFAULT 0,
    total_bookings INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (service_id) REFERENCES services(id)
);

-- Brokers table
CREATE TABLE IF NOT EXISTS brokers (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    user_id BIGINT NOT NULL,
    license_number TEXT NOT NULL,
    experience_years INTEGER NOT NULL,
    specialization TEXT,
    is_verified BOOLEAN DEFAULT false,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- +goose Down
DROP TABLE IF EXISTS brokers CASCADE;
DROP TABLE IF EXISTS workers CASCADE;



