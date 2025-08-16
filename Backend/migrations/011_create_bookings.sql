-- +goose Up
-- Create bookings table (depends on users, services, and time_slots)

CREATE TABLE IF NOT EXISTS bookings (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    user_id BIGINT NOT NULL,
    service_id BIGINT NOT NULL,
    time_slot_id BIGINT NOT NULL,
    scheduled_date DATE NOT NULL,
    scheduled_time TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'pending',
    payment_status TEXT DEFAULT 'pending',
    total_amount DECIMAL NOT NULL,
    notes TEXT,
    cancellation_reason TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (service_id) REFERENCES services(id),
    FOREIGN KEY (time_slot_id) REFERENCES time_slots(id)
);

-- +goose Down
DROP TABLE IF EXISTS bookings CASCADE;



