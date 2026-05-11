-- Add image columns to vendors table
ALTER TABLE vendors 
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS portfolio_images TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS area VARCHAR(100);

-- Update existing vendors with sample data
UPDATE vendors SET 
  area = city,
  description = CASE 
    WHEN category = 'decorator' THEN 'Professional decoration services for all occasions'
    WHEN category = 'photographer' THEN 'Capturing your special moments beautifully'
    WHEN category = 'cake' THEN 'Custom cakes made with love'
    WHEN category = 'dj' THEN 'Professional DJ and entertainment services'
    WHEN category = 'entertainment' THEN 'Fun and engaging entertainment for all ages'
    WHEN category = 'catering' THEN 'Delicious food for your special events'
    ELSE 'Professional event services'
  END
WHERE description IS NULL;

-- Note: You need to upload images to Supabase Storage and update image_url and portfolio_images
-- Example:
-- UPDATE vendors SET 
--   image_url = 'https://your-supabase-url.supabase.co/storage/v1/object/public/vendor-images/vendor1.jpg',
--   portfolio_images = ARRAY[
--     'https://your-supabase-url.supabase.co/storage/v1/object/public/vendor-images/vendor1-1.jpg',
--     'https://your-supabase-url.supabase.co/storage/v1/object/public/vendor-images/vendor1-2.jpg',
--     'https://your-supabase-url.supabase.co/storage/v1/object/public/vendor-images/vendor1-3.jpg'
--   ]
-- WHERE id = 'vendor-id';
