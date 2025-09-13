-- +goose Up
-- Create simple conversation system tables

-- Conversations table (without last_message_id foreign key initially)
CREATE TABLE IF NOT EXISTS simple_conversations (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    user_id BIGINT NOT NULL,
    worker_id BIGINT,
    admin_id BIGINT,
    last_message_id BIGINT,
    last_message_text TEXT,
    last_message_created_at TIMESTAMPTZ,
    last_message_sender_id BIGINT,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (worker_id) REFERENCES users(id),
    FOREIGN KEY (admin_id) REFERENCES users(id),
    FOREIGN KEY (last_message_sender_id) REFERENCES users(id)
);

-- Conversation messages table
CREATE TABLE IF NOT EXISTS simple_conversation_messages (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    conversation_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    FOREIGN KEY (conversation_id) REFERENCES simple_conversations(id),
    FOREIGN KEY (sender_id) REFERENCES users(id)
);

-- Add the foreign key constraint for last_message_id after both tables exist
ALTER TABLE simple_conversations 
ADD CONSTRAINT fk_simple_conversations_last_message 
FOREIGN KEY (last_message_id) REFERENCES simple_conversation_messages(id);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_simple_conversations_user_id ON simple_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_simple_conversations_worker_id ON simple_conversations(worker_id);
CREATE INDEX IF NOT EXISTS idx_simple_conversations_admin_id ON simple_conversations(admin_id);
CREATE INDEX IF NOT EXISTS idx_simple_conversations_last_message_id ON simple_conversations(last_message_id);
CREATE INDEX IF NOT EXISTS idx_simple_conversation_messages_conversation_id ON simple_conversation_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_simple_conversation_messages_sender_id ON simple_conversation_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_simple_conversation_messages_is_read ON simple_conversation_messages(is_read);

-- +goose Down
DROP TABLE IF EXISTS simple_conversation_messages CASCADE;
DROP TABLE IF EXISTS simple_conversations CASCADE;
