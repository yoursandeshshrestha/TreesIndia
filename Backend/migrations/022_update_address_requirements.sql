-- +goose Up
-- Update addresses table to make postal_code required and name optional

-- First, update any existing records to ensure data integrity
UPDATE addresses SET postal_code = '000000' WHERE postal_code IS NULL OR postal_code = '';

-- Make postal_code NOT NULL
ALTER TABLE addresses ALTER COLUMN postal_code SET NOT NULL;

-- Make name nullable (optional)
ALTER TABLE addresses ALTER COLUMN name DROP NOT NULL;

-- +goose Down
-- Revert the changes

-- Make name NOT NULL again
ALTER TABLE addresses ALTER COLUMN name SET NOT NULL;

-- Make postal_code nullable again
ALTER TABLE addresses ALTER COLUMN postal_code DROP NOT NULL;
