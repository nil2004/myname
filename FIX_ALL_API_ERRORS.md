# Fix All API Errors - Complete Guide

## 🔴 Current Errors

1. ❌ GET `/api/budget-allocation` - 404 (Not Found)
2. ❌ GET `/api/vendors` - 500 (Internal Server Error)
3. ❌ POST `/api/requests` - 500 (Internal Server Error)
4. ❌ GET `/api/vendors/[id]` - 500 (Internal Server Error)

## ✅ Root Cause

**YOU HAVEN'T RUN THE DATABASE MIGRATION YET!**

The API errors are happening because the database columns don't exist.

## 🚨 CRITICAL: Run This SQL NOW

### Step 1: Open Supabase Dashboard
Go to: https://uaiwuivyrdoausenvlbs.supabase.co

### Step 2: Go to SQL Editor
Click "SQL Editor" in the left sidebar

### Step 3: Run This Complete Migration

```sql
-- ============================================
-- COMPLETE DATABASE MIGRATION
-- Run this ENTIRE script in Supabase SQL Editor
-- ============================================

-- Add all missing columns to vendors table
ALTER TABLE vendors 
ADD COLUMN IF NOT EXISTS banner_image TEXT,
ADD COLUMN IF NOT EXISTS portfolio_images TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS portfolio_videos TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS portfolio_description TEXT,
ADD COLUMN IF NOT EXISTS portfolio_highlights TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS location_address TEXT,
ADD COLUMN IF NOT EXISTS location_lat DECIMAL(10, 8) DEFAULT 0,
ADD COLUMN IF NOT EXISTS location_lng DECIMAL(11, 8) DEFAULT 0,
ADD COLUMN IF NOT EXISTS pricing_type VARCHAR(20) DEFAULT 'range',
ADD COLUMN IF NOT EXISTS per_plate_price INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS extra_charges INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS fixed_price INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS experience_years INT DEFAULT 5,
ADD COLUMN IF NOT EXISTS events_done INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS area VARCHAR(100),
ADD COLUMN IF NOT EXISTS description TEXT;

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

-- Create storage bucket for vendor media
INSERT INTO storage.buckets (id, name, public)
VALUES ('vendor-media', 'vendor-media', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;

-- Set storage policies
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'vendor-media');

CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'vendor-media');

CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'vendor-media');

CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'vendor-media');

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'vendors' 
AND column_name IN ('banner_image', 'portfolio_images', 'portfolio_videos', 'experience_years', 'events_done')
ORDER BY column_name;

-- If you see 5 rows, SUCCESS! ✅
-- If you see fewer rows, some columns failed to create ❌
```

### Step 4: Click "Run" or Press Ctrl+Enter

### Step 5: Verify Success
You should see a result showing 5 columns:
- banner_image
- events_done
- experience_years
- portfolio_images
- portfolio_videos

## 🔧 After Running Migration

### Restart Your Dev Server
```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

### Test the APIs
1. Go to http://localhost:3000/plan
2. Fill the form
3. Click "Get AI Recommendations"
4. Should work without errors!

## 📋 What Each Error Means

### 1. `/api/budget-allocation` - 404
**Cause:** This API endpoint doesn't exist
**Fix:** It's optional - the app works without it
**Status:** Can be ignored for now

### 2. `/api/vendors` - 500
**Cause:** Database columns missing (banner_image, portfolio_images, etc.)
**Fix:** Run the migration SQL above
**Status:** CRITICAL - Must fix

### 3. `/api/requests` - 500
**Cause:** Requests table might not exist or columns missing
**Fix:** Run the complete schema (supabase-complete-schema.sql)
**Status:** Important for saving customer requests

### 4. `/api/vendors/[id]` - 500
**Cause:** Same as #2 - missing columns
**Fix:** Run the migration SQL above
**Status:** CRITICAL - Must fix

## 🎯 Quick Fix Checklist

- [ ] Open Supabase Dashboard
- [ ] Go to SQL Editor
- [ ] Copy the migration SQL above
- [ ] Paste and run it
- [ ] Verify 5 columns appear in results
- [ ] Restart dev server (npm run dev)
- [ ] Test /plan page
- [ ] Verify no more 500 errors

## 🚨 If Still Getting Errors

### Check Supabase Connection
```typescript
// In .env.local
NEXT_PUBLIC_SUPABASE_URL=https://uaiwuivyrdoausenvlbs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Check Browser Console
Look for specific error messages

### Check Server Logs
Look at terminal where `npm run dev` is running

### Check Supabase Logs
Go to Supabase Dashboard → Logs

## 💡 Why This Happens

The app code expects certain database columns to exist:
- `banner_image`
- `portfolio_images`
- `portfolio_videos`
- `experience_years`
- `events_done`
- etc.

But these columns don't exist in your database yet because you haven't run the migration!

## ✅ After Fix

Once you run the migration:
- ✅ Vendors API will work
- ✅ Portfolio modal will work
- ✅ Banner images will display
- ✅ No more 500 errors
- ✅ App fully functional

## 🎉 Success Indicators

You'll know it worked when:
1. No 500 errors in browser console
2. Vendor cards display properly
3. "View Portfolio" button works
4. Banner images show (if uploaded)
5. All vendor data displays correctly

---

**IMPORTANT: Run the migration SQL NOW before doing anything else!**
