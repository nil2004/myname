-- ============================================
-- Add More Restaurants to Database
-- ============================================
-- Run this in Supabase SQL Editor to add 2 more restaurants
-- This will give you 3 total restaurants (matching the mock data)
-- ============================================

-- Restaurant 2: Royal Garden Restaurant (Premium)
INSERT INTO vendors (
  name, 
  category, 
  rating, 
  review_count, 
  price_min, 
  price_max, 
  city, 
  verified, 
  tags, 
  image_emoji,
  description,
  area,
  experience_years,
  events_done
) VALUES 
(
  'Royal Garden Restaurant',
  'restaurant',
  4.7,
  142,
  25000,
  45000,
  'Dehradun',
  true,
  ARRAY['Garden', 'Premium', 'Live Music', 'Valet Parking', 'Photography Spots'],
  '🌳',
  'Luxury dining with beautiful garden setting. Known for authentic North Indian cuisine and exceptional service for birthday parties.',
  'Saharanpur Road',
  10,
  390
)
ON CONFLICT DO NOTHING;

-- Restaurant 3: Celebration Hub (Budget-Friendly)
INSERT INTO vendors (
  name, 
  category, 
  rating, 
  review_count, 
  price_min, 
  price_max, 
  city, 
  verified, 
  tags, 
  image_emoji,
  description,
  area,
  experience_years,
  events_done
) VALUES 
(
  'Celebration Hub',
  'restaurant',
  4.3,
  95,
  15000,
  30000,
  'Dehradun',
  true,
  ARRAY['Budget Friendly', 'Family Style', 'Quick Service', 'Customizable Menu'],
  '🎊',
  'Budget-friendly party venue with great food quality. Perfect for intimate birthday celebrations with family and friends.',
  'Clock Tower',
  5,
  180
)
ON CONFLICT DO NOTHING;

-- Verify restaurants were added
SELECT 
  name, 
  category, 
  rating, 
  price_min, 
  price_max, 
  city,
  area,
  verified
FROM vendors 
WHERE category = 'restaurant'
ORDER BY price_min ASC;

-- Expected output: 3 restaurants
-- 1. Celebration Hub (₹15,000 - ₹30,000) - Budget
-- 2. Royal Garden Restaurant (₹25,000 - ₹45,000) - Premium
-- 3. Your existing restaurant

-- ============================================
-- Optional: Add Portfolio Images
-- ============================================
-- If you want to add actual images later, update like this:

-- UPDATE vendors 
-- SET 
--   banner_image = 'https://your-image-url.com/banner.jpg',
--   portfolio_images = ARRAY[
--     'https://your-image-url.com/image1.jpg',
--     'https://your-image-url.com/image2.jpg',
--     'https://your-image-url.com/image3.jpg'
--   ],
--   portfolio_description = 'Elegant banquet hall with modern amenities',
--   portfolio_highlights = ARRAY[
--     'Capacity: 50-200 guests',
--     'Complimentary parking',
--     'In-house decoration team',
--     'Multi-cuisine menu options'
--   ]
-- WHERE name = 'Royal Garden Restaurant';
