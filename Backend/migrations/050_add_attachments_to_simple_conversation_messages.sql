-- +goose Up
-- Add attachment fields to simple_conversation_messages table

ALTER TABLE simple_conversation_messages
ADD COLUMN IF NOT EXISTS attachment_type VARCHAR(20),
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS cloudinary_public_id VARCHAR(255);

-- Add index for cloudinary_public_id for faster lookups during cleanup
CREATE INDEX IF NOT EXISTS idx_simple_conversation_messages_cloudinary_public_id 
ON simple_conversation_messages(cloudinary_public_id);

-- Make message field nullable since messages can have attachments without text
ALTER TABLE simple_conversation_messages
ALTER COLUMN message DROP NOT NULL;

-- +goose Down
-- Remove attachment fields from simple_conversation_messages table

DROP INDEX IF EXISTS idx_simple_conversation_messages_cloudinary_public_id;

ALTER TABLE simple_conversation_messages
DROP COLUMN IF EXISTS attachment_type,
DROP COLUMN IF EXISTS image_url,
DROP COLUMN IF EXISTS video_url,
DROP COLUMN IF EXISTS cloudinary_public_id;

-- Restore message field to NOT NULL
ALTER TABLE simple_conversation_messages
ALTER COLUMN message SET NOT NULL;

