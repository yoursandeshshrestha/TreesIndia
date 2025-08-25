-- +goose Up
-- Create worker inquiries table (depends on users and services)

CREATE TABLE IF NOT EXISTS worker_inquiries (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    user_id BIGINT NOT NULL,
    service_id BIGINT NOT NULL,
    inquiry_type TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    response TEXT,
    responded_by BIGINT,
    responded_at TIMESTAMPTZ,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (service_id) REFERENCES services(id),
    FOREIGN KEY (responded_by) REFERENCES users(id)
);

-- +goose Down
DROP TABLE IF EXISTS worker_inquiries CASCADE;
