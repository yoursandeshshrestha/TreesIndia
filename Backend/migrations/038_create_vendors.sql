-- +goose Up
-- Create vendors table
CREATE TABLE IF NOT EXISTS vendors (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    -- Basic Information
    vendor_name TEXT NOT NULL,
    business_description TEXT,
    
    -- Contact Person & Address
    contact_person_name TEXT,
    contact_person_phone TEXT,
    contact_person_email TEXT,
    business_address JSONB,
    
    -- Business Details
    business_type TEXT,
    years_in_business INTEGER,
    services_offered JSONB,
    
    -- Pictures
    profile_picture TEXT,
    business_gallery JSONB,
    
    -- Operational Data
    is_active BOOLEAN DEFAULT true,
    
    -- Relationships
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vendors_user_id ON vendors(user_id);
CREATE INDEX IF NOT EXISTS idx_vendors_is_active ON vendors(is_active);
CREATE INDEX IF NOT EXISTS idx_vendors_business_type ON vendors(business_type);
CREATE INDEX IF NOT EXISTS idx_vendors_created_at ON vendors(created_at);

-- +goose Down
DROP TABLE IF EXISTS vendors CASCADE;
