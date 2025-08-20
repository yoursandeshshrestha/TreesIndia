-- +goose Up
-- Align database schema with Go models

-- 1. Update categories table: rename icon to image and add slug
ALTER TABLE categories RENAME COLUMN icon TO image;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS slug VARCHAR(255) UNIQUE;

-- 2. Update subcategories table: rename icon to image and add slug
ALTER TABLE subcategories RENAME COLUMN icon TO image;
ALTER TABLE subcategories ADD COLUMN IF NOT EXISTS slug VARCHAR(255) UNIQUE;

-- 3. Update services table: add missing columns to match Service model
ALTER TABLE services ADD COLUMN IF NOT EXISTS slug VARCHAR(255) UNIQUE NOT NULL DEFAULT '';
ALTER TABLE services ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';
ALTER TABLE services ADD COLUMN IF NOT EXISTS price_type VARCHAR(20) DEFAULT 'inquiry' CHECK (price_type IN ('fixed', 'inquiry'));
ALTER TABLE services ADD COLUMN IF NOT EXISTS duration VARCHAR(100);

-- 4. Update services table: make price nullable (since inquiry-based services don't have fixed price)
ALTER TABLE services ALTER COLUMN price DROP NOT NULL;

-- 5. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);
CREATE INDEX IF NOT EXISTS idx_services_price_type ON services(price_type);
CREATE INDEX IF NOT EXISTS idx_services_category_id ON services(category_id);
CREATE INDEX IF NOT EXISTS idx_services_subcategory_id ON services(subcategory_id);

-- 6. Add missing columns to workers table
ALTER TABLE workers ADD COLUMN IF NOT EXISTS earnings DECIMAL DEFAULT 0;
ALTER TABLE workers ADD COLUMN IF NOT EXISTS total_jobs INTEGER DEFAULT 0;
ALTER TABLE workers ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 7. Add indexes for categories and subcategories
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_subcategories_name ON subcategories(name);
CREATE INDEX IF NOT EXISTS idx_subcategories_slug ON subcategories(slug);
CREATE INDEX IF NOT EXISTS idx_subcategories_parent_id ON subcategories(parent_id);

-- +goose Down
-- Revert changes

-- Remove indexes
DROP INDEX IF EXISTS idx_services_slug;
DROP INDEX IF EXISTS idx_services_price_type;
DROP INDEX IF EXISTS idx_services_category_id;
DROP INDEX IF EXISTS idx_services_subcategory_id;
DROP INDEX IF EXISTS idx_categories_name;
DROP INDEX IF EXISTS idx_subcategories_name;
DROP INDEX IF EXISTS idx_subcategories_parent_id;

-- Remove columns from workers table
ALTER TABLE workers DROP COLUMN IF EXISTS earnings;
ALTER TABLE workers DROP COLUMN IF EXISTS total_jobs;
ALTER TABLE workers DROP COLUMN IF EXISTS is_active;

-- Remove columns from services table
ALTER TABLE services DROP COLUMN IF EXISTS slug;
ALTER TABLE services DROP COLUMN IF EXISTS images;
ALTER TABLE services DROP COLUMN IF EXISTS price_type;
ALTER TABLE services DROP COLUMN IF EXISTS duration;

-- Make price NOT NULL again
ALTER TABLE services ALTER COLUMN price SET NOT NULL;

-- Remove slug columns
ALTER TABLE categories DROP COLUMN IF EXISTS slug;
ALTER TABLE subcategories DROP COLUMN IF EXISTS slug;

-- Rename image back to icon
ALTER TABLE categories RENAME COLUMN image TO icon;
ALTER TABLE subcategories RENAME COLUMN image TO icon;
