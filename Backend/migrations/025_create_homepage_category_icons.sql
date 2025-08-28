-- +goose Up
-- Create homepage_category_icons table
CREATE TABLE IF NOT EXISTS homepage_category_icons (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    name TEXT NOT NULL UNIQUE,
    icon_url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true
);

-- Create index for active status
CREATE INDEX IF NOT EXISTS idx_homepage_category_icons_active ON homepage_category_icons(is_active);

-- Insert the 3 fixed category icons
INSERT INTO homepage_category_icons (name, icon_url, is_active) VALUES
('Home Service', '', true),
('Construction Service', '', true),
('Marketplace', '', true)
ON CONFLICT (name) DO NOTHING;

-- +goose Down
DROP TABLE IF EXISTS homepage_category_icons CASCADE;
