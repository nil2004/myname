# 🗄️ SQL Migrations to Run

## You Need to Run 2 SQL Files

### Why?
Your system has 2 new features that need database tables:
1. **Gallery & Testimonials** - For Real Event Looks and Client Stories
2. **Enhanced Vendor Suggestions** - For showing 3 vendor options per category

Both need SQL migrations to create/update database tables.

## How to Run SQL in Supabase

### Step 1: Open Supabase SQL Editor
Go to: https://supabase.com/dashboard/project/uaiwuivyrdoausenvlbs/sql/new

### Step 2: Run First SQL File
1. Open file: `ADD_GALLERY_AND_TESTIMONIALS.sql`
2. Copy all content (Cmd+A, Cmd+C)
3. Paste into Supabase SQL Editor
4. Click **Run** button
5. Wait for: "✅ Gallery and Testimonials tables created successfully!"

### Step 3: Run Second SQL File
1. Click **New Query** in Supabase
2. Open file: `ADD_VENDOR_OPTIONS_COLUMN.sql`
3. Copy all content (Cmd+A, Cmd+C)
4. Paste into Supabase SQL Editor
5. Click **Run** button
6. Wait for: "✅ Enhanced columns added successfully!"

### Step 4: Restart Development Server
```bash
# In terminal:
Ctrl+C  # Stop server
npm run dev  # Start fresh
```

## What Each SQL File Does

### 1. ADD_GALLERY_AND_TESTIMONIALS.sql
Creates 2 new tables:
- ✅ `event_gallery` - Store photo galleries with multiple images
- ✅ `client_testimonials` - Store client reviews with video URLs
- ✅ Includes 2 sample gallery items
- ✅ Includes 2 sample testimonials
- ✅ Sets up security policies (RLS)
- ✅ Creates performance indexes

**Enables**:
- 🖼️ Event Gallery tab in admin panel
- 💬 Testimonials tab in admin panel
- 📸 Real Event Looks section on homepage
- ⭐ Client Stories section on homepage

### 2. ADD_VENDOR_OPTIONS_COLUMN.sql
Adds 2 new columns to existing table:
- ✅ `vendor_options` - Stores all 3 matched vendors per category
- ✅ `selected_vendor_indices` - Tracks which vendor is selected
- ✅ Creates performance index

**Enables**:
- 🎯 Show all 3 AI-matched vendors per category
- 🔄 Rearrange vendor selections in admin panel
- 📊 Better vendor matching data

## Verification

### Check if SQL Ran Successfully

Run this in Supabase SQL Editor:
```sql
-- Check if gallery tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('event_gallery', 'client_testimonials');

-- Check if vendor columns exist
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'vendor_suggestions' 
AND column_name IN ('vendor_options', 'selected_vendor_indices');

-- Check sample data
SELECT COUNT(*) as gallery_count FROM event_gallery;
SELECT COUNT(*) as testimonial_count FROM client_testimonials;
```

Expected results:
- ✅ 2 tables found (event_gallery, client_testimonials)
- ✅ 2 columns found (vendor_options, selected_vendor_indices)
- ✅ 2 gallery items
- ✅ 2 testimonials

## After Running SQL

### Test Gallery System
1. Go to: http://localhost:3000/admin
2. Click: **Event Gallery** tab
3. You should see 2 sample gallery items
4. Click: **Add New Gallery Item**
5. Test adding a new item

### Test Testimonials System
1. Stay in admin panel
2. Click: **Testimonials** tab
3. You should see 2 sample testimonials
4. Click: **Add New Testimonial**
5. Test adding a new testimonial

### Test Vendor Suggestions
1. Stay in admin panel
2. Click: **Vendor Suggestions** tab
3. Create a new suggestion
4. You should see 3 vendor options per category
5. Test selecting different vendors

### Test Homepage
1. Go to: http://localhost:3000
2. Scroll down to see:
   - **Real Event Looks** section (with 2 sample galleries)
   - **Client Stories** section (with 2 sample testimonials)
3. Both sections should display real data

## Troubleshooting

### If SQL Fails to Run:
- Check if you're connected to the right Supabase project
- Check if tables already exist (SQL uses IF NOT EXISTS)
- Check Supabase logs for specific errors
- Try running each CREATE TABLE statement separately

### If 404 Errors Persist:
1. Verify SQL ran successfully (run verification queries above)
2. Restart dev server completely (kill process and restart)
3. Clear browser cache (Cmd+Shift+R)
4. Check browser console for specific errors

### If Data Doesn't Show:
1. Check if sample data was inserted (run COUNT queries above)
2. Check RLS policies in Supabase (should allow public read)
3. Check API routes are working: http://localhost:3000/api/event-gallery
4. Check browser network tab for API responses

## Quick Reference

| File | Purpose | Creates | Sample Data |
|------|---------|---------|-------------|
| `ADD_GALLERY_AND_TESTIMONIALS.sql` | Gallery & Testimonials | 2 tables | 2 galleries, 2 testimonials |
| `ADD_VENDOR_OPTIONS_COLUMN.sql` | Enhanced Vendor Matching | 2 columns | None (updates existing) |

## Need Help?

If you're still seeing errors after running both SQL files and restarting:
1. Share the exact error message from browser console
2. Share the SQL execution result from Supabase
3. Share terminal output when starting dev server
4. Check `COMPLETE_SETUP_SUMMARY.md` for detailed documentation
