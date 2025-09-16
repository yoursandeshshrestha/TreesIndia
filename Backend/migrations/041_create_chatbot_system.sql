-- +goose Up
-- Create chatbot_sessions table
CREATE TABLE IF NOT EXISTS chatbot_sessions (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_message_at TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    current_context JSONB DEFAULT '{}',
    query_type VARCHAR(50),
    location VARCHAR(255)
);

-- Create chatbot_messages table
CREATE TABLE IF NOT EXISTS chatbot_messages (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP,
    session_id VARCHAR(255) NOT NULL REFERENCES chatbot_sessions(session_id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    message_type VARCHAR(50),
    is_processed BOOLEAN NOT NULL DEFAULT false,
    processing_time_ms INTEGER,
    token_usage INTEGER,
    model_used VARCHAR(100),
    context JSONB DEFAULT '{}',
    data_results JSONB DEFAULT '{}',
    suggestions JSONB DEFAULT '[]'
);

-- Create chatbot_suggestions table
CREATE TABLE IF NOT EXISTS chatbot_suggestions (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    text VARCHAR(500) NOT NULL,
    action VARCHAR(50),
    action_data JSONB DEFAULT '{}',
    category VARCHAR(50),
    priority INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    usage_count INTEGER NOT NULL DEFAULT 0
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chatbot_sessions_user_id ON chatbot_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_sessions_expires_at ON chatbot_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_chatbot_sessions_active ON chatbot_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_chatbot_sessions_query_type ON chatbot_sessions(query_type);

CREATE INDEX IF NOT EXISTS idx_chatbot_messages_session_id ON chatbot_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_messages_role ON chatbot_messages(role);
CREATE INDEX IF NOT EXISTS idx_chatbot_messages_created_at ON chatbot_messages(created_at);

CREATE INDEX IF NOT EXISTS idx_chatbot_suggestions_category ON chatbot_suggestions(category);
CREATE INDEX IF NOT EXISTS idx_chatbot_suggestions_active ON chatbot_suggestions(is_active);
CREATE INDEX IF NOT EXISTS idx_chatbot_suggestions_priority ON chatbot_suggestions(priority);

-- Insert some default suggestions
INSERT INTO chatbot_suggestions (text, action, category, priority, is_active) VALUES
('Find rental properties', 'search', 'property', 10, true),
('Find properties for sale', 'search', 'property', 10, true),
('Book a home service', 'search', 'service', 10, true),
('Find available workers', 'search', 'service', 10, true),
('View ongoing projects', 'search', 'project', 10, true),
('Get help with booking', 'navigate', 'general', 8, true),
('Contact support', 'navigate', 'general', 8, true),
('View my bookings', 'navigate', 'general', 8, true),
('Find 2BHK rental in Siliguri', 'search', 'property', 7, true),
('Find 3BHK rental in Siliguri', 'search', 'property', 7, true),
('Book cleaning service', 'search', 'service', 7, true),
('Book plumbing service', 'search', 'service', 7, true),
('Book electrical service', 'search', 'service', 7, true),
('Find properties under 10k', 'search', 'property', 6, true),
('Find properties under 15k', 'search', 'property', 6, true),
('Find properties under 20k', 'search', 'property', 6, true);

-- +goose Down
-- Drop tables
DROP TABLE IF EXISTS chatbot_suggestions;
DROP TABLE IF EXISTS chatbot_messages;
DROP TABLE IF EXISTS chatbot_sessions;
