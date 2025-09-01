-- +goose Up
-- Add missing fields to chat_messages table

ALTER TABLE chat_messages 
ADD COLUMN read_by JSONB DEFAULT '[]',
ADD COLUMN attachments JSONB DEFAULT '[]',
ADD COLUMN status TEXT DEFAULT 'sent',
ADD COLUMN reply_to_message_id BIGINT,
ADD CONSTRAINT fk_chat_messages_reply_to_message 
    FOREIGN KEY (reply_to_message_id) REFERENCES chat_messages(id);

-- +goose Down
-- Remove the added fields
ALTER TABLE chat_messages 
DROP CONSTRAINT IF EXISTS fk_chat_messages_reply_to_message,
DROP COLUMN IF EXISTS read_by,
DROP COLUMN IF EXISTS attachments,
DROP COLUMN IF EXISTS status,
DROP COLUMN IF EXISTS reply_to_message_id;
