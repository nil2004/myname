# 🔧 Database Vendor Display Fix

## Problem

You reported seeing **3 restaurants** on the frontend, but only having **1 restaurant** in your database.

## Root Cause

The `PlanForm.tsx` component was using **hardcoded mock data** instead of fetching vendors from your Supabase database.

### Why This Happened:

1. **Mock Data Function:** The component had a `buildMockVendors()` function that returns 3 hardcoded restaurants:
   - Olive Banquets
   - Royal Garden Restaurant
   - Celebration Hub

2. **Database Not Being Called:** Although there was a `fetchVendorsFromDB()` function, it had incorrect category mapping:
   - Frontend was looking for category `'catering'`
   - Database has category `'restaurant'`
   - Result: No vendors found, so it fell back to mock data

## Solution Applied

### Fixed Category Mapping

Changed the category mapping in 3 places in `PlanForm.tsx`:

#### 1. In `fetchVendorsFromDB()` function:
```typescript
// BEFORE (Wrong):
const categoryMap: Record<AddOn, string> = {
  'Restaurant': 'catering',  // ❌ Wrong!
  'Cake': 'cake',
  // ...
};

// AFTER (Fixed):
const categoryMap: Record<AddOn, string> = {
  'Restaurant': 'restaurant',  // ✅ Correct!
  'Cake': 'cake',
  // ...
};
```

#### 2. In vendor conversion logic:
```typescript
// BEFORE (Wrong):
category: v.category === 'catering' ? 'Restaurant' : ...  // ❌ Wrong!

// AFTER (Fixed):
category: v.category === 'restaurant' ? 'Restaurant' : ...  // ✅ Correct!
```

#### 3. In pricing type detection:
```typescript
// BEFORE (Wrong):
type: v.category === 'catering' ? 'per_plate' : 'range'  // ❌ Wrong!

// AFTER (Fixed):
type: v.category === 'restaurant' ? 'per_plate' : 'range'  // ✅ Correct!
```

#### 4. In `fetchBudgetAllocations()` function:
```typescript
// BEFORE (Wrong):
const categoryMap: Record<AddOn, string> = {
  'Restaurant': 'catering',  // ❌ Wrong!
  // ...
};

// AFTER (Fixed):
const categoryMap: Record<AddOn, string> = {
  'Restaurant': 'restaurant',  // ✅ Correct!
  // ...
};
```

## How It Works Now

### Flow:

```
1. User fills form and clicks "Get Recommendations"
   ↓
2. goToRecommendations() is called
   ↓
3. fetchVendorsFromDB() is called
   ↓
4. API call: GET /api/vendors?category=restaurant&city=Dehradun&...
   ↓
5. Database returns YOUR 1 restaurant
   ↓
6. Vendor is converted to MockVendor format
   ↓
7. setRealVendors() updates state
   ↓
8. UI shows YOUR 1 restaurant (not 3 mock ones!)
```

## Testing

### Before Fix:
```
Database: 1 restaurant
Frontend shows: 3 restaurants (mock data)
```

### After Fix:
```
Database: 1 restaurant
Frontend shows: 1 restaurant (your real data!)
```

## Verify the Fix

### Step 1: Check Your Database
Run this in Supabase SQL Editor:
```sql
SELECT id, name, category, city, price_min, price_max 
FROM vendors 
WHERE category = 'restaurant';
```

You should see your 1 restaurant.

### Step 2: Test the Frontend

1. Start dev server:
   ```bash
   npm run dev
   ```

2. Go to http://localhost:3000/plan

3. Fill in the form:
   - Name: Test User
   - Phone: 1234567890
   - Budget: ₹30,000
   - Guests: 30
   - Date: Any future date
   - Select "Restaurant" in add-ons

4. Click "Get Recommendations"

5. **Expected Result:** You should see **only 1 restaurant** (your database restaurant)

### Step 3: Check Browser Console

Open browser console (F12) and look for:
```
Fetching vendors from database...
Found X vendors
```

If you see errors, check:
- Is Supabase URL correct in `.env.local`?
- Is the vendors table accessible?
- Are there any CORS errors?

## Database Categories

Your database uses these category names:

| Frontend AddOn | Database Category |
|----------------|-------------------|
| Restaurant     | `restaurant`      |
| Cake           | `cake`            |
| Decoration     | `decorator`       |
| Photographer   | `photographer`    |
| DJ             | `dj`              |

**Important:** Always use lowercase database category names!

## Adding More Vendors

To add more restaurants to your database, run this SQL:

```sql
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
  area
) VALUES 
(
  'Royal Garden Restaurant',
  'restaurant',  -- ✅ Use 'restaurant', not 'catering'
  4.7,
  142,
  25000,
  45000,
  'Dehradun',
  true,
  ARRAY['Garden', 'Premium', 'Live Music', 'Valet Parking'],
  '🌳',
  'Luxury dining with beautiful garden setting. Known for authentic North Indian cuisine.',
  'Saharanpur Road'
),
(
  'Celebration Hub',
  'restaurant',  -- ✅ Use 'restaurant', not 'catering'
  4.3,
  95,
  15000,
  30000,
  'Dehradun',
  true,
  ARRAY['Budget Friendly', 'Family Style', 'Quick Service'],
  '🎊',
  'Budget-friendly party venue with great food quality.',
  'Clock Tower'
);
```

After adding, refresh your frontend and you'll see all 3 restaurants!

## Fallback Behavior

The code still has mock data as a fallback:

```typescript
const mockVendors = useMemo(() => {
  if (realVendors.length > 0) {
    return realVendors;  // ✅ Use real data if available
  }
  return buildMockVendors(event);  // ⚠️ Fallback to mock data
}, [realVendors, event]);
```

**This means:**
- If database fetch succeeds → Shows real vendors ✅
- If database fetch fails → Shows mock vendors (3 restaurants) ⚠️

## Troubleshooting

### Still Seeing 3 Restaurants?

**Check 1: Is the API being called?**
```javascript
// Open browser console and check Network tab
// Look for: GET /api/vendors?category=restaurant&...
```

**Check 2: Is the API returning data?**
```bash
# Test API directly
curl "http://localhost:3000/api/vendors?category=restaurant&city=Dehradun"
```

**Check 3: Is Supabase connected?**
```bash
# Check .env.local file
cat .env.local | grep SUPABASE
```

Should show:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Check 4: Are vendors in database?**
```sql
SELECT COUNT(*) FROM vendors WHERE category = 'restaurant';
```

Should return at least 1.

### API Returns Empty Array?

**Possible causes:**
1. Wrong category name (should be `'restaurant'`, not `'catering'`)
2. Wrong city name (check exact spelling)
3. Vendors not verified (`verified = false`)
4. Database connection issue

**Fix:**
```sql
-- Make sure your vendor is verified
UPDATE vendors 
SET verified = true 
WHERE category = 'restaurant';

-- Check city name matches exactly
SELECT DISTINCT city FROM vendors;
```

## Summary

### What Was Fixed:
✅ Changed category mapping from `'catering'` to `'restaurant'`  
✅ Fixed in 4 places in PlanForm.tsx  
✅ Now fetches real vendors from database  
✅ Falls back to mock data only if fetch fails  

### Result:
- **Before:** Always showed 3 mock restaurants
- **After:** Shows actual restaurants from your database

### Next Steps:
1. Test the fix (see "Verify the Fix" section above)
2. Add more vendors to database if needed
3. Verify all categories work (cake, decorator, photographer, dj)

---

**Status:** ✅ Fixed  
**Files Modified:** `src/components/PlanForm.tsx`  
**Lines Changed:** 4 locations  
**Impact:** Now shows real database vendors instead of mock data  

---

## Quick Test Command

```bash
# Test if API returns your restaurant
curl "http://localhost:3000/api/vendors?category=restaurant&city=Dehradun" | jq '.vendors | length'

# Should return: 1 (or however many restaurants you have)
```

If it returns `0`, check your database. If it returns `1` or more, the fix is working! 🎉
