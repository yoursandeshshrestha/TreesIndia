-- +goose Up
-- Add indexes and views for better performance

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

CREATE INDEX IF NOT EXISTS idx_properties_user_id ON properties(user_id);
CREATE INDEX IF NOT EXISTS idx_properties_broker_id ON properties(broker_id);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_is_approved ON properties(is_approved);
CREATE INDEX IF NOT EXISTS idx_properties_expires_at ON properties(expires_at);

CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_service_id ON bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_scheduled_date ON bookings(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);

CREATE INDEX IF NOT EXISTS idx_worker_assignments_worker_id ON worker_assignments(worker_id);
CREATE INDEX IF NOT EXISTS idx_worker_assignments_status ON worker_assignments(status);

CREATE INDEX IF NOT EXISTS idx_buffer_requests_status ON buffer_requests(status);

CREATE INDEX IF NOT EXISTS idx_time_slots_service_date ON time_slots(service_id, date);
CREATE INDEX IF NOT EXISTS idx_time_slots_available ON time_slots(available_workers) WHERE available_workers > 0;

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type ON wallet_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_status ON wallet_transactions(status);

-- Property listing view for optimized queries
CREATE OR REPLACE VIEW property_listing_view AS
SELECT 
    p.*,
    u.name as user_name,
    u.user_type,
    b.name as broker_name,
    CASE 
        WHEN p.broker_id IS NOT NULL THEN 100
        WHEN p.uploaded_by_admin = true THEN 50
        ELSE 0
    END as calculated_priority_score
FROM properties p
LEFT JOIN users u ON p.user_id = u.id
LEFT JOIN users b ON p.broker_id = b.id
WHERE p.is_approved = true 
AND p.status = 'available'
AND (p.expires_at IS NULL OR p.expires_at > NOW())
ORDER BY calculated_priority_score DESC, p.created_at DESC;

-- +goose Down
DROP VIEW IF EXISTS property_listing_view;
DROP INDEX IF EXISTS idx_wallet_transactions_status;
DROP INDEX IF EXISTS idx_wallet_transactions_type;
DROP INDEX IF EXISTS idx_wallet_transactions_user_id;
DROP INDEX IF EXISTS idx_time_slots_available;
DROP INDEX IF EXISTS idx_time_slots_service_date;
DROP INDEX IF EXISTS idx_buffer_requests_status;
DROP INDEX IF EXISTS idx_worker_assignments_status;
DROP INDEX IF EXISTS idx_worker_assignments_worker_id;
DROP INDEX IF EXISTS idx_bookings_payment_status;
DROP INDEX IF EXISTS idx_bookings_scheduled_date;
DROP INDEX IF EXISTS idx_bookings_status;
DROP INDEX IF EXISTS idx_bookings_service_id;
DROP INDEX IF EXISTS idx_bookings_user_id;
DROP INDEX IF EXISTS idx_properties_expires_at;
DROP INDEX IF EXISTS idx_properties_is_approved;
DROP INDEX IF EXISTS idx_properties_status;
DROP INDEX IF EXISTS idx_properties_broker_id;
DROP INDEX IF EXISTS idx_properties_user_id;
DROP INDEX IF EXISTS idx_users_is_active;
DROP INDEX IF EXISTS idx_users_user_type;
DROP INDEX IF EXISTS idx_users_phone;
DROP INDEX IF EXISTS idx_users_email;



