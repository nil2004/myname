# Fix 500 Error - Vendor Suggestions

## The Problem

You're getting this error:
```
POST /api/vendor-suggestions 500 (Internal Server Error)
Failed to create vendor suggestion
```

Server logs show:
```
Could not find the 'initial_price' column of 'vendor_suggestions' in the schema cache
```

## The Cause

The `vendor_suggestions` table doesn't exist in your Supabase database yet.

## The Solution (3 Easy Steps)

### Step 1: Open Supabase Dashboard

1. Go to https://supabase.com
2. Sign in to your account
3. Select your project (the one you're using for this app)

### Step 2: Run the SQL Script

1. Click **"SQL Editor"** in the left sidebar
2. Click **"New query"** button
3. Copy the ENTIRE content from the file: **`COMPLETE_DATABASE_SETUP.sql`**
4. Paste it into the SQL Editor
5. Click **"Run"** button (or press Ctrl/Cmd + Enter)
6. Wait for the success message ✅

### Step 3: Test Your App

1. Go back to your browser
2. Refresh the page (Ctrl/Cmd + R)
3. Go to `http://localhost:3000/plan`
4. Fill out the form and submit
5. Go to `http://localhost:3000/admin`
6. Click "Vendor Suggestions" tab
7. You should see your suggestion! 🎉

---

## Alternative: Quick SQL Script

If you just want to create the `vendor_suggestions` table quickly, copy and paste this into Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create vendor_suggestions table
CREATE TABLE IF NOT EXISTS vendor_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL,
  
  -- Customer info
  customer_name VARCHAR(255),
  customer_phone VARCHAR(20),
  customer_email VARCHAR(255),
  occasion VARCHAR(100),
  age_group VARCHAR(50),
  budget INT,
  guest_count INT,
  location_type VARCHAR(50),
  city VARCHAR(100),
  theme VARCHAR(50),
  add_ons TEXT[],
  specifications TEXT,
  
  -- Vendor 1
  vendor_1_id UUID,
  vendor_1_name VARCHAR(255),
  vendor_1_category VARCHAR(50),
  vendor_1_price INT,
  vendor_1_auto_matched BOOLEAN DEFAULT TRUE,
  
  -- Vendor 2
  vendor_2_id UUID,
  vendor_2_name VARCHAR(255),
  vendor_2_category VARCHAR(50),
  vendor_2_price INT,
  vendor_2_auto_matched BOOLEAN DEFAULT TRUE,
  
  -- Vendor 3
  vendor_3_id UUID,
  vendor_3_name VARCHAR(255),
  vendor_3_category VARCHAR(50),
  vendor_3_price INT,
  vendor_3_auto_matched BOOLEAN DEFAULT TRUE,
  
  -- Package & Pricing
  package_type VARCHAR(50),
  package_name VARCHAR(255),
  package_description TEXT,
  initial_price INT,
  admin_adjusted_price INT,
  final_price INT,
  discount_amount INT DEFAULT 0,
  discount_reason TEXT,
  
  -- Customization
  customizations JSONB,
  admin_notes TEXT,
  
  -- Scheduling
  event_date DATE,
  event_time VARCHAR(50),
  event_duration VARCHAR(50),
  setup_time VARCHAR(50),
  slot_confirmed BOOLEAN DEFAULT FALSE,
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending_admin_review',
  
  -- Workflow tracking
  reviewed_by VARCHAR(255),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  finalized_by VARCHAR(255),
  finalized_at TIMESTAMP WITH TIME ZONE,
  sent_to_customer_at TIMESTAMP WITH TIME ZONE,
  customer_viewed_at TIMESTAMP WITH TIME ZONE,
  customer_approved_at TIMESTAMP WITH TIME ZONE,
  
  -- Payment
  payment_method VARCHAR(50),
  payment_status VARCHAR(50),
  payment_id VARCHAR(255),
  paid_amount INT DEFAULT 0,
  paid_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_vendor_suggestions_request_id ON vendor_suggestions(request_id);
CREATE INDEX IF NOT EXISTS idx_vendor_suggestions_status ON vendor_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_vendor_suggestions_created_at ON vendor_suggestions(created_at);

-- Enable RLS
ALTER TABLE vendor_suggestions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Enable read access for all users" ON vendor_suggestions;
CREATE POLICY "Enable read access for all users" ON vendor_suggestions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for all users" ON vendor_suggestions;
CREATE POLICY "Enable insert for all users" ON vendor_suggestions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for all users" ON vendor_suggestions;
CREATE POLICY "Enable update for all users" ON vendor_suggestions FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable delete for all users" ON vendor_suggestions;
CREATE POLICY "Enable delete for all users" ON vendor_suggestions FOR DELETE USING (true);

-- Verify
SELECT 'vendor_suggestions table created successfully!' as message;
```

---

## Verify It Worked

After running the SQL, verify the table was created:

```sql
-- Check table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'vendor_suggestions';

-- Check columns
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'vendor_suggestions'
ORDER BY ordinal_position;
```

You should see:
- Table name: `vendor_suggestions`
- Columns including: `id`, `initial_price`, `status`, etc.

---

## Still Getting Errors?

### Error: "relation vendor_suggestions does not exist"
**Fix:** The SQL didn't run successfully. Try again and check for error messages.

### Error: "permission denied"
**Fix:** Make sure you're logged into the correct Supabase project.

### Error: "column initial_price does not exist"
**Fix:** The table exists but is incomplete. Drop and recreate:
```sql
DROP TABLE IF EXISTS vendor_suggestions CASCADE;
-- Then run the CREATE TABLE script again
```

---

## What This Does

The SQL script creates a table that stores:
- ✅ Customer information and requirements
- ✅ 3 AI-matched vendor suggestions
- ✅ Pricing details (initial, adjusted, final)
- ✅ Admin notes and customizations
- ✅ Status tracking (pending, approved, etc.)
- ✅ Payment information
- ✅ Timestamps

---

## After Setup

Once the table is created, the vendor suggestions feature will work:

1. **Customer submits form** → Request saved + Vendor suggestions created
2. **AI matches vendors** → 3 best vendors selected automatically
3. **Admin reviews** → Can edit, approve, or customize
4. **Status tracking** → Full workflow from pending to confirmed

---

## Need More Help?

Check these files:
- `SETUP_DATABASE.md` - Detailed database setup guide
- `COMPLETE_DATABASE_SETUP.sql` - Full SQL script
- `TESTING_GUIDE.md` - How to test after setup
- `SUMMARY.md` - Overview of the feature

---

## Quick Checklist

- [ ] Open Supabase Dashboard
- [ ] Go to SQL Editor
- [ ] Copy SQL from `COMPLETE_DATABASE_SETUP.sql`
- [ ] Paste and run
- [ ] Verify table created
- [ ] Refresh your app
- [ ] Test form submission
- [ ] Check admin panel
- [ ] See vendor suggestions! 🎉

That's it! Once you run the SQL, everything will work. 🚀
