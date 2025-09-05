-- +goose Up
-- Create payment_segments table for segmented payment system

CREATE TABLE IF NOT EXISTS payment_segments (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    -- Basic Information
    booking_id BIGINT NOT NULL,
    segment_number INTEGER NOT NULL,
    
    -- Payment Details
    amount DECIMAL(10,2) NOT NULL,
    due_date TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'pending',
    
    -- Payment Reference
    payment_id BIGINT, -- Reference to actual payment when paid
    paid_at TIMESTAMPTZ,
    
    -- Additional Information
    notes TEXT,
    
    -- Foreign Keys
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payment_segments_booking_id ON payment_segments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payment_segments_status ON payment_segments(status);
CREATE INDEX IF NOT EXISTS idx_payment_segments_due_date ON payment_segments(due_date);
CREATE INDEX IF NOT EXISTS idx_payment_segments_payment_id ON payment_segments(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_segments_created_at ON payment_segments(created_at);

-- Add constraints
ALTER TABLE payment_segments ADD CONSTRAINT chk_payment_segments_status 
    CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled'));

ALTER TABLE payment_segments ADD CONSTRAINT chk_payment_segments_amount 
    CHECK (amount > 0);

ALTER TABLE payment_segments ADD CONSTRAINT chk_payment_segments_segment_number 
    CHECK (segment_number > 0);

-- Add unique constraint for booking_id + segment_number
ALTER TABLE payment_segments ADD CONSTRAINT uq_payment_segments_booking_segment 
    UNIQUE (booking_id, segment_number);

-- +goose Down
-- Drop payment_segments table
DROP TABLE IF EXISTS payment_segments CASCADE;
