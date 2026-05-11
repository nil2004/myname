# Complete Implementation Guide - Gallery & Testimonials with Media Library

## What You Need to Do

### Step 1: Run SQL Migration (5 minutes)
1. Open Supabase Dashboard: https://supabase.com
2. Go to SQL Editor
3. Copy contents of `ADD_GALLERY_AND_TESTIMONIALS.sql`
4. Run the SQL
5. Verify tables created

### Step 2: Create Admin Components (Already Done!)

I've created the following files for you:
- ✅ `ADD_GALLERY_AND_TESTIMONIALS.sql` - Database schema
- ✅ `src/app/api/event-gallery/route.ts` - Gallery API
- ✅ `src/app/api/testimonials/route.ts` - Testimonials API

### Step 3: Integrate with Your Admin Panel

You need to create two admin components that use your existing MediaManager:

#### Component 1: Event Gallery Manager
```typescript
// src/components/admin/EventGalleryManager.tsx

Features needed:
1. List all gallery items
2. Add new gallery item with form:
   - Title, description, event type, date, location
   - Button to open Media Library modal
   - Select multiple images from Media Library
   - Add tags and theme
   - Mark as featured/published
3. Edit existing gallery items
4. Delete gallery items
```

#### Component 2: Testimonials Manager
```typescript
// src/components/admin/TestimonialsManager.tsx

Features needed:
1. List all testimonials
2. Add new testimonial with form:
   - Client name
   - Button to select client photo from Media Library
   - Event type, date
   - Review text (textarea)
   - Rating (1-5 stars)
   - Video URL input (YouTube/Vimeo)
   - Mark as featured/published
3. Edit existing testimonials
4. Delete testimonials
```

### Step 4: Media Library Integration Pattern

Here's how to integrate with your existing MediaManager:

```typescript
// Example: Opening Media Library to select images

const [showMediaLibrary, setShowMediaLibrary] = useState(false);
const [selectedImages, setSelectedImages] = useState<string[]>([]);

// In your form:
<button onClick={() => setShowMediaLibrary(true)}>
  Select Images from Media Library
</button>

// Media Library Modal:
{showMediaLibrary && (
  <MediaLibraryModal
    mode="multiple" // or "single" for testimonial client photo
    onSelect={(urls) => {
      setSelectedImages(urls);
      setShowMediaLibrary(false);
    }}
    onClose={() => setShowMediaLibrary(false)}
  />
)}
```

## Quick Implementation Steps

### For Event Gallery:

1. **Create the component file**
2. **Add state for gallery items**
3. **Fetch gallery items from API**
4. **Create form with Media Library integration**
5. **Handle create/update/delete operations**

### For Testimonials:

1. **Create the component file**
2. **Add state for testimonials**
3. **Fetch testimonials from API**
4. **Create form with Media Library integration for client photo**
5. **Add video URL input field**
6. **Handle create/update/delete operations**

## Database Schema Reference

### event_gallery table
- id (uuid)
- title (text)
- description (text)
- event_type (text)
- event_date (date)
- location (text)
- images (text[]) ← Array of image URLs from Media Library
- vendor_id (uuid)
- vendor_name (text)
- tags (text[])
- theme (text)
- featured (boolean)
- published (boolean)
- display_order (integer)
- created_at, updated_at, created_by

### client_testimonials table
- id (uuid)
- client_name (text)
- client_image (text) ← URL from Media Library
- event_type (text)
- event_date (date)
- review_text (text)
- rating (numeric 0-5)
- video_url (text) ← YouTube/Vimeo URL
- video_thumbnail (text)
- vendor_id (uuid)
- vendor_name (text)
- featured (boolean)
- published (boolean)
- display_order (integer)
- created_at, updated_at, created_by

## API Usage Examples

### Create Gallery Item
```typescript
const response = await fetch('/api/event-gallery', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Magical Birthday Party',
    description: 'A wonderful celebration...',
    eventType: 'birthday',
    eventDate: '2026-05-10',
    location: 'Dehradun',
    images: [
      'https://supabase.co/.../image1.jpg',
      'https://supabase.co/.../image2.jpg'
    ],
    tags: ['decoration', 'cartoon', 'balloons'],
    theme: 'Cartoon',
    featured: true,
    published: true
  })
});
```

### Create Testimonial
```typescript
const response = await fetch('/api/testimonials', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    clientName: 'Priya Sharma',
    clientImage: 'https://supabase.co/.../client.jpg',
    eventType: 'birthday',
    reviewText: 'Amazing service!',
    rating: 5.0,
    videoUrl: 'https://www.youtube.com/watch?v=xxxxx',
    featured: true,
    published: true
  })
});
```

## What's Already Done

✅ Database schema created
✅ API endpoints created
✅ TypeScript interfaces defined
✅ Sample data included
✅ Indexes for performance
✅ RLS policies for security

## What You Need to Build

⏳ EventGalleryManager component (admin UI)
⏳ TestimonialsManager component (admin UI)
⏳ Media Library integration in both components
⏳ Public-facing display components (optional)

## Tips

1. **Reuse your MediaManager component** - Don't rebuild it
2. **Follow your existing admin panel patterns** - Match the style
3. **Use the same UI components** - Buttons, inputs, modals
4. **Test with sample data first** - SQL includes test data
5. **Add to admin navigation** - Make it easy to find

---

**Ready to implement!** Start with the SQL migration, then build the admin components.
