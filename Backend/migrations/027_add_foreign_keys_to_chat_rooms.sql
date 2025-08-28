-- +goose Up
-- Add foreign key constraints to chat_rooms table

-- Add foreign key for property_id
ALTER TABLE chat_rooms 
ADD CONSTRAINT fk_chat_rooms_property_id 
FOREIGN KEY (property_id) REFERENCES properties(id);

-- Add foreign key for worker_inquiry_id
ALTER TABLE chat_rooms 
ADD CONSTRAINT fk_chat_rooms_worker_inquiry_id 
FOREIGN KEY (worker_inquiry_id) REFERENCES worker_inquiries(id);

-- +goose Down
-- Remove foreign key constraints from chat_rooms table
ALTER TABLE chat_rooms DROP CONSTRAINT IF EXISTS fk_chat_rooms_property_id;
ALTER TABLE chat_rooms DROP CONSTRAINT IF EXISTS fk_chat_rooms_worker_inquiry_id;
