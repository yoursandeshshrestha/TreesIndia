-- +goose Up
-- Update worker system to support both treesindia and independent workers

-- Add new fields to workers table
ALTER TABLE workers ADD COLUMN IF NOT EXISTS worker_type VARCHAR(20) DEFAULT 'treesindia' CHECK (worker_type IN ('treesindia', 'independent'));

-- Add professional information fields
ALTER TABLE workers ADD COLUMN IF NOT EXISTS skills TEXT; -- JSON array of skills
ALTER TABLE workers ADD COLUMN IF NOT EXISTS experience_years INTEGER;
ALTER TABLE workers ADD COLUMN IF NOT EXISTS service_areas TEXT; -- JSON array of service areas (optional)

-- Add contact information fields
ALTER TABLE workers ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(20);
ALTER TABLE workers ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255);

-- Add bank account details (required for all workers)
ALTER TABLE workers ADD COLUMN IF NOT EXISTS bank_account_holder VARCHAR(255);
ALTER TABLE workers ADD COLUMN IF NOT EXISTS bank_account_number VARCHAR(50);
ALTER TABLE workers ADD COLUMN IF NOT EXISTS bank_ifsc_code VARCHAR(20);
ALTER TABLE workers ADD COLUMN IF NOT EXISTS bank_name VARCHAR(255);
ALTER TABLE workers ADD COLUMN IF NOT EXISTS bank_branch VARCHAR(255);

-- Add document verification fields
ALTER TABLE workers ADD COLUMN IF NOT EXISTS police_verification_status VARCHAR(20) DEFAULT 'pending' CHECK (police_verification_status IN ('pending', 'verified', 'rejected'));
ALTER TABLE workers ADD COLUMN IF NOT EXISTS police_verification_documents TEXT; -- JSON array of document URLs
ALTER TABLE workers ADD COLUMN IF NOT EXISTS aadhaar_card_front VARCHAR(500);
ALTER TABLE workers ADD COLUMN IF NOT EXISTS aadhaar_card_back VARCHAR(500);
ALTER TABLE workers ADD COLUMN IF NOT EXISTS pan_card_front VARCHAR(500);
ALTER TABLE workers ADD COLUMN IF NOT EXISTS pan_card_back VARCHAR(500);
ALTER TABLE workers ADD COLUMN IF NOT EXISTS document_verified_at TIMESTAMPTZ;
ALTER TABLE workers ADD COLUMN IF NOT EXISTS document_verified_by BIGINT REFERENCES users(id);

-- Create worker inquiries table
CREATE TABLE IF NOT EXISTS worker_inquiries (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    
    -- Inquiry details
    user_id BIGINT NOT NULL REFERENCES users(id),
    worker_id BIGINT NOT NULL REFERENCES workers(id),
    
    -- Project details
    project_name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    
    -- Contact details
    contact_person VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    contact_email VARCHAR(255),
    
    -- Status and admin approval
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    is_approved BOOLEAN DEFAULT false,
    approved_by BIGINT REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    admin_notes TEXT,
    
    -- Worker response
    worker_response TEXT,
    worker_contacted BOOLEAN DEFAULT false,
    contacted_at TIMESTAMPTZ,
    
    -- Relationships
    CONSTRAINT fk_worker_inquiries_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_worker_inquiries_worker FOREIGN KEY (worker_id) REFERENCES workers(id),
    CONSTRAINT fk_worker_inquiries_approved_by FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- Add fields to role_applications table for worker applications
ALTER TABLE role_applications ADD COLUMN IF NOT EXISTS police_verification_documents TEXT; -- JSON array of document URLs
ALTER TABLE role_applications ADD COLUMN IF NOT EXISTS aadhaar_card_front VARCHAR(500);
ALTER TABLE role_applications ADD COLUMN IF NOT EXISTS aadhaar_card_back VARCHAR(500);
ALTER TABLE role_applications ADD COLUMN IF NOT EXISTS pan_card_front VARCHAR(500);
ALTER TABLE role_applications ADD COLUMN IF NOT EXISTS pan_card_back VARCHAR(500);
ALTER TABLE role_applications ADD COLUMN IF NOT EXISTS bank_account_holder VARCHAR(255);
ALTER TABLE role_applications ADD COLUMN IF NOT EXISTS bank_account_number VARCHAR(50);
ALTER TABLE role_applications ADD COLUMN IF NOT EXISTS bank_ifsc_code VARCHAR(20);
ALTER TABLE role_applications ADD COLUMN IF NOT EXISTS bank_name VARCHAR(255);
ALTER TABLE role_applications ADD COLUMN IF NOT EXISTS bank_branch VARCHAR(255);

-- +goose Down
-- Remove worker inquiries table
DROP TABLE IF EXISTS worker_inquiries CASCADE;

-- Remove fields from workers table
ALTER TABLE workers DROP COLUMN IF EXISTS worker_type;
ALTER TABLE workers DROP COLUMN IF EXISTS skills;
ALTER TABLE workers DROP COLUMN IF EXISTS experience_years;
ALTER TABLE workers DROP COLUMN IF EXISTS service_areas;
ALTER TABLE workers DROP COLUMN IF EXISTS contact_phone;
ALTER TABLE workers DROP COLUMN IF EXISTS contact_email;
ALTER TABLE workers DROP COLUMN IF EXISTS bank_account_holder;
ALTER TABLE workers DROP COLUMN IF EXISTS bank_account_number;
ALTER TABLE workers DROP COLUMN IF EXISTS bank_ifsc_code;
ALTER TABLE workers DROP COLUMN IF EXISTS bank_name;
ALTER TABLE workers DROP COLUMN IF EXISTS bank_branch;
ALTER TABLE workers DROP COLUMN IF EXISTS police_verification_status;
ALTER TABLE workers DROP COLUMN IF EXISTS police_verification_documents;
ALTER TABLE workers DROP COLUMN IF EXISTS aadhaar_card_front;
ALTER TABLE workers DROP COLUMN IF EXISTS aadhaar_card_back;
ALTER TABLE workers DROP COLUMN IF EXISTS pan_card_front;
ALTER TABLE workers DROP COLUMN IF EXISTS pan_card_back;
ALTER TABLE workers DROP COLUMN IF EXISTS document_verified_at;
ALTER TABLE workers DROP COLUMN IF EXISTS document_verified_by;

-- Remove fields from role_applications table
ALTER TABLE role_applications DROP COLUMN IF EXISTS police_verification_documents;
ALTER TABLE role_applications DROP COLUMN IF EXISTS aadhaar_card_front;
ALTER TABLE role_applications DROP COLUMN IF EXISTS aadhaar_card_back;
ALTER TABLE role_applications DROP COLUMN IF EXISTS pan_card_front;
ALTER TABLE role_applications DROP COLUMN IF EXISTS pan_card_back;
ALTER TABLE role_applications DROP COLUMN IF EXISTS bank_account_holder;
ALTER TABLE role_applications DROP COLUMN IF EXISTS bank_account_number;
ALTER TABLE role_applications DROP COLUMN IF EXISTS bank_ifsc_code;
ALTER TABLE role_applications DROP COLUMN IF EXISTS bank_name;
ALTER TABLE role_applications DROP COLUMN IF EXISTS bank_branch;
