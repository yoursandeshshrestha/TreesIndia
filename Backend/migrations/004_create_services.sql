-- +goose Up
-- Create services table (depends on categories)
-- Services now reference a single category_id (typically Level 3, the deepest level)
CREATE TABLE IF NOT EXISTS services (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    images TEXT[],
    price_type TEXT NOT NULL DEFAULT 'inquiry',
    price DECIMAL,
    duration TEXT,
    category_id BIGINT NOT NULL, -- References categories.id (typically Level 3)
    is_active BOOLEAN DEFAULT true,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- +goose Down
DROP TABLE IF EXISTS services CASCADE;



