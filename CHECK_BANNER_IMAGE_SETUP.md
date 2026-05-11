# Banner Image Not Showing - Troubleshooting Guide

## Step 1: Check Browser Console

Open your browser console (F12) and look for these logs:
```
VendorTierCard - vendor data: { name: "...", banner_image: "...", image_emoji: "..." }
```

**What to check:**
- Is `banner_image` null or does it have a URL?
- If it has a URL, does it look correct?
- Are there any error messages?

## Step 2: Verify Database Migration

**Did you run the migration?**

You need to run this SQL in Supabase:
```sql
-- File: add-vendor-media-columns.sql
```

To check if the column exists:
1. Go to Supabase Dashboard
2. Go to Table Editor → vendors table
3. Look for column: `banner_image`
4. If it doesn't exist, run the migration!

## Step 3: Check if Vendor Has Banner Image

In Supabase:
1. Go to Table Editor → vendors
2. Find a vendor row
3. Check the `banner_image` column
4. Does it have a URL? Or is it NULL?

**If NULL:** You need to upload an image first!

## Step 4: Upload Banner Image

1. Go to http://localhost:3000/admin
2. Click "Vendors Management"
3. Click "Edit" on a vendor
4. Scroll to "📸 Portfolio & Media"
5. Upload a banner image
6. Click "Update Vendor"
7. Check Supabase - the `banner_image` column should now have a URL

## Step 5: Verify Image URL

Copy the banner_image URL from database and paste it in your browser.
- ✅ If image loads: URL is correct
- ❌ If image doesn't load: URL is broken or file doesn't exist

## Step 6: Check Storage Bucket

1. Go to Supabase Dashboard → Storage
2. Look for bucket: `vendor-media`
3. Does it exist?
4. Is it PUBLIC?
5. Are there files in it?

**If bucket doesn't exist:** Run the migration SQL!

## Step 7: Test with Sample URL

Temporarily hardcode a test image URL in PlanForm.tsx:

```typescript
banner_image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800"
```

If this shows, then the issue is with your uploaded images.

## Common Issues

### Issue 1: Migration Not Run
**Symptom:** banner_image column doesn't exist
**Fix:** Run `add-vendor-media-columns.sql` in Supabase

### Issue 2: No Images Uploaded
**Symptom:** banner_image is NULL in database
**Fix:** Upload images via admin panel

### Issue 3: Storage Bucket Not Created
**Symptom:** Upload fails with "Bucket not found"
**Fix:** Run the storage bucket creation part of migration

### Issue 4: Images Not Public
**Symptom:** Image URLs return 403 or 404
**Fix:** Make storage bucket public in Supabase

### Issue 5: Wrong Field Name
**Symptom:** Data exists but not showing
**Fix:** Check if field is `banner_image` not `image_url`

## Quick Test

Run this in browser console on /plan page:
```javascript
// After recommendations load
console.log('Checking vendor data...');
// Look for the vendor objects in React DevTools
```

## What Should Happen

1. You upload image in admin → Saved to Supabase Storage
2. URL saved to `banner_image` column in database
3. PlanForm fetches vendors → includes `banner_image` field
4. VendorTierCard receives `banner_image` prop
5. Image displays in card header

## Debug Checklist

- [ ] Migration SQL executed in Supabase
- [ ] `banner_image` column exists in vendors table
- [ ] Storage bucket `vendor-media` exists and is public
- [ ] Image uploaded via admin panel
- [ ] `banner_image` field has URL in database
- [ ] URL is accessible (test in browser)
- [ ] Browser console shows vendor data with banner_image
- [ ] No CORS errors in console
- [ ] Image file exists in storage bucket

## Next Steps

1. Check browser console for the debug logs
2. Share what you see in the console
3. Check Supabase if banner_image column exists
4. Verify if any vendor has a banner_image URL

Let me know what you find!
