-- +goose Up
-- Create services table (depends on categories and subcategories)
CREATE TABLE IF NOT EXISTS services (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL NOT NULL,
    category_id BIGINT,
    subcategory_id BIGINT,
    is_active BOOLEAN DEFAULT true,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (subcategory_id) REFERENCES subcategories(id)
);

-- +goose Down
DROP TABLE IF EXISTS services CASCADE;



