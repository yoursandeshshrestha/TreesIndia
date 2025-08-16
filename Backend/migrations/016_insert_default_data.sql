-- +goose Up
-- Insert default admin configurations and seed data

-- Insert default admin configurations
INSERT INTO admin_configs (key, value, type, category, description) VALUES
('max_normal_user_properties', '0', 'int', 'system', 'Maximum properties per normal user (0 = unlimited)'),
('max_broker_properties_without_subscription', '1', 'int', 'system', 'Maximum properties broker can post without subscription'),
('broker_property_priority', 'true', 'bool', 'system', 'Broker properties get priority listing'),
('razorpay_key_id', 'rzp_test_R5AUjoyz0QoYmH', 'string', 'payment', 'Razorpay Key ID'),
('razorpay_secret_key', 'gtpRKsGGGD7ofEXWvaoKRfB4', 'string', 'payment', 'Razorpay Secret Key'),
('razorpay_webhook_secret', '', 'string', 'payment', 'Razorpay Webhook Secret'),
('default_wallet_limit', '100000', 'float', 'wallet', 'Default wallet limit in INR'),
('min_recharge_amount', '100', 'float', 'wallet', 'Minimum recharge amount'),
('max_recharge_amount', '50000', 'float', 'wallet', 'Maximum single recharge amount'),
('property_expiry_days', '30', 'int', 'property', 'Days until property listing expires'),
('auto_approve_broker_properties', 'true', 'bool', 'property', 'Auto-approve broker property listings'),
('require_property_approval', 'true', 'bool', 'property', 'Require admin approval for normal user properties'),
('max_property_images', '5', 'int', 'system', 'Maximum images per property')
ON CONFLICT (key) DO NOTHING;

-- Insert default subscription plans
INSERT INTO subscription_plans (name, duration, price, is_active, description) VALUES
('Monthly Broker', 'monthly', 999.00, true, 'Monthly subscription for brokers with priority listing'),
('Yearly Broker', 'yearly', 9999.00, true, 'Yearly subscription for brokers with priority listing and discounts'),
('One-time Broker', 'one_time', 2999.00, true, 'One-time payment for broker verification and priority listing')
ON CONFLICT DO NOTHING;

-- Insert default categories
INSERT INTO categories (name, description, icon, is_active) VALUES
('Property Services', 'Real estate and property related services', 'home', true),
('Maintenance', 'Property maintenance and repair services', 'wrench', true),
('Cleaning', 'Cleaning and housekeeping services', 'sparkles', true),
('Security', 'Security and safety services', 'shield', true)
ON CONFLICT DO NOTHING;

-- +goose Down
-- Remove default data (in reverse order)
DELETE FROM categories WHERE name IN ('Property Services', 'Maintenance', 'Cleaning', 'Security');
DELETE FROM subscription_plans WHERE name IN ('Monthly Broker', 'Yearly Broker', 'One-time Broker');
DELETE FROM admin_configs WHERE key IN (
    'max_normal_user_properties',
    'max_broker_properties_without_subscription',
    'broker_property_priority',
    'razorpay_key_id',
    'razorpay_secret_key',
    'razorpay_webhook_secret',
    'default_wallet_limit',
    'min_recharge_amount',
    'max_recharge_amount',
    'property_expiry_days',
    'auto_approve_broker_properties',
    'require_property_approval',
    'max_property_images'
);



