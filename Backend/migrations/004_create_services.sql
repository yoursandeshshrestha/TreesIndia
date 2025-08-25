-- +goose Up
-- Create services table (depends on categories and subcategories)
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
    category_id BIGINT NOT NULL,
    subcategory_id BIGINT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (subcategory_id) REFERENCES subcategories(id)
);

-- +goose Down
DROP TABLE IF EXISTS services CASCADE;



