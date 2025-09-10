-- +goose Up
-- Create payments table (depends on users)

CREATE TABLE IF NOT EXISTS payments (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    -- Basic Information
    payment_reference VARCHAR(50) UNIQUE NOT NULL,
    user_id BIGINT NOT NULL,
    
    -- Payment Details
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    status VARCHAR(20) DEFAULT 'pending',
    type VARCHAR(20) NOT NULL,
    method VARCHAR(20) NOT NULL,
    
    -- Related Entity
    related_entity_type VARCHAR(50),
    related_entity_id BIGINT,
    
    -- Razorpay Details
    razorpay_order_id VARCHAR(100),
    razorpay_payment_id VARCHAR(100),
    razorpay_signature TEXT,
    
    -- Payment Timing
    initiated_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    refunded_at TIMESTAMPTZ,
    
    -- Wallet-specific fields
    balance_after DECIMAL(10,2),
    
    -- Refund Information
    refund_amount DECIMAL(10,2),
    refund_reason TEXT,
    refund_method VARCHAR(20),
    
    -- Additional Information
    description TEXT,
    notes TEXT,
    metadata JSONB,
    
    -- Foreign Keys
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_type ON payments(type);
CREATE INDEX IF NOT EXISTS idx_payments_method ON payments(method);
CREATE INDEX IF NOT EXISTS idx_payments_related_entity ON payments(related_entity_type, related_entity_id);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_order_id ON payments(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_payment_id ON payments(razorpay_payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);
CREATE INDEX IF NOT EXISTS idx_payments_payment_reference ON payments(payment_reference);

-- Add constraints
ALTER TABLE payments ADD CONSTRAINT chk_payments_status 
    CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled'));

ALTER TABLE payments ADD CONSTRAINT chk_payments_type 
    CHECK (type IN ('booking', 'subscription', 'wallet_recharge', 'wallet_debit', 'refund', 'segment_pay', 'quote'));

ALTER TABLE payments ADD CONSTRAINT chk_payments_method 
    CHECK (method IN ('razorpay', 'wallet', 'cash', 'admin'));

ALTER TABLE payments ADD CONSTRAINT chk_payments_amount 
    CHECK (amount > 0);

ALTER TABLE payments ADD CONSTRAINT chk_payments_refund_amount 
    CHECK (refund_amount IS NULL OR refund_amount > 0);

-- +goose Down
-- Drop payments table
DROP TABLE IF EXISTS payments CASCADE;
