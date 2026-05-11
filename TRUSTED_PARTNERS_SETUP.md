# 🤝 Trusted Partners - Real Data Setup

## What's Been Created

### 1. Database Table ✅
- **File**: `ADD_TRUSTED_PARTNERS_TABLE.sql`
- **Table**: `trusted_partners`
- **Features**:
  - Partner name, logo (emoji), category, description, website
  - Featured flag and display order
  - Active/inactive status
  - Row Level Security (RLS)
  - 8 sample partners included

### 2. API Route ✅
- **File**: `src/app/api/partners/route.ts`
- **Endpoints**:
  - GET: Fetch partners (filter by status, featured)
  - POST: Create new partner
  - PUT: Update partner
  - DELETE: Remove partner

### 3. Updated Components ✅
- **Partners.tsx** - Homepage component now fetches real data
  - Shows active partners from database
  - Hides section if no partners
  - Dynamic partner count in stats
  - Loading state
- **TrustedPartnersManager.tsx** - Admin panel (already existed)
  - Full CRUD operations
  - Toggle featured/status
  - Reorder partners

## Setup Instructions

### Step 1: Run SQL Migration
1. Open Supabase SQL Editor: https://supabase.com/dashboard/project/uaiwuivyrdoausenvlbs/sql/new
2. Open file: `ADD_TRUSTED_PARTNERS_TABLE.sql`
3. Copy all content
4. Paste into SQL Editor
5. Click **Run**
6. Wait for: "✅ Trusted Partners table created successfully!"

### Step 2: Restart Development Server
```bash
# Stop server (Ctrl+C)
npm run dev
```

### Step 3: Test Homepage
1. Go to: http://localhost:3000
2. Scroll to "Trusted Partners" section
3. You should see 8 sample partners with emojis
4. Partner count should show "8+" in stats

### Step 4: Test Admin Panel
1. Go to: http://localhost:3000/admin
2. Click: **Trusted Partners** tab
3. You should see:
   - 8 total partners
   - 4 featured partners
   - 8 active partners
   - 8 categories
4. Try:
   - Adding a new partner
   - Editing a partner
   - Toggling featured status
   - Changing display order
   - Deleting a partner

## Sample Data Included

The SQL migration includes 8 sample partners:

1. **Celebrations by Riya** 🎨 - Decorators (Featured)
2. **Happy Moments Studio** 📸 - Photography (Featured)
3. **Sweetie's Cake House** 🎂 - Cakes (Featured)
4. **Magic Moments** 🎭 - Entertainment (Featured)
5. **Party Perfect** 🍽️ - Catering
6. **Balloon Bliss** 🎈 - Balloons
7. **Snap & Smile** 📷 - Photography
8. **Sweet Treats** 🍰 - Desserts

## Features

### Homepage Display
- Shows all active partners
- Displays partner logo (emoji)
- Shows partner name and category
- Hover effects and animations
- Dynamic stats (partner count updates automatically)
- Hides section if no partners available

### Admin Panel
- Add/edit/delete partners
- Upload logo emoji
- Set category and description
- Add website URL
- Toggle featured status (⭐)
- Toggle active/inactive status
- Set display order
- View stats (total, featured, active, categories)

## How to Add New Partners

### Via Admin Panel (Recommended)
1. Go to admin panel → Trusted Partners tab
2. Click "Add Partner"
3. Fill in:
   - Partner Name (e.g., "Dream Decorators")
   - Logo Emoji (e.g., 🎨)
   - Category (e.g., "Decorators")
   - Description (brief description)
   - Website URL
   - Featured (check if featured)
   - Display Order (number for sorting)
4. Click "Add Partner"
5. Partner appears on homepage immediately

### Via SQL (Bulk Add)
```sql
INSERT INTO trusted_partners (name, logo, category, description, website, featured, display_order)
VALUES
('Your Partner Name', '🎉', 'Category', 'Description', 'https://example.com', true, 9);
```

## Customization

### Change Logo Display
Edit `src/components/Partners.tsx`:
```tsx
// Current: Shows emoji or first letter
{partner.logo || partner.name.charAt(0)}

// Option 1: Always show emoji
{partner.logo}

// Option 2: Show image URL
<img src={partner.logo} alt={partner.name} />
```

### Filter Featured Only
Homepage currently shows all active partners. To show only featured:

Edit `src/components/Partners.tsx`:
```tsx
const response = await fetch("/api/partners?status=active&featured=true");
```

### Change Grid Layout
Edit `src/components/Partners.tsx`:
```tsx
// Current: 2 columns on mobile, 4 on desktop
<div className="grid grid-cols-2 md:grid-cols-4 gap-6">

// Option: 3 columns on mobile, 6 on desktop
<div className="grid grid-cols-3 md:grid-cols-6 gap-6">
```

## Troubleshooting

### Partners not showing on homepage
1. Check if SQL migration ran successfully
2. Verify partners exist: `SELECT * FROM trusted_partners;`
3. Check partners are active: `status = 'active'`
4. Check browser console for API errors
5. Restart dev server

### Admin panel not loading partners
1. Check API route exists: `src/app/api/partners/route.ts`
2. Check browser network tab for 404 errors
3. Restart dev server
4. Check Supabase connection

### Can't add/edit partners
1. Check RLS policies in Supabase
2. Verify admin permissions
3. Check browser console for errors
4. Check API response in network tab

## Database Schema

```sql
CREATE TABLE trusted_partners (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  logo TEXT DEFAULT '🎉',
  category TEXT NOT NULL,
  description TEXT,
  website TEXT,
  featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## API Endpoints

### GET /api/partners
Fetch partners with optional filters:
- `?status=active` - Filter by status
- `?featured=true` - Only featured partners

### POST /api/partners
Create new partner:
```json
{
  "name": "Partner Name",
  "logo": "🎉",
  "category": "Category",
  "description": "Description",
  "website": "https://example.com",
  "featured": true,
  "displayOrder": 1,
  "status": "active"
}
```

### PUT /api/partners
Update partner (include `id` in body)

### DELETE /api/partners?id=<uuid>
Delete partner by ID

## Next Steps

1. ✅ Run SQL migration
2. ✅ Restart server
3. ✅ Test homepage
4. ✅ Test admin panel
5. ✅ Add your real partners
6. ✅ Replace sample data
7. ✅ Customize as needed

## Summary

You now have a complete Trusted Partners system with:
- ✅ Database table with 8 sample partners
- ✅ Full CRUD API
- ✅ Homepage integration with real data
- ✅ Admin panel for management
- ✅ Featured partners support
- ✅ Display order control
- ✅ Active/inactive status
- ✅ Dynamic stats

**Just run the SQL migration and restart the server!**
