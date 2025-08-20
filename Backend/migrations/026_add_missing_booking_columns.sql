-- +goose Up
-- Add missing columns to bookings table to align with Booking model

-- Add booking_reference column with unique constraint
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_reference VARCHAR(255) NOT NULL DEFAULT 'BK' || EXTRACT(EPOCH FROM NOW())::BIGINT;
ALTER TABLE bookings ADD CONSTRAINT bookings_booking_reference_key UNIQUE (booking_reference);

-- Add completion_type column
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS completion_type TEXT;

-- Add scheduled_end_time column
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS scheduled_end_time TIMESTAMPTZ;

-- Add actual_start_time column
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS actual_start_time TIMESTAMPTZ;

-- Add actual_end_time column
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS actual_end_time TIMESTAMPTZ;

-- Add actual_duration_minutes column
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS actual_duration_minutes INTEGER;

-- Add address column (rename notes to address if it exists)
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS address TEXT;
UPDATE bookings SET address = notes WHERE address IS NULL AND notes IS NOT NULL;

-- Add description column
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS description TEXT;

-- Add contact_person column
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS contact_person VARCHAR(255);

-- Add contact_phone column
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(20);

-- Add special_instructions column
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS special_instructions TEXT;

-- Add payment_id column
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_id VARCHAR(255);

-- Add razorpay_order_id column
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(255);

-- Add payment_completed_at column
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_completed_at TIMESTAMPTZ;

-- Add comments for documentation
COMMENT ON COLUMN bookings.booking_reference IS 'Unique booking reference number';
COMMENT ON COLUMN bookings.completion_type IS 'How the service was completed (manual, time_expired, admin_forced)';
COMMENT ON COLUMN bookings.scheduled_end_time IS 'Expected end time of the service';
COMMENT ON COLUMN bookings.actual_start_time IS 'Actual start time when service began';
COMMENT ON COLUMN bookings.actual_end_time IS 'Actual end time when service completed';
COMMENT ON COLUMN bookings.actual_duration_minutes IS 'Actual duration of the service in minutes';
COMMENT ON COLUMN bookings.address IS 'Service delivery address';
COMMENT ON COLUMN bookings.description IS 'Description of the service request';
COMMENT ON COLUMN bookings.contact_person IS 'Contact person name';
COMMENT ON COLUMN bookings.contact_phone IS 'Contact phone number';
COMMENT ON COLUMN bookings.special_instructions IS 'Special instructions for the service';
COMMENT ON COLUMN bookings.payment_id IS 'Payment gateway payment ID';
COMMENT ON COLUMN bookings.razorpay_order_id IS 'Razorpay order ID';
COMMENT ON COLUMN bookings.payment_completed_at IS 'Timestamp when payment was completed';

-- +goose Down
-- Remove the added columns
ALTER TABLE bookings DROP COLUMN IF EXISTS booking_reference;
ALTER TABLE bookings DROP COLUMN IF EXISTS completion_type;
ALTER TABLE bookings DROP COLUMN IF EXISTS scheduled_end_time;
ALTER TABLE bookings DROP COLUMN IF EXISTS actual_start_time;
ALTER TABLE bookings DROP COLUMN IF EXISTS actual_end_time;
ALTER TABLE bookings DROP COLUMN IF EXISTS actual_duration_minutes;
ALTER TABLE bookings DROP COLUMN IF EXISTS address;
ALTER TABLE bookings DROP COLUMN IF EXISTS description;
ALTER TABLE bookings DROP COLUMN IF EXISTS contact_person;
ALTER TABLE bookings DROP COLUMN IF EXISTS contact_phone;
ALTER TABLE bookings DROP COLUMN IF EXISTS special_instructions;
ALTER TABLE bookings DROP COLUMN IF EXISTS payment_id;
ALTER TABLE bookings DROP COLUMN IF EXISTS razorpay_order_id;
ALTER TABLE bookings DROP COLUMN IF EXISTS payment_completed_at;
