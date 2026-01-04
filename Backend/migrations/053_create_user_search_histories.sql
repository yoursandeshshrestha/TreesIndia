-- +goose Up
-- Create user_search_histories table (depends on users)

CREATE TABLE IF NOT EXISTS user_search_histories (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,

    -- User relationship
    user_id BIGINT NOT NULL,

    -- Location data
    place_id TEXT NOT NULL,
    description TEXT NOT NULL,
    formatted_address TEXT,
    city TEXT,
    state TEXT,
    country TEXT,
    country_code TEXT,
    postcode TEXT,
    latitude DECIMAL(10, 8) NOT NULL DEFAULT 0,
    longitude DECIMAL(11, 8) NOT NULL DEFAULT 0,
    address_line1 TEXT,
    address_line2 TEXT,

    -- Search timestamp
    searched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Foreign Keys
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_search_histories_user_id ON user_search_histories(user_id);
CREATE INDEX IF NOT EXISTS idx_user_search_histories_searched_at ON user_search_histories(searched_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_search_histories_user_place ON user_search_histories(user_id, place_id);
CREATE INDEX IF NOT EXISTS idx_user_search_histories_deleted_at ON user_search_histories(deleted_at);

-- Add comment
COMMENT ON TABLE user_search_histories IS 'Stores user location search history for quick access to recent searches';

-- +goose Down
-- Drop user_search_histories table
DROP TABLE IF EXISTS user_search_histories CASCADE;
