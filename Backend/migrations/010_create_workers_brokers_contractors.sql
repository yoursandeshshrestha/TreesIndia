-- +goose Up
-- Create role applications, worker, and broker tables

-- Role Applications table (Simplified)
CREATE TABLE IF NOT EXISTS role_applications (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    user_id BIGINT NOT NULL,
    requested_role TEXT NOT NULL, -- 'worker', 'broker'
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by BIGINT, -- admin user id
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

-- Workers table
CREATE TABLE IF NOT EXISTS workers (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    user_id BIGINT NOT NULL UNIQUE,
    role_application_id BIGINT,
    
    -- Worker Type
    worker_type TEXT DEFAULT 'normal',
    
    -- Contact Information (JSON Object)
    contact_info JSONB, -- {"alternative_number": "string"}
    
    -- Address Information (JSON Object)
    address JSONB, -- {"street": "string", "city": "string", "state": "string", "pincode": "string", "landmark": "string"}
    
    -- Banking Information (JSON Object)
    banking_info JSONB, -- {"account_number": "string", "ifsc_code": "string", "bank_name": "string", "account_holder_name": "string"}
    
    -- Documents (JSON Object)
    documents JSONB, -- {"aadhar_card": "cloudinary_url", "pan_card": "cloudinary_url", "profile_pic": "cloudinary_url", "police_verification": "cloudinary_url"}
    
    -- Skills & Experience
    skills JSONB, -- JSON array of skill names
    experience_years INTEGER DEFAULT 0,
    
    -- Operational Data
    is_available BOOLEAN DEFAULT false,
    rating DECIMAL DEFAULT 0,
    total_bookings INTEGER DEFAULT 0,
    earnings DECIMAL DEFAULT 0,
    total_jobs INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT false,
    
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (role_application_id) REFERENCES role_applications(id)
);

-- Brokers table
CREATE TABLE IF NOT EXISTS brokers (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    user_id BIGINT NOT NULL UNIQUE,
    role_application_id BIGINT,
    
    -- Contact Information (JSON Object)
    contact_info JSONB, -- {"alternative_number": "string"}
    
    -- Address Information (JSON Object)
    address JSONB, -- {"street": "string", "city": "string", "state": "string", "pincode": "string", "landmark": "string"}
    
    -- Documents (JSON Object)
    documents JSONB, -- {"aadhar_card": "cloudinary_url", "pan_card": "cloudinary_url", "profile_pic": "cloudinary_url"}
    
    -- Broker Specific
    license TEXT UNIQUE,
    agency TEXT,
    
    -- Operational Data
    is_active BOOLEAN DEFAULT false,
    
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (role_application_id) REFERENCES role_applications(id)
);

-- +goose Down
DROP TABLE IF EXISTS brokers CASCADE;
DROP TABLE IF EXISTS workers CASCADE;
DROP TABLE IF EXISTS role_applications CASCADE;



