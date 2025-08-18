-- +goose Up
-- Fix service price constraint to allow NULL for inquiry-based services
ALTER TABLE services ALTER COLUMN price DROP NOT NULL;

-- Add price_type column (will fail if already exists, but that's okay)
ALTER TABLE services ADD COLUMN IF NOT EXISTS price_type TEXT DEFAULT 'inquiry';

-- Add check constraint for price validation
ALTER TABLE services ADD CONSTRAINT check_price_for_fixed_type 
    CHECK (
        (price_type = 'fixed' AND price IS NOT NULL) OR 
        (price_type = 'inquiry' AND price IS NULL) OR
        (price_type IS NULL)
    );

-- +goose Down
-- Remove the check constraint
ALTER TABLE services DROP CONSTRAINT IF EXISTS check_price_for_fixed_type;

-- Make price NOT NULL again (this will fail if there are NULL values)
-- ALTER TABLE services ALTER COLUMN price SET NOT NULL;
