-- +goose Up
-- Create worker, broker, and contractor tables

-- Workers table
CREATE TABLE IF NOT EXISTS workers (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    user_id BIGINT NOT NULL UNIQUE,
    service_id BIGINT NOT NULL,
    hourly_rate DECIMAL NOT NULL,
    is_available BOOLEAN DEFAULT true,
    rating DECIMAL DEFAULT 0,
    total_bookings INTEGER DEFAULT 0,
    worker_type TEXT DEFAULT 'treesindia',
    skills TEXT,
    experience_years INTEGER DEFAULT 0,
    service_areas TEXT,
    contact_phone TEXT,
    contact_email TEXT,
    bank_account_holder TEXT,
    bank_account_number TEXT,
    bank_ifsc_code TEXT,
    bank_name TEXT,
    bank_branch TEXT,
    police_verification_status TEXT DEFAULT 'pending',
    police_verification_documents TEXT,
    aadhaar_card_front TEXT,
    aadhaar_card_back TEXT,
    pan_card_front TEXT,
    pan_card_back TEXT,
    document_verified_at TIMESTAMPTZ,
    document_verified_by BIGINT,
    earnings DECIMAL DEFAULT 0,
    total_jobs INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (service_id) REFERENCES services(id),
    FOREIGN KEY (document_verified_by) REFERENCES users(id)
);

-- Brokers table
CREATE TABLE IF NOT EXISTS brokers (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    user_id BIGINT NOT NULL UNIQUE,
    license TEXT UNIQUE,
    agency TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- +goose Down
DROP TABLE IF EXISTS brokers CASCADE;
DROP TABLE IF EXISTS workers CASCADE;



