-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS admin_roles (
    id SERIAL PRIMARY KEY,
    code VARCHAR(64) NOT NULL UNIQUE,
    label VARCHAR(128) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS user_admin_roles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    admin_role_id INTEGER NOT NULL REFERENCES admin_roles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE (user_id, admin_role_id)
);

-- Seed default admin roles
INSERT INTO admin_roles (code, label, description)
VALUES
    ('super_admin', 'Super Admin', 'Full access to all admin features and configuration'),
    ('booking_manager', 'Booking Manager', 'Manage bookings, assignments, and booking-related operations'),
    ('vendor_manager', 'Vendor Manager', 'Manage vendors, workers, and related entities'),
    ('finance_manager', 'Finance Manager', 'Manage payments, ledger, refunds, and financial operations'),
    ('support_agent', 'Support Agent', 'Support operations: view bookings, users, chats, and notifications'),
    ('content_manager', 'Content Manager', 'Manage banners, homepage content, and other marketing content'),
    ('properties_manager', 'Properties Manager', 'Manage properties, projects, and related entities')
ON CONFLICT (code) DO NOTHING;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS user_admin_roles;
DROP TABLE IF EXISTS admin_roles;
-- +goose StatementEnd


