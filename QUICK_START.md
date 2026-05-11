# 🚀 Quick Start - Fix 404 Error in 3 Steps

## Current Problem
Your admin panel shows 404 errors for gallery and testimonials because the database tables haven't been created yet.

## Solution (Takes 2 minutes)

### Step 1: Run SQL in Supabase (1 minute)
1. Open this file: `ADD_GALLERY_AND_TESTIMONIALS.sql`
2. Copy everything (Cmd+A, Cmd+C)
3. Go to: https://supabase.com/dashboard/project/uaiwuivyrdoausenvlbs/sql/new
4. Paste and click **Run**
5. Wait for success message ✅

### Step 2: Restart Server (30 seconds)
```bash
# In terminal, press Ctrl+C to stop
# Then run:
npm run dev
```

### Step 3: Test (30 seconds)
1. Open: http://localhost:3000/admin
2. Click **Event Gallery** tab
3. Click **Add New Gallery Item**
4. You should see the form (no more 404!)

## That's It! 🎉

Your gallery and testimonials system is now working with:
- ✅ 2 sample gallery items
- ✅ 2 sample testimonials
- ✅ Full admin panel
- ✅ Homepage integration

## What You Can Do Now
- Add your own gallery items
- Add your own testimonials
- Upload images via Media Library
- Add video URLs (YouTube/Vimeo)
- Publish/unpublish items
- Mark items as featured
- Reorder display

## Need More Details?
- Read: `FIX_404_ERROR_INSTRUCTIONS.md` - Detailed troubleshooting
- Read: `COMPLETE_SETUP_SUMMARY.md` - Full system documentation

## Still Getting Errors?
1. Check if SQL ran successfully in Supabase
2. Make sure dev server restarted completely
3. Clear browser cache (Cmd+Shift+R)
4. Check browser console for specific errors
