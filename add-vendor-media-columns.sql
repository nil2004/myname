-- ============================================
-- Add Media and Extended Vendor Columns
-- ============================================
-- This script adds all the columns needed for vendor media uploads
-- and extended vendor information from the admin panel

-- Add all missing columns to vendors table
ALTER TABLE vendors 
-- Basic image fields
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS banner_image TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS area VARCHAR(100),

-- Portfolio fields
ADD COLUMN IF NOT EXISTS portfolio_images TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS portfolio_videos TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS portfolio_description TEXT,
ADD COLUMN IF NOT EXISTS portfolio_highlights TEXT[] DEFAULT '{}',

-- Location fields (for restaurants)
ADD COLUMN IF NOT EXISTS location_address TEXT,
ADD COLUMN IF NOT EXISTS location_lat DECIMAL(10, 8) DEFAULT 0,
ADD COLUMN IF NOT EXISTS location_lng DECIMAL(11, 8) DEFAULT 0,

-- Pricing fields
ADD COLUMN IF NOT EXISTS pricing_type VARCHAR(20) DEFAULT 'range',
ADD COLUMN IF NOT EXISTS per_plate_price INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS extra_charges INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS fixed_price INT DEFAULT 0,

-- Experience fields
ADD COLUMN IF NOT EXISTS experience_years INT DEFAULT 5,
ADD COLUMN IF NOT EXISTS events_done INT DEFAULT 0;

-- Update existing vendors with default values
UPDATE vendors SET 
  area = city,
  description = CASE 
    WHEN category = 'decorator' THEN 'Professional decoration services for all occasions'
    WHEN category = 'photographer' THEN 'Capturing your special moments beautifully'
    WHEN category = 'cake' THEN 'Custom cakes made with love'
    WHEN category = 'dj' THEN 'Professional DJ and entertainment services'
    WHEN category = 'entertainment' THEN 'Fun and engaging entertainment for all ages'
    WHEN category = 'catering' THEN 'Delicious food for your special events'
    WHEN category = 'restaurant' THEN 'Delicious dining experience for your events'
    ELSE 'Professional event services'
  END,
  portfolio_description = CASE 
    WHEN category = 'decorator' THEN 'We specialize in creating beautiful, memorable decorations for all types of events.'
    WHEN category = 'photographer' THEN 'Professional photography services capturing your special moments with creativity and precision.'
    WHEN category = 'cake' THEN 'Custom-designed cakes made with premium ingredients and artistic flair.'
    WHEN category = 'dj' THEN 'High-energy entertainment with professional sound systems and lighting.'
    WHEN category = 'entertainment' THEN 'Engaging entertainment services that make your event unforgettable.'
    WHEN category = 'catering' THEN 'Delicious catering services with a wide variety of cuisines and menu options.'
    WHEN category = 'restaurant' THEN 'Premium dining venue perfect for hosting your special celebrations.'
    ELSE 'Professional services tailored to your event needs.'
  END,
  portfolio_highlights = CASE 
    WHEN category = 'decorator' THEN ARRAY['Professional Setup', 'Theme Customization', 'Quality Materials', 'On-Time Delivery']
    WHEN category = 'photographer' THEN ARRAY['High-Quality Photos', 'Professional Editing', 'Quick Delivery', 'Candid Shots']
    WHEN category = 'cake' THEN ARRAY['Custom Designs', 'Fresh Ingredients', 'Theme Cakes', 'Timely Delivery']
    WHEN category = 'dj' THEN ARRAY['Professional Equipment', 'Wide Music Library', 'Interactive Host', 'Lighting Effects']
    WHEN category = 'entertainment' THEN ARRAY['Engaging Activities', 'Kid-Friendly', 'Professional Artists', 'Interactive Games']
    WHEN category = 'catering' THEN ARRAY['Fresh Food', 'Multiple Cuisines', 'Professional Service', 'Hygiene Standards']
    WHEN category = 'restaurant' THEN ARRAY['Spacious Venue', 'Quality Food', 'Professional Staff', 'Parking Available']
    ELSE ARRAY['Professional Service', 'Quality Work', 'Timely Delivery', 'Customer Satisfaction']
  END,
  experience_years = CASE 
    WHEN review_count > 150 THEN 10
    WHEN review_count > 100 THEN 8
    WHEN review_count > 50 THEN 5
    ELSE 3
  END,
  events_done = review_count
WHERE description IS NULL OR portfolio_description IS NULL;

-- ============================================
-- Create Supabase Storage Bucket
-- ============================================
-- Run this in Supabase SQL Editor to create the storage bucket

-- Create storage bucket for vendor media
INSERT INTO storage.buckets (id, name, public)
VALUES ('vendor-media', 'vendor-media', true)
ON CONFLICT (id) DO NOTHING;

-- Set storage policies to allow public access
CREATE POLICY IF NOT EXISTS "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'vendor-media');

CREATE POLICY IF NOT EXISTS "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'vendor-media');

CREATE POLICY IF NOT EXISTS "Authenticated users can update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'vendor-media');

CREATE POLICY IF NOT EXISTS "Authenticated users can delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'vendor-media');

-- ============================================
-- Verification Query
-- ============================================
-- Run this to verify all columns were added successfully

SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'vendors'
ORDER BY ordinal_position;

-- ============================================
-- DONE! 🎉
-- ============================================
-- Your vendors table now has:
-- ✅ Banner image support
-- ✅ Portfolio images (multiple)
-- ✅ Portfolio videos (multiple)
-- ✅ Extended descriptions and highlights
-- ✅ Location fields for restaurants
-- ✅ Flexible pricing options (range/per-plate/fixed)
-- ✅ Experience tracking
-- ✅ Storage bucket created for uploads
-- ============================================
