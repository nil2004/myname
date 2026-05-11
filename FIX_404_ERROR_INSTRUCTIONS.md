# Fix 404 Error - Gallery & Testimonials Setup

## Current Issue
The API routes `/api/event-gallery` and `/api/testimonials` are returning 404 errors because:
1. ❌ Database tables haven't been created yet
2. ❌ Development server needs to be restarted

## Solution - Follow These Steps Exactly

### Step 1: Run SQL Migration in Supabase
1. Open Supabase Dashboard: https://supabase.com/dashboard/project/uaiwuivyrdoausenvlbs
2. Go to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy the entire content from `ADD_GALLERY_AND_TESTIMONIALS.sql`
5. Paste it into the SQL Editor
6. Click **Run** button
7. Wait for success message: "✅ Gallery and Testimonials tables created successfully!"

### Step 2: Restart Development Server
1. In your terminal, press `Ctrl + C` to stop the current server
2. Run: `npm run dev`
3. Wait for "Ready" message
4. Open browser: http://localhost:3000

### Step 3: Verify Admin Panel
1. Go to: http://localhost:3000/admin
2. You should see new tabs:
   - **Event Gallery** - Manage photo galleries
   - **Testimonials** - Manage client reviews
3. Try adding a new gallery item or testimonial

### Step 4: Check Homepage
1. Go to: http://localhost:3000
2. Scroll down to see:
   - **Real Event Looks** section (with sample gallery photos)
   - **Client Stories** section (with sample testimonials)

## What Was Created

### Database Tables
- ✅ `event_gallery` - Store photo galleries with multiple images
- ✅ `client_testimonials` - Store reviews with video URLs

### API Routes
- ✅ `/api/event-gallery` - GET, POST, PUT, DELETE gallery items
- ✅ `/api/testimonials` - GET, POST, PUT, DELETE testimonials

### Admin Components
- ✅ `EventGalleryManager.tsx` - Manage galleries
- ✅ `TestimonialsManager.tsx` - Manage testimonials
- ✅ `MediaLibrary.tsx` - Select images from library

### Homepage Components (Updated)
- ✅ `VendorGallery.tsx` - Shows real gallery data (hides if empty)
- ✅ `Testimonials.tsx` - Shows real testimonials (hides if empty)
- ✅ `ExperienceStories.tsx` - Shows video testimonials (hides if empty)

## Sample Data Included
The SQL migration includes 2 sample gallery items and 2 sample testimonials so you can see how it works immediately.

## Troubleshooting

### If 404 error persists:
1. Check if SQL ran successfully in Supabase
2. Verify tables exist: Run in SQL Editor:
   ```sql
   SELECT * FROM event_gallery LIMIT 5;
   SELECT * FROM client_testimonials LIMIT 5;
   ```
3. Restart dev server completely (kill process and restart)
4. Clear browser cache and reload

### If images don't load:
- The sample images use Unsplash URLs
- They should load automatically
- You can replace with your own URLs in admin panel

### If admin panel doesn't show new tabs:
- Check browser console for errors
- Verify `src/app/admin/page.tsx` has the new tabs
- Clear Next.js cache: Delete `.next` folder and restart

## Next Steps After Setup
1. ✅ Run SQL migration
2. ✅ Restart server
3. ✅ Test admin panel
4. ✅ Add your own gallery items
5. ✅ Add your own testimonials
6. ✅ Upload real images via Media Library
7. ✅ Add real video URLs (YouTube/Vimeo)

## Need Help?
If you still see errors after following these steps, share:
1. The exact error message from browser console
2. Screenshot of Supabase SQL Editor after running migration
3. Terminal output when starting dev server
