-- +goose Up
-- Create banner_images table
CREATE TABLE IF NOT EXISTS banner_images (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    title TEXT NOT NULL,
    image TEXT NOT NULL,
    link TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true
);

-- Create index for sort_order
CREATE INDEX IF NOT EXISTS idx_banner_images_sort_order ON banner_images(sort_order);

-- Create unique constraint for sort_order (max 3 images)
CREATE UNIQUE INDEX IF NOT EXISTS idx_banner_images_sort_order_unique ON banner_images(sort_order) WHERE deleted_at IS NULL;

-- +goose Down
DROP TABLE IF EXISTS banner_images CASCADE;
