-- +goose Up
-- Create promotion_banners table
CREATE TABLE IF NOT EXISTS promotion_banners (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    title TEXT NOT NULL,
    image TEXT NOT NULL,
    link TEXT,
    is_active BOOLEAN DEFAULT true
);

-- Create index for active banners
CREATE INDEX IF NOT EXISTS idx_promotion_banners_active ON promotion_banners(is_active);

-- +goose Down
DROP TABLE IF EXISTS promotion_banners CASCADE;
