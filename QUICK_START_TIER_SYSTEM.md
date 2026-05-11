# 🚀 Quick Start - Tier System

## ⚡ Get Started in 3 Steps (20 minutes)

### Step 1: Run Database Migrations (5 min)

1. Open **Supabase Dashboard** → **SQL Editor**
2. Copy and execute `add-vendor-media-columns.sql`
3. Copy and execute `database-tier-system-migration.sql`
4. Verify:
   ```sql
   SELECT COUNT(*) FROM budget_allocation_config;
   -- Should return 24 rows
   
   SELECT display_tier, COUNT(*) FROM vendors GROUP BY display_tier;
   -- Should show standard, user-friendly, premium
   ```

### Step 2: Test the Flow (10 min)

1. **Start dev server:**
   ```bash
   cd utsavai
   npm run dev
   ```

2. **Open planning page:**
   ```
   http://localhost:3000/plan
   ```

3. **Fill requirements:**
   - Name: "Test User"
   - Phone: "+91 9876543210"
   - Budget: ₹50,000
   - Guests: 50
   - Date: Tomorrow
   - Theme: Cartoon
   - **Select vendors:** Restaurant, Cake, Decoration

4. **Click "Get AI recommendations"**
   - Wait for vendors to load
   - See tier cards (Standard/User-Friendly/Premium)
   - Notice real names are small and muted

5. **Select vendors:**
   - Click on 1 vendor per category
   - See cost summary update
   - Notice 30% advance calculation

6. **Click "Book Now"**
   - Booking created
   - Redirected to `/booking/[id]`
   - See booking details

7. **Click "Pay ₹X to Confirm"**
   - Payment processed (demo mode)
   - Booking confirmed
   - Status updated

### Step 3: Verify in Database (5 min)

```sql
-- Check bookings
SELECT 
  id, 
  customer_name, 
  booking_status, 
  payment_status, 
  total_amount, 
  advance_amount
FROM bookings
ORDER BY created_at DESC
LIMIT 5;

-- Check selected vendors
SELECT 
  id,
  customer_name,
  selected_vendors
FROM bookings
ORDER BY created_at DESC
LIMIT 1;

-- Check audit log
SELECT * FROM booking_audit_log
ORDER BY created_at DESC
LIMIT 5;
```

---

## ✅ What to Look For

### In the UI:
- ✅ Tier labels prominent (Standard Vendor, User-Friendly Vendor, Premium Vendor)
- ✅ Real vendor names small and muted (11px, opacity 50%)
- ✅ Price ranges shown (₹15,000 - ₹20,000)
- ✅ Budget allocated by priority
- ✅ Cost summary shows 30% advance
- ✅ Booking confirmation page displays correctly

### In the Database:
- ✅ Booking record created
- ✅ Selected vendors stored as JSONB
- ✅ Advance amount calculated (30%)
- ✅ Payment status = "pending"
- ✅ Booking status = "pending"
- ✅ Audit log entry created

---

## 🐛 Quick Fixes

### Vendors not showing?
```bash
# Check API response
curl http://localhost:3000/api/vendors?city=Dehradun&category=catering
```

### Budget allocation not working?
```sql
-- Check config exists
SELECT * FROM budget_allocation_config WHERE event_type = 'birthday';
```

### Booking creation fails?
```sql
-- Check table exists
SELECT COUNT(*) FROM bookings;
```

---

## 📞 Need Help?

Check these files:
- `TIER_SYSTEM_IMPLEMENTATION_COMPLETE.md` - Full documentation
- `database-tier-system-migration.sql` - Database schema
- `src/components/VendorTierCard.tsx` - Tier card component
- `src/components/TotalCostSummary.tsx` - Cost summary component
- `src/app/booking/[id]/page.tsx` - Booking confirmation page

---

## 🎉 Success!

If you can:
1. ✅ See tier cards with hidden vendor names
2. ✅ Select vendors and see cost summary
3. ✅ Create a booking
4. ✅ See booking in database

**You're done! The tier system is working!** 🚀

