# Quick Start Guide - Database Integration

## ✅ What's Done

Your website is now connected to the real Supabase database! Here's what was implemented:

### 1. **Database Connection** ✅
- Supabase URL: `https://uaiwuivyrdoausenvlbs.supabase.co`
- Credentials configured in `.env.local`
- Connection tested and working

### 2. **Vendor Data** ✅
- 24 real vendors seeded in database
- Categories: Decorator, Photographer, Cake, DJ, Entertainment, Catering
- All vendors in Dehradun city

### 3. **AI Matching** ✅
- Smart algorithm scores vendors based on:
  - Rating (0-5 points)
  - Price match (0-3 points)
  - Theme match in tags (0-5 points)
  - Experience (0-2 points)
  - Verified status (0-1 point)

### 4. **API Endpoint** ✅
- `GET /api/vendors` - Fetches and scores vendors
- Filters by city, category, theme, budget
- Returns sorted by match score

### 5. **Frontend Integration** ✅
- PlanForm fetches real vendors from database
- Graceful fallback to mock data on errors
- No UI changes - seamless integration

---

## 🚀 How to Use

### For Customers:
1. Go to `/plan` page
2. Fill in requirements (name, phone, budget, guests, theme)
3. **Select vendors** (Restaurant, Cake, Decoration, Photographer, DJ)
4. Click "Get AI recommendations"
5. See real vendors from database matched to your needs!

### For Admins:
1. Go to Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `uaiwuivyrdoausenvlbs`
3. Go to Table Editor → `vendors`
4. Add/Edit/Delete vendors as needed
5. Changes reflect immediately on website!

---

## 📊 AI Matching Logic

### How It Works:

**Example**: Customer wants Cartoon theme, ₹30,000 budget, 50 guests

**Vendor A: "Party Perfect Decor"**
- Tags: ["kids-themes", "cartoon-characters", "colorful"]
- Price: ₹5,000 (well within budget)
- Rating: 4.6
- **Score: 14.6 points** → **RECOMMENDED** ✅

**Vendor B: "Luxury Events Co"**
- Tags: ["luxury", "premium", "elegant"]
- Price: ₹18,500 (over budget per category)
- Rating: 4.8
- **Score: 6.8 points** → Not recommended

### Theme Keywords:
- **Cartoon**: kids, children, fun, colorful, playful, cartoon, animated
- **Romantic**: romantic, elegant, intimate, couple, love, roses, candles
- **Luxury**: luxury, premium, elegant, sophisticated, high-end, exclusive
- **Surprise**: surprise, special, unique, creative, unexpected, wow

---

## 🔧 Adding New Vendors

### Via Supabase Dashboard:
1. Go to Table Editor → `vendors`
2. Click "Insert row"
3. Fill in:
   - `name`: Vendor name
   - `category`: decorator, photographer, cake, dj, catering, entertainment
   - `rating`: 4.0 to 5.0
   - `review_count`: Number of reviews
   - `price_min`: Minimum price
   - `price_max`: Maximum price
   - `city`: Dehradun (or other city)
   - `verified`: true/false
   - `tags`: ["tag1", "tag2", "tag3"] - **Important for AI matching!**
   - `image_emoji`: 🎨 or any emoji
4. Click "Save"
5. Vendor appears on website immediately!

### Important: Tags for AI Matching
Make sure to add relevant tags that match theme keywords:
- For kids parties: ["kids", "cartoon", "colorful", "fun"]
- For romantic: ["romantic", "elegant", "roses", "intimate"]
- For luxury: ["luxury", "premium", "high-end", "exclusive"]

---

## 🧪 Testing

### Test the Integration:
```bash
# 1. Start the development server
cd utsavai
npm run dev

# 2. Open browser
http://localhost:3000/plan

# 3. Fill the form:
- Name: Test User
- Phone: +91 9876543210
- Budget: 30000
- Guests: 50
- Theme: Cartoon
- Select: Decoration, Cake, Photographer

# 4. Click "Get AI recommendations"
# 5. You should see real vendors from database!
```

### Verify Database:
```sql
-- In Supabase SQL Editor
SELECT name, category, rating, tags FROM vendors WHERE city = 'Dehradun';
```

---

## 📝 Current Vendors in Database

### Decorators (4):
1. Celebrations by Riya - ₹7,000-15,000 - 4.9⭐
2. Dream Decor Studio - ₹5,000-12,000 - 4.7⭐
3. Luxury Events Co - ₹12,000-25,000 - 4.8⭐
4. Balloon Magic - ₹4,000-9,000 - 4.6⭐

### Photographers (4):
1. Happy Moments Studio - ₹5,000-12,000 - 4.8⭐
2. Capture Life Photography - ₹8,000-18,000 - 4.9⭐
3. Budget Clicks - ₹3,000-7,000 - 4.5⭐
4. Pro Lens Studio - ₹6,000-14,000 - 4.7⭐

### Cake Artists (4):
1. Sweetie's Cake House - ₹1,500-6,000 - 4.7⭐
2. Cake Studio Deluxe - ₹2,500-8,000 - 4.9⭐
3. Home Baker's Delight - ₹800-3,000 - 4.6⭐
4. Royal Cakes & Pastries - ₹2,000-7,000 - 4.8⭐

### DJs (4):
1. Party Beats DJ - ₹4,000-10,000 - 4.6⭐
2. DJ Rockstar Events - ₹6,000-15,000 - 4.8⭐
3. Music Mania DJ - ₹3,000-8,000 - 4.5⭐
4. Elite Sound Systems - ₹8,000-20,000 - 4.9⭐

### Entertainment (4):
1. Magic Wonders - ₹3,000-8,000 - 4.8⭐
2. Fun Factory Entertainment - ₹4,000-10,000 - 4.7⭐
3. Clown Around - ₹2,500-6,000 - 4.6⭐
4. Puppet Show Masters - ₹2,000-5,000 - 4.5⭐

### Catering (4):
1. Yummy Bites Catering - ₹5,000-20,000 - 4.5⭐
2. Tasty Treats Kitchen - ₹6,000-25,000 - 4.7⭐
3. Street Food Express - ₹4,000-15,000 - 4.6⭐
4. Premium Feast Catering - ₹10,000-40,000 - 4.8⭐

---

## 🎯 What Happens Now

### Customer Journey:
1. Customer fills requirements → **Saved to database**
2. Customer selects vendors → **AI fetches from database**
3. AI matches vendors → **Based on theme, budget, tags**
4. Customer sees recommendations → **Real vendors with real prices**
5. Customer proceeds to payment → **Order saved to database**

### Data Flow:
```
Customer Input
    ↓
Frontend (PlanForm.tsx)
    ↓
API (/api/vendors)
    ↓
Supabase Database (vendors table)
    ↓
AI Matching Algorithm
    ↓
Scored & Sorted Vendors
    ↓
Frontend Display
    ↓
Customer Selection
    ↓
Database (orders table)
```

---

## 🔒 Security

- ✅ Row Level Security (RLS) enabled
- ✅ Public read access for vendors (safe)
- ✅ Write access controlled (admin only)
- ✅ API keys in environment variables
- ✅ No sensitive data exposed

---

## 📞 Need Help?

### Common Issues:

**Q: No vendors showing?**
A: Check `.env.local` has correct credentials, verify vendors exist in database

**Q: Wrong vendors recommended?**
A: Check vendor tags match theme keywords, adjust tags in database

**Q: API errors?**
A: Check Supabase project is active, verify anon key permissions

### Resources:
- Full Documentation: `DATABASE_INTEGRATION_REPORT.md`
- Supabase Dashboard: https://supabase.com/dashboard
- Database Schema: `supabase-complete-schema.sql`

---

## ✅ Summary

**What's Working:**
- ✅ Real vendors from database
- ✅ AI matching algorithm
- ✅ Theme-based recommendations
- ✅ Budget-aware suggestions
- ✅ Seamless user experience

**What's Next:**
- 🔄 Add more vendors
- 🔄 Add more cities
- 🔄 Implement vendor dashboard
- 🔄 Add customer reviews

---

**Status**: 🟢 Production Ready
**Last Updated**: May 8, 2026
