-- +goose Up
-- Chat Communication System for Supabase

-- Create chat rooms table
CREATE TABLE IF NOT EXISTS chat_rooms (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    -- Room identification
    room_type TEXT NOT NULL CHECK (room_type IN ('booking', 'property', 'worker_inquiry')),
    room_name TEXT,
    
    -- Associated entities
    booking_id BIGINT REFERENCES bookings(id),
    property_id BIGINT REFERENCES properties(id),
    worker_inquiry_id BIGINT REFERENCES worker_inquiries(id),
    
    -- Room status
    is_active BOOLEAN DEFAULT true,
    last_message_at TIMESTAMPTZ,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create chat room participants table
CREATE TABLE IF NOT EXISTS chat_room_participants (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    -- Room and user relationship
    room_id BIGINT NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Participant status
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    left_at TIMESTAMPTZ,
    last_read_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    
    -- Participant role (user, worker, admin)
    role TEXT DEFAULT 'participant' CHECK (role IN ('user', 'worker', 'admin')),
    
    -- Unique constraint to prevent duplicate participants
    UNIQUE(room_id, user_id)
);

-- Create chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    -- Message content
    room_id BIGINT NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'location', 'system')),
    
    -- Message metadata
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    read_by JSONB DEFAULT '[]'::jsonb, -- Array of user IDs who read the message
    
    -- Message attachments (for images, files)
    attachments JSONB DEFAULT '[]'::jsonb, -- Array of attachment URLs
    
    -- Message status
    status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
    
    -- Reply to another message
    reply_to_message_id BIGINT REFERENCES chat_messages(id),
    
    -- Message metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create call sessions table for Twilio integration
CREATE TABLE IF NOT EXISTS call_sessions (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    -- Call participants
    from_user_id BIGINT NOT NULL REFERENCES users(id),
    to_user_id BIGINT NOT NULL REFERENCES users(id),
    
    -- Twilio call details
    twilio_call_sid TEXT UNIQUE,
    twilio_from_number TEXT,
    twilio_to_number TEXT,
    masked_number TEXT NOT NULL, -- The number shown to users
    
    -- Call details
    call_type TEXT DEFAULT 'voice' CHECK (call_type IN ('voice', 'video')),
    status TEXT DEFAULT 'initiated' CHECK (status IN ('initiated', 'ringing', 'connected', 'ended', 'missed', 'failed')),
    
    -- Call timing
    started_at TIMESTAMPTZ,
    answered_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    duration_seconds INTEGER,
    
    -- Associated entities
    booking_id BIGINT REFERENCES bookings(id),
    property_id BIGINT REFERENCES properties(id),
    room_id BIGINT REFERENCES chat_rooms(id),
    
    -- Call metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create worker location tracking table
CREATE TABLE IF NOT EXISTS worker_locations (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    -- Worker and booking
    worker_id BIGINT NOT NULL REFERENCES users(id),
    booking_id BIGINT NOT NULL REFERENCES bookings(id),
    
    -- Location data
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    accuracy_meters INTEGER,
    altitude DECIMAL(10, 2),
    heading DECIMAL(5, 2), -- Direction in degrees
    
    -- Status and timing
    status TEXT DEFAULT 'on_way' CHECK (status IN ('on_way', 'arrived', 'working', 'completed', 'offline')),
    estimated_arrival TIMESTAMPTZ,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    
    -- Location metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_rooms_booking_id ON chat_rooms(booking_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_property_id ON chat_rooms(property_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_worker_inquiry_id ON chat_rooms(worker_inquiry_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_last_message_at ON chat_rooms(last_message_at);

CREATE INDEX IF NOT EXISTS idx_chat_room_participants_room_id ON chat_room_participants(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_room_participants_user_id ON chat_room_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_room_participants_last_read_at ON chat_room_participants(last_read_at);

CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_reply_to ON chat_messages(reply_to_message_id);

CREATE INDEX IF NOT EXISTS idx_call_sessions_from_user_id ON call_sessions(from_user_id);
CREATE INDEX IF NOT EXISTS idx_call_sessions_to_user_id ON call_sessions(to_user_id);
CREATE INDEX IF NOT EXISTS idx_call_sessions_twilio_sid ON call_sessions(twilio_call_sid);
CREATE INDEX IF NOT EXISTS idx_call_sessions_booking_id ON call_sessions(booking_id);

CREATE INDEX IF NOT EXISTS idx_worker_locations_worker_id ON worker_locations(worker_id);
CREATE INDEX IF NOT EXISTS idx_worker_locations_booking_id ON worker_locations(booking_id);
CREATE INDEX IF NOT EXISTS idx_worker_locations_last_updated ON worker_locations(last_updated);

-- Note: GORM handles updated_at automatically, no triggers needed

-- +goose Down

DROP INDEX IF EXISTS idx_worker_locations_last_updated;
DROP INDEX IF EXISTS idx_worker_locations_booking_id;
DROP INDEX IF EXISTS idx_worker_locations_worker_id;
DROP INDEX IF EXISTS idx_call_sessions_booking_id;
DROP INDEX IF EXISTS idx_call_sessions_twilio_sid;
DROP INDEX IF EXISTS idx_call_sessions_to_user_id;
DROP INDEX IF EXISTS idx_call_sessions_from_user_id;
DROP INDEX IF EXISTS idx_chat_messages_reply_to;
DROP INDEX IF EXISTS idx_chat_messages_created_at;
DROP INDEX IF EXISTS idx_chat_messages_sender_id;
DROP INDEX IF EXISTS idx_chat_messages_room_id;
DROP INDEX IF EXISTS idx_chat_room_participants_last_read_at;
DROP INDEX IF EXISTS idx_chat_room_participants_user_id;
DROP INDEX IF EXISTS idx_chat_room_participants_room_id;
DROP INDEX IF EXISTS idx_chat_rooms_last_message_at;
DROP INDEX IF EXISTS idx_chat_rooms_worker_inquiry_id;
DROP INDEX IF EXISTS idx_chat_rooms_property_id;
DROP INDEX IF EXISTS idx_chat_rooms_booking_id;

DROP TABLE IF EXISTS worker_locations CASCADE;
DROP TABLE IF EXISTS call_sessions CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS chat_room_participants CASCADE;
DROP TABLE IF EXISTS chat_rooms CASCADE;
