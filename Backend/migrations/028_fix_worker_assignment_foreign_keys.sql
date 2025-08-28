-- +goose Up
-- Fix worker assignment foreign key constraints

-- Drop the existing foreign key constraints that reference workers(id)
ALTER TABLE worker_assignments DROP CONSTRAINT IF EXISTS worker_assignments_worker_id_fkey;
ALTER TABLE buffer_requests DROP CONSTRAINT IF EXISTS buffer_requests_worker_id_fkey;

-- Add the correct foreign key constraints that reference users(id)
ALTER TABLE worker_assignments ADD CONSTRAINT worker_assignments_worker_id_fkey 
    FOREIGN KEY (worker_id) REFERENCES users(id);
ALTER TABLE buffer_requests ADD CONSTRAINT buffer_requests_worker_id_fkey 
    FOREIGN KEY (worker_id) REFERENCES users(id);

-- +goose Down
-- Revert the changes
ALTER TABLE worker_assignments DROP CONSTRAINT IF EXISTS worker_assignments_worker_id_fkey;
ALTER TABLE buffer_requests DROP CONSTRAINT IF EXISTS buffer_requests_worker_id_fkey;

-- Restore original constraints (if needed)
ALTER TABLE worker_assignments ADD CONSTRAINT worker_assignments_worker_id_fkey 
    FOREIGN KEY (worker_id) REFERENCES workers(id);
ALTER TABLE buffer_requests ADD CONSTRAINT buffer_requests_worker_id_fkey 
    FOREIGN KEY (worker_id) REFERENCES workers(id);
