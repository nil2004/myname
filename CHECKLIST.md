# ✅ Setup Checklist - Gallery & Testimonials

## Current Status: ⚠️ Needs Setup

Follow this checklist to fix the 404 errors and get everything working.

---

## 📋 Setup Steps

### 1. Database Setup
- [ ] Open Supabase SQL Editor: https://supabase.com/dashboard/project/uaiwuivyrdoausenvlbs/sql/new
- [ ] Run `ADD_GALLERY_AND_TESTIMONIALS.sql`
  - [ ] Copy file content
  - [ ] Paste in SQL Editor
  - [ ] Click Run
  - [ ] See success message: "✅ Gallery and Testimonials tables created successfully!"
- [ ] Click "New Query" in Supabase
- [ ] Run `ADD_VENDOR_OPTIONS_COLUMN.sql`
  - [ ] Copy file content
  - [ ] Paste in SQL Editor
  - [ ] Click Run
  - [ ] See success message: "✅ Enhanced columns added successfully!"

### 2. Server Restart
- [ ] Stop development server (Ctrl+C in terminal)
- [ ] Start fresh: `npm run dev`
- [ ] Wait for "Ready" message
- [ ] Server running on http://localhost:3000

### 3. Test Admin Panel
- [ ] Open: http://localhost:3000/admin
- [ ] See "Event Gallery" tab (🖼️)
- [ ] See "Testimonials" tab (💬)
- [ ] Click "Event Gallery" tab
  - [ ] See 2 sample gallery items
  - [ ] No 404 errors
  - [ ] Click "Add New Gallery Item"
  - [ ] Form opens successfully
- [ ] Click "Testimonials" tab
  - [ ] See 2 sample testimonials
  - [ ] No 404 errors
  - [ ] Click "Add New Testimonial"
  - [ ] Form opens successfully

### 4. Test Homepage
- [ ] Open: http://localhost:3000
- [ ] Scroll to "Real Event Looks" section
  - [ ] See 2 sample gallery items
  - [ ] Images load correctly
- [ ] Scroll to "Client Stories" section
  - [ ] See 2 sample testimonials
  - [ ] Ratings display correctly

### 5. Test Adding Content
- [ ] Go back to admin panel
- [ ] Add a new gallery item:
  - [ ] Fill in title
  - [ ] Select event type
  - [ ] Click "Select Images"
  - [ ] Media Library opens
  - [ ] Select an image
  - [ ] Image appears in form
  - [ ] Click "Create Gallery Item"
  - [ ] Success message appears
  - [ ] New item appears in list
- [ ] Add a new testimonial:
  - [ ] Fill in client name
  - [ ] Fill in review text
  - [ ] Set rating
  - [ ] Add video URL (optional)
  - [ ] Click "Create Testimonial"
  - [ ] Success message appears
  - [ ] New testimonial appears in list

### 6. Verify Homepage Updates
- [ ] Go to homepage: http://localhost:3000
- [ ] Refresh page (Cmd+R)
- [ ] See your new gallery item in "Real Event Looks"
- [ ] See your new testimonial in "Client Stories"

---

## 🎯 Success Criteria

When everything is working, you should have:
- ✅ No 404 errors in browser console
- ✅ Event Gallery tab working in admin
- ✅ Testimonials tab working in admin
- ✅ Media Library opens and works
- ✅ Can add/edit/delete gallery items
- ✅ Can add/edit/delete testimonials
- ✅ Homepage shows real data
- ✅ Sections hide when no data
- ✅ Sample data visible (2 galleries, 2 testimonials)

---

## 🚨 If Something Doesn't Work

### Still seeing 404 errors?
1. [ ] Verify SQL ran successfully in Supabase
2. [ ] Check tables exist: Run in SQL Editor:
   ```sql
   SELECT * FROM event_gallery LIMIT 5;
   SELECT * FROM client_testimonials LIMIT 5;
   ```
3. [ ] Restart server completely (kill process and restart)
4. [ ] Clear browser cache (Cmd+Shift+R)

### Admin tabs not showing?
1. [ ] Check browser console for errors (F12)
2. [ ] Verify files exist:
   - `src/components/admin/EventGalleryManager.tsx`
   - `src/components/admin/TestimonialsManager.tsx`
   - `src/components/admin/MediaLibrary.tsx`
3. [ ] Check `src/app/admin/page.tsx` has the new tabs

### Images not loading?
1. [ ] Check image URLs are valid
2. [ ] Check browser network tab
3. [ ] Try different images from Media Library

### Data not showing on homepage?
1. [ ] Check items are marked as "Published"
2. [ ] Check items are marked as "Featured"
3. [ ] Check browser console for API errors
4. [ ] Verify API routes work: http://localhost:3000/api/event-gallery

---

## 📚 Documentation Files

- `QUICK_START.md` - 3-step quick start guide
- `RUN_THESE_SQL_FILES.md` - Detailed SQL instructions
- `FIX_404_ERROR_INSTRUCTIONS.md` - Troubleshooting 404 errors
- `COMPLETE_SETUP_SUMMARY.md` - Full system documentation
- `CHECKLIST.md` - This file

---

## 🎉 When Complete

Once all checkboxes are checked, you'll have:
- ✅ Full gallery management system
- ✅ Full testimonials management system
- ✅ Media library for images
- ✅ Homepage integration
- ✅ Sample data to start with
- ✅ Admin panel ready to use

**Time to complete: ~5 minutes**

---

## 📞 Need Help?

If you're stuck:
1. Check which step failed
2. Read the corresponding documentation file
3. Check browser console for errors
4. Check terminal for errors
5. Verify Supabase connection
6. Try clearing all caches and restarting

**Most common issue**: Forgetting to restart the dev server after running SQL!
