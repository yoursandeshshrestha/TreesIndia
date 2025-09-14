-- +goose Up
-- Create in-app notifications table

CREATE TABLE IF NOT EXISTS in_app_notifications (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    -- Notification details
    user_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'user_registered', 'worker_application', 'broker_application',
        'booking_created', 'service_added', 'service_updated', 'service_deactivated',
        'property_created', 'project_created', 'vendor_profile_created',
        'payment_received', 'subscription_purchase', 'wallet_transaction',
        'booking_cancelled', 'worker_assigned', 'worker_started', 'worker_completed',
        'booking_confirmed', 'quote_provided', 'payment_confirmation',
        'subscription_expiry_warning', 'subscription_expired', 'conversation_started',
        'application_accepted', 'application_rejected', 'new_assignment',
        'assignment_accepted', 'assignment_rejected', 'work_started', 'work_completed',
        'worker_payment_received', 'broker_application_status', 'property_approval',
        'property_expiry_warning', 'new_service_available', 'system_maintenance',
        'feature_update', 'otp_requested', 'otp_verified', 'login_success', 'login_failed'
    )),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    
    -- Read status
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    
    -- Related entity references
    related_entity_type VARCHAR(50), -- "booking", "user", "payment", etc.
    related_entity_id BIGINT,
    
    -- Additional data for rich notifications
    data JSONB DEFAULT '{}',
    
    -- Foreign key constraints
    CONSTRAINT fk_in_app_notifications_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_in_app_notifications_user_id ON in_app_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_in_app_notifications_type ON in_app_notifications(type);
CREATE INDEX IF NOT EXISTS idx_in_app_notifications_is_read ON in_app_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_in_app_notifications_created_at ON in_app_notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_in_app_notifications_related_entity ON in_app_notifications(related_entity_type, related_entity_id);

-- Create composite index for user notifications with read status
CREATE INDEX IF NOT EXISTS idx_in_app_notifications_user_read ON in_app_notifications(user_id, is_read);

-- Create index for cleanup operations (old notifications)
CREATE INDEX IF NOT EXISTS idx_in_app_notifications_cleanup ON in_app_notifications(created_at) WHERE deleted_at IS NULL;

-- +goose Down
-- Drop in-app notifications table

DROP INDEX IF EXISTS idx_in_app_notifications_cleanup;
DROP INDEX IF EXISTS idx_in_app_notifications_user_read;
DROP INDEX IF EXISTS idx_in_app_notifications_related_entity;
DROP INDEX IF EXISTS idx_in_app_notifications_created_at;
DROP INDEX IF EXISTS idx_in_app_notifications_is_read;
DROP INDEX IF EXISTS idx_in_app_notifications_type;
DROP INDEX IF EXISTS idx_in_app_notifications_user_id;

DROP TABLE IF EXISTS in_app_notifications;
