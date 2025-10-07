-- +goose Up
-- Add media_url and media_type columns to hero_images table
ALTER TABLE hero_images 
ADD COLUMN IF NOT EXISTS media_url TEXT,
ADD COLUMN IF NOT EXISTS media_type VARCHAR(20) DEFAULT 'image';

-- Update existing rows to use image_url as media_url
UPDATE hero_images SET media_url = image_url WHERE media_url IS NULL OR media_url = '';

-- Make media_url NOT NULL after populating existing data
ALTER TABLE hero_images ALTER COLUMN media_url SET NOT NULL;

-- Create index for media_type for faster filtering
CREATE INDEX IF NOT EXISTS idx_hero_images_media_type ON hero_images(media_type);

-- +goose Down
-- Remove the added columns
DROP INDEX IF EXISTS idx_hero_images_media_type;
ALTER TABLE hero_images DROP COLUMN IF EXISTS media_type;
ALTER TABLE hero_images DROP COLUMN IF EXISTS media_url;

