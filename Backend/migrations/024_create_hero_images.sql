-- +goose Up
-- Create hero_images table
CREATE TABLE IF NOT EXISTS hero_images (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    image_url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    hero_config_id BIGINT NOT NULL REFERENCES hero_configs(id) ON DELETE CASCADE
);

-- Create index for hero_config_id
CREATE INDEX IF NOT EXISTS idx_hero_images_hero_config_id ON hero_images(hero_config_id);

-- +goose Down
DROP TABLE IF EXISTS hero_images CASCADE;
