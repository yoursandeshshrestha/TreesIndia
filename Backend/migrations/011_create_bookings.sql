-- +goose Up
-- Create bookings table (depends on users and services)

CREATE TABLE IF NOT EXISTS bookings (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    booking_reference VARCHAR(255) UNIQUE NOT NULL,
    user_id BIGINT NOT NULL,
    service_id BIGINT NOT NULL,
    status TEXT DEFAULT 'pending',
    payment_status TEXT DEFAULT 'pending',
    booking_type TEXT DEFAULT 'regular',
    completion_type TEXT,
    scheduled_date DATE,
    scheduled_time TIMESTAMPTZ,
    scheduled_end_time TIMESTAMPTZ,
    actual_start_time TIMESTAMPTZ,
    actual_end_time TIMESTAMPTZ,
    actual_duration_minutes INTEGER,
    address JSONB,
    description TEXT,
    contact_person VARCHAR(255),
    contact_phone VARCHAR(20),
    special_instructions TEXT,
    hold_expires_at TIMESTAMPTZ,
    quote_amount DECIMAL,
    quote_notes TEXT,
    quote_provided_by BIGINT,
    quote_provided_at TIMESTAMPTZ,
    quote_accepted_at TIMESTAMPTZ,
    quote_expires_at TIMESTAMPTZ,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (service_id) REFERENCES services(id)
);

-- +goose Down
DROP TABLE IF EXISTS bookings CASCADE;



