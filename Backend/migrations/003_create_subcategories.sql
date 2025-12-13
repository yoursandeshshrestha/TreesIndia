-- +goose Up
-- This migration is now obsolete - categories and subcategories are unified
-- Categories table now supports hierarchical structure with parent_id
-- This file is kept for migration history but does nothing

-- +goose Down
-- No-op: subcategories table no longer exists



