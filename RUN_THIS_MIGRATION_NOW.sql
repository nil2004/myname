-- ============================================
-- CRITICAL: RUN THIS IN SUPABASE SQL EDITOR NOW!
-- ============================================
-- This adds the banner_image column to vendors table
-- Without this, banner images CANNOT work!

-- Add banner_image column if it doesn't exist
ALTER TABLE vendors 
ADD COLUMN IF NOT EXISTS banner_image TEXT;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'vendors' 
AND column_name = 'banner_image';

-- If you see a result, the column exists! ✅
-- If no result, something went wrong ❌
