-- +goose Up
-- Migration: Create notification tables for FCM integration
-- Created: 2024-01-XX

-- Create device_tokens table
CREATE TABLE IF NOT EXISTS device_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    platform VARCHAR(20) NOT NULL CHECK (platform IN ('android', 'ios', 'web')),
    app_version VARCHAR(50),
    device_model TEXT,
    os_version TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_used_at TIMESTAMP,
    last_notification_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ,
    
    CONSTRAINT fk_device_tokens_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_device_tokens_user_id ON device_tokens(user_id);

-- Create index on token for faster lookups
CREATE INDEX IF NOT EXISTS idx_device_tokens_token ON device_tokens(token);

-- Create index on is_active for filtering active devices
CREATE INDEX IF NOT EXISTS idx_device_tokens_is_active ON device_tokens(is_active);

-- Create index on deleted_at for soft delete queries
CREATE INDEX IF NOT EXISTS idx_device_tokens_deleted_at ON device_tokens(deleted_at);

-- Create push_notifications table
CREATE TABLE IF NOT EXISTS push_notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    device_token_id BIGINT,
    type VARCHAR(50) NOT NULL CHECK (type IN ('booking', 'worker_assignment', 'payment', 'subscription', 'chat', 'promotional', 'system')),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    data JSONB,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
    fcm_response TEXT,
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    failure_reason TEXT,
    retry_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_push_notifications_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_push_notifications_device_token_id FOREIGN KEY (device_token_id) REFERENCES device_tokens(id) ON DELETE SET NULL
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_push_notifications_user_id ON push_notifications(user_id);

-- Create index on type for filtering by notification type
CREATE INDEX IF NOT EXISTS idx_push_notifications_type ON push_notifications(type);

-- Create index on status for filtering by status
CREATE INDEX IF NOT EXISTS idx_push_notifications_status ON push_notifications(status);

-- Create index on created_at for chronological ordering
CREATE INDEX IF NOT EXISTS idx_push_notifications_created_at ON push_notifications(created_at);

-- Create notification_templates table
CREATE TABLE IF NOT EXISTS notification_templates (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('booking', 'worker_assignment', 'payment', 'subscription', 'chat', 'promotional', 'system')),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    variables JSONB,
    platforms JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index on name for faster lookups
CREATE INDEX IF NOT EXISTS idx_notification_templates_name ON notification_templates(name);

-- Create index on type for filtering by template type
CREATE INDEX IF NOT EXISTS idx_notification_templates_type ON notification_templates(type);

-- Create index on is_active for filtering active templates
CREATE INDEX IF NOT EXISTS idx_notification_templates_is_active ON notification_templates(is_active);

-- Insert some default notification templates
INSERT INTO notification_templates (name, type, title, body, description, variables, platforms) VALUES
('booking_confirmation', 'booking', 'Booking Confirmed! 🎉', 'Your booking for {{service_name}} has been confirmed for {{booking_date}} at {{booking_time}}.', 'Template for booking confirmation notifications', '{"service_name": "string", "booking_date": "string", "booking_time": "string"}', '["android", "ios", "web"]'),
('worker_assigned', 'worker_assignment', 'Worker Assigned! 👷', '{{worker_name}} has been assigned to your {{service_name}} booking. They will arrive at {{estimated_time}}.', 'Template for worker assignment notifications', '{"worker_name": "string", "service_name": "string", "estimated_time": "string"}', '["android", "ios", "web"]'),
('payment_success', 'payment', 'Payment Successful! 💰', 'Your payment of ₹{{amount}} for {{service_name}} has been processed successfully.', 'Template for successful payment notifications', '{"amount": "string", "service_name": "string"}', '["android", "ios", "web"]'),
('subscription_expiry', 'subscription', 'Subscription Expiring Soon! ⏰', 'Your subscription will expire in {{days_left}} days. Renew now to continue enjoying our services.', 'Template for subscription expiry warnings', '{"days_left": "number"}', '["android", "ios", "web"]'),
('chat_message', 'chat', 'New Message 💬', '{{sender_name}} sent you a message: {{message_preview}}', 'Template for new chat message notifications', '{"sender_name": "string", "message_preview": "string"}', '["android", "ios", "web"]')
ON CONFLICT (name) DO NOTHING;

-- +goose Down
-- Drop notification tables
DROP TABLE IF EXISTS notification_templates CASCADE;
DROP TABLE IF EXISTS push_notifications CASCADE;
DROP TABLE IF EXISTS device_tokens CASCADE;
