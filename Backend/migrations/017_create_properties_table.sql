-- +goose Up
-- Create properties table (depends on users)

CREATE TABLE IF NOT EXISTS properties (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    -- Basic Information
    title TEXT NOT NULL,
    description TEXT,
    property_type TEXT NOT NULL,
    listing_type TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    
    -- Pricing
    sale_price DECIMAL,
    monthly_rent DECIMAL,
    price_negotiable BOOLEAN DEFAULT true,
    
    -- Property Details
    bedrooms INTEGER,
    bathrooms INTEGER,
    area DECIMAL,
    floor_number INTEGER,
    age TEXT,
    furnishing_status TEXT,
    
    -- Location Information
    state TEXT NOT NULL,
    city TEXT NOT NULL,
    address TEXT,
    pincode TEXT,
    
    -- Status and Approval
    status TEXT DEFAULT 'available',
    is_approved BOOLEAN DEFAULT false,
    approved_at TIMESTAMPTZ,
    approved_by BIGINT,
    uploaded_by_admin BOOLEAN DEFAULT false,
    
    -- Priority and Subscription
    priority_score INTEGER DEFAULT 0,
    subscription_required BOOLEAN DEFAULT false,
    
    -- TreesIndia Assured Tag
    treesindia_assured BOOLEAN DEFAULT false,
    
    -- Images
    images JSONB,
    
    -- Expiry
    expires_at TIMESTAMPTZ,
    
    -- Relationships
    user_id BIGINT NOT NULL,
    broker_id BIGINT,
    
    -- Foreign Keys
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (broker_id) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_properties_user_id ON properties(user_id);
CREATE INDEX IF NOT EXISTS idx_properties_broker_id ON properties(broker_id);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_is_approved ON properties(is_approved);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_state ON properties(state);
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_listing_type ON properties(listing_type);
CREATE INDEX IF NOT EXISTS idx_properties_slug ON properties(slug);
CREATE INDEX IF NOT EXISTS idx_properties_priority_score ON properties(priority_score);
CREATE INDEX IF NOT EXISTS idx_properties_expires_at ON properties(expires_at);
CREATE INDEX IF NOT EXISTS idx_properties_treesindia_assured ON properties(treesindia_assured);

-- Add constraints
ALTER TABLE properties ADD CONSTRAINT chk_properties_property_type 
    CHECK (property_type IN ('residential', 'commercial'));

ALTER TABLE properties ADD CONSTRAINT chk_properties_listing_type 
    CHECK (listing_type IN ('sale', 'rent'));

ALTER TABLE properties ADD CONSTRAINT chk_properties_status 
    CHECK (status IN ('available', 'sold', 'rented'));

ALTER TABLE properties ADD CONSTRAINT chk_properties_furnishing_status 
    CHECK (furnishing_status IS NULL OR furnishing_status IN ('furnished', 'semi_furnished', 'unfurnished'));

ALTER TABLE properties ADD CONSTRAINT chk_properties_age 
    CHECK (age IS NULL OR age IN ('under_1_year', '1_2_years', '2_5_years', '10_plus_years'));

-- +goose Down
-- Drop properties table
DROP TABLE IF EXISTS properties CASCADE;
