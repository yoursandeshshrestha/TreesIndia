-- +goose Up
-- Create properties table (depends on users)

CREATE TABLE IF NOT EXISTS properties (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    user_id BIGINT NOT NULL,
    broker_id BIGINT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    property_type TEXT NOT NULL,
    price DECIMAL NOT NULL,
    location TEXT NOT NULL,
    bedrooms INTEGER,
    bathrooms INTEGER,
    area_sqft DECIMAL,
    images TEXT[],
    status TEXT DEFAULT 'available',
    is_approved BOOLEAN DEFAULT false,
    approved_by BIGINT,
    approved_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    uploaded_by_admin BOOLEAN DEFAULT false,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (broker_id) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- +goose Down
DROP TABLE IF EXISTS properties CASCADE;



