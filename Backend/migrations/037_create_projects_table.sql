-- +goose Up
-- Create projects table for project management with subscription-based access

CREATE TABLE IF NOT EXISTS projects (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    -- Basic Information
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    
    -- Project Details
    project_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'starting_soon' NOT NULL,
    
    -- Location Information
    state VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    
    -- Project Timeline
    estimated_duration_days INTEGER,
    
    -- Contact Information
    contact_info JSONB NOT NULL,
    
    -- Admin flag
    uploaded_by_admin BOOLEAN DEFAULT FALSE,
    
    -- Images
    images JSON NOT NULL,
    
    -- Relationships
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_project_type ON projects(project_type);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_state_city ON projects(state, city);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);
CREATE INDEX IF NOT EXISTS idx_projects_deleted_at ON projects(deleted_at);

-- Add constraints
ALTER TABLE projects ADD CONSTRAINT chk_projects_project_type 
    CHECK (project_type IN ('residential', 'commercial', 'infrastructure'));

ALTER TABLE projects ADD CONSTRAINT chk_projects_status 
    CHECK (status IN ('starting_soon', 'on_going', 'completed', 'cancelled', 'on_hold'));

-- +goose Down
-- Drop projects table
DROP TABLE IF EXISTS projects CASCADE;
