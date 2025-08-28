-- +goose Up
-- Create hero_configs table
CREATE TABLE IF NOT EXISTS hero_configs (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    title TEXT NOT NULL DEFAULT 'Your Trusted Partner for All Services',
    description TEXT,
    prompt_text TEXT NOT NULL DEFAULT 'What are you looking for?',
    is_active BOOLEAN DEFAULT true
);

-- Insert default hero config
INSERT INTO hero_configs (title, description, prompt_text, is_active)
VALUES ('Your Trusted Partner for All Services', 'Connect with verified professionals for home services, construction, and marketplace needs', 'What are you looking for?', true)
ON CONFLICT DO NOTHING;

-- +goose Down
DROP TABLE IF EXISTS hero_configs CASCADE;
