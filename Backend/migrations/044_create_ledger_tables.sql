-- +goose Up
-- Create ledger tables for financial tracking

-- Cash/Bank Balance table (single record)
CREATE TABLE IF NOT EXISTS cash_bank_balances (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    -- Balance Details
    cash_in_hand DECIMAL(10,2) DEFAULT 0,
    bank_balance DECIMAL(10,2) DEFAULT 0,
    
    -- Track changes
    last_transaction_amount DECIMAL(10,2) DEFAULT 0,
    last_transaction_type VARCHAR(50),
    last_transaction_source VARCHAR(10),
    
    -- Additional Info
    last_updated_by BIGINT NOT NULL,
    notes TEXT,
    
    -- Foreign Keys
    FOREIGN KEY (last_updated_by) REFERENCES users(id)
);

-- Ledger Entries table
CREATE TABLE IF NOT EXISTS ledger_entries (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    -- Entry Details
    entry_type VARCHAR(20) NOT NULL, -- 'pay' or 'receive'
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Financial Details
    amount_to_be_paid DECIMAL(10,2),
    amount_to_receive DECIMAL(10,2),
    amount_paid DECIMAL(10,2),
    amount_received DECIMAL(10,2),
    
    -- Payment Source
    payment_source VARCHAR(10), -- 'cash' or 'bank'
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending',
    
    -- Additional Info
    notes TEXT,
    created_by BIGINT NOT NULL,
    updated_by BIGINT,
    
    -- Foreign Keys
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ledger_entries_entry_type ON ledger_entries(entry_type);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_status ON ledger_entries(status);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_created_by ON ledger_entries(created_by);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_created_at ON ledger_entries(created_at);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_name ON ledger_entries(name);

-- Insert initial cash/bank balance record
-- Use the first admin user or create with a default user ID
INSERT INTO cash_bank_balances (cash_in_hand, bank_balance, last_updated_by, notes) 
SELECT 0, 0, id, 'Initial balance record'
FROM users 
WHERE user_type = 'admin' 
LIMIT 1
ON CONFLICT DO NOTHING;

-- +goose Down
-- Drop ledger tables

DROP INDEX IF EXISTS idx_ledger_entries_name;
DROP INDEX IF EXISTS idx_ledger_entries_created_at;
DROP INDEX IF EXISTS idx_ledger_entries_created_by;
DROP INDEX IF EXISTS idx_ledger_entries_status;
DROP INDEX IF EXISTS idx_ledger_entries_entry_type;

DROP TABLE IF EXISTS ledger_entries;
DROP TABLE IF EXISTS cash_bank_balances;
