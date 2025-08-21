-- +goose Up
-- +goose StatementBegin
ALTER TABLE bookings ADD COLUMN hold_expires_at TIMESTAMP NULL;
-- +goose StatementEnd

-- +goose StatementBegin
CREATE INDEX idx_bookings_hold_expires_at ON bookings(hold_expires_at);
-- +goose StatementEnd

-- +goose StatementBegin
CREATE INDEX idx_bookings_status_hold_expires ON bookings(status, hold_expires_at);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP INDEX IF EXISTS idx_bookings_status_hold_expires;
-- +goose StatementEnd

-- +goose StatementBegin
DROP INDEX IF EXISTS idx_bookings_hold_expires_at;
-- +goose StatementEnd

-- +goose StatementBegin
ALTER TABLE bookings DROP COLUMN IF EXISTS hold_expires_at;
-- +goose StatementEnd
