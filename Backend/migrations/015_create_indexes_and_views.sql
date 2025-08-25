-- +goose Up
-- Create indexes and views for better performance

-- Indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Indexes for categories table
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- Indexes for subcategories table
CREATE INDEX IF NOT EXISTS idx_subcategories_parent_id ON subcategories(parent_id);
CREATE INDEX IF NOT EXISTS idx_subcategories_is_active ON subcategories(is_active);
CREATE INDEX IF NOT EXISTS idx_subcategories_slug ON subcategories(slug);

-- Indexes for services table
CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);
CREATE INDEX IF NOT EXISTS idx_services_category_id ON services(category_id);
CREATE INDEX IF NOT EXISTS idx_services_subcategory_id ON services(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_services_is_active ON services(is_active);

-- Indexes for bookings table
CREATE INDEX IF NOT EXISTS idx_bookings_booking_reference ON bookings(booking_reference);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_service_id ON bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_scheduled_date ON bookings(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_bookings_hold_expires_at ON bookings(hold_expires_at);

-- Indexes for worker_assignments table
CREATE INDEX IF NOT EXISTS idx_worker_assignments_booking_id ON worker_assignments(booking_id);
CREATE INDEX IF NOT EXISTS idx_worker_assignments_worker_id ON worker_assignments(worker_id);
CREATE INDEX IF NOT EXISTS idx_worker_assignments_assigned_by ON worker_assignments(assigned_by);
CREATE INDEX IF NOT EXISTS idx_worker_assignments_status ON worker_assignments(status);
CREATE INDEX IF NOT EXISTS idx_worker_assignments_assigned_at ON worker_assignments(assigned_at);

-- Indexes for workers table
CREATE INDEX IF NOT EXISTS idx_workers_user_id ON workers(user_id);
CREATE INDEX IF NOT EXISTS idx_workers_service_id ON workers(service_id);
CREATE INDEX IF NOT EXISTS idx_workers_is_available ON workers(is_available);
CREATE INDEX IF NOT EXISTS idx_workers_worker_type ON workers(worker_type);
CREATE INDEX IF NOT EXISTS idx_workers_police_verification_status ON workers(police_verification_status);
CREATE INDEX IF NOT EXISTS idx_workers_is_active ON workers(is_active);

-- Indexes for brokers table
CREATE INDEX IF NOT EXISTS idx_brokers_user_id ON brokers(user_id);
CREATE INDEX IF NOT EXISTS idx_brokers_license ON brokers(license);

-- Indexes for locations table
CREATE INDEX IF NOT EXISTS idx_locations_user_id ON locations(user_id);
CREATE INDEX IF NOT EXISTS idx_locations_is_active ON locations(is_active);

-- Indexes for addresses table
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_is_default ON addresses(is_default);
CREATE INDEX IF NOT EXISTS idx_addresses_city ON addresses(city);
CREATE INDEX IF NOT EXISTS idx_addresses_state ON addresses(state);

-- Indexes for user_documents table
CREATE INDEX IF NOT EXISTS idx_user_documents_user_id ON user_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_documents_status ON user_documents(status);

-- Indexes for role_applications table
CREATE INDEX IF NOT EXISTS idx_role_applications_user_id ON role_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_role_applications_status ON role_applications(status);

-- Indexes for wallet_transactions table
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_transaction_type ON wallet_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at ON wallet_transactions(created_at);

-- Indexes for admin_configs table
CREATE INDEX IF NOT EXISTS idx_admin_configs_key ON admin_configs(key);
CREATE INDEX IF NOT EXISTS idx_admin_configs_is_active ON admin_configs(is_active);

-- Properties indexes are created in the properties migration file (020)

-- +goose Down
-- Drop indexes
-- Properties indexes are dropped in the properties migration file (020)
DROP INDEX IF EXISTS idx_admin_configs_is_active;
DROP INDEX IF EXISTS idx_admin_configs_key;
DROP INDEX IF EXISTS idx_wallet_transactions_created_at;
DROP INDEX IF EXISTS idx_wallet_transactions_transaction_type;
DROP INDEX IF EXISTS idx_wallet_transactions_user_id;
DROP INDEX IF EXISTS idx_role_applications_status;
DROP INDEX IF EXISTS idx_role_applications_user_id;
DROP INDEX IF EXISTS idx_user_documents_status;
DROP INDEX IF EXISTS idx_user_documents_user_id;
DROP INDEX IF EXISTS idx_addresses_state;
DROP INDEX IF EXISTS idx_addresses_city;
DROP INDEX IF EXISTS idx_addresses_is_default;
DROP INDEX IF EXISTS idx_addresses_user_id;
DROP INDEX IF EXISTS idx_locations_is_active;
DROP INDEX IF EXISTS idx_locations_user_id;
DROP INDEX IF EXISTS idx_brokers_license;
DROP INDEX IF EXISTS idx_brokers_user_id;
DROP INDEX IF EXISTS idx_workers_is_active;
DROP INDEX IF EXISTS idx_workers_police_verification_status;
DROP INDEX IF EXISTS idx_workers_worker_type;
DROP INDEX IF EXISTS idx_workers_is_available;
DROP INDEX IF EXISTS idx_workers_service_id;
DROP INDEX IF EXISTS idx_workers_user_id;
DROP INDEX IF EXISTS idx_worker_assignments_assigned_at;
DROP INDEX IF EXISTS idx_worker_assignments_status;
DROP INDEX IF EXISTS idx_worker_assignments_assigned_by;
DROP INDEX IF EXISTS idx_worker_assignments_worker_id;
DROP INDEX IF EXISTS idx_worker_assignments_booking_id;
DROP INDEX IF EXISTS idx_bookings_hold_expires_at;
DROP INDEX IF EXISTS idx_bookings_scheduled_date;
DROP INDEX IF EXISTS idx_bookings_payment_status;
DROP INDEX IF EXISTS idx_bookings_status;
DROP INDEX IF EXISTS idx_bookings_service_id;
DROP INDEX IF EXISTS idx_bookings_user_id;
DROP INDEX IF EXISTS idx_bookings_booking_reference;
DROP INDEX IF EXISTS idx_services_is_active;
DROP INDEX IF EXISTS idx_services_subcategory_id;
DROP INDEX IF EXISTS idx_services_category_id;
DROP INDEX IF EXISTS idx_services_slug;
DROP INDEX IF EXISTS idx_subcategories_slug;
DROP INDEX IF EXISTS idx_subcategories_is_active;
DROP INDEX IF EXISTS idx_subcategories_parent_id;
DROP INDEX IF EXISTS idx_categories_slug;
DROP INDEX IF EXISTS idx_categories_is_active;
DROP INDEX IF EXISTS idx_users_is_active;
DROP INDEX IF EXISTS idx_users_user_type;
DROP INDEX IF EXISTS idx_users_phone;
DROP INDEX IF EXISTS idx_users_email;
