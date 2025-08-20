-- +goose Up
-- Add inquiry booking fee configuration

INSERT INTO admin_configs (key, value, type, category, description, is_active, created_at, updated_at) 
VALUES (
    'inquiry_booking_fee',
    '100',
    'int',
    'payment',
    'Fee amount (in INR) required to submit an inquiry-based booking. Set to 0 for no fee.',
    true,
    NOW(),
    NOW()
) ON CONFLICT (key) DO NOTHING;

-- +goose Down
-- Remove inquiry booking fee configuration

DELETE FROM admin_configs WHERE key = 'inquiry_booking_fee';
