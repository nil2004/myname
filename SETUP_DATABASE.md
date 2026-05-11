# Database Setup Guide - Vendor Suggestions

## Issue

You're getting this error:
```
Could not find the 'initial_price' column of 'vendor_suggestions' in the schema cache
```

This means the `vendor_suggestions` table doesn't exist in your Supabase database yet.

## Solution

You need to run the SQL schema to create the table in Supabase.

---

## Step-by-Step Setup

### Option 1: Using Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to https://supabase.com
   - Sign in to your account
   - Select your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Copy the Schema**
   - Open the file: `vendor-suggestions-schema.sql`
   - Copy ALL the content (Ctrl/Cmd + A, then Ctrl/Cmd + C)

4. **Paste and Run**
   - Paste the SQL into the Supabase SQL Editor
   - Click "Run" button (or press Ctrl/Cmd + Enter)
   - Wait for success message

5. **Verify Table Created**
   - Click on "Table Editor" in the left sidebar
   - You should see `vendor_suggestions` in the list
   - Click on it to see the columns

### Option 2: Using Supabase CLI

If you have Supabase CLI installed:

```bash
# Navigate to your project
cd "/Users/nilbrata/Desktop/utsavai new/utsavai"

# Run the migration
supabase db push vendor-suggestions-schema.sql
```

---

## Complete SQL to Run

Copy and paste this entire SQL script into Supabase SQL Editor:

```sql
-- ============================================
-- Vendor Suggestions System - Hybrid Model
-- ============================================

-- First, ensure uuid extension is enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create vendor_suggestions table
CREATE TABLE IF NOT EXISTS vendor_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL,
  
  -- Customer requirements
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
  
  -- Package details
  package_type VARCHAR(50),
  package_name VARCHAR(255),
  package_description TEXT,
  
  -- Pricing
  initial_price INT,
  admin_adjusted_price INT,
  final_price INT,
  discount_amount INT DEFAULT 0,
  discount_reason TEXT,
  
  -- Customization
  customizations JSONB,
  admin_notes TEXT,
  
  -- Slot/Schedule
  event_date DATE,
  event_time VARCHAR(50),
  event_duration VARCHAR(50),
  setup_time VARCHAR(50),
  slot_confirmed BOOLEAN DEFAULT FALSE,
  
  -- Status tracking
  status VARCHAR(50) DEFAULT 'pending_admin_review',
  
  -- Admin workflow
  reviewed_by VARCHAR(255),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  finalized_by VARCHAR(255),
  finalized_at TIMESTAMP WITH TIME ZONE,
  
  -- Customer workflow
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

-- Create trigger for updated_at (if function exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
    DROP TRIGGER IF EXISTS update_vendor_suggestions_updated_at ON vendor_suggestions;
    CREATE TRIGGER update_vendor_suggestions_updated_at 
      BEFORE UPDATE ON vendor_suggestions
      FOR EACH ROW 
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

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
```

---

## Verification Steps

After running the SQL:

### 1. Check Table Exists
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'vendor_suggestions';
```

Should return: `vendor_suggestions`

### 2. Check Columns
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'vendor_suggestions'
ORDER BY ordinal_position;
```

Should show all columns including `initial_price`

### 3. Check RLS Policies
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'vendor_suggestions';
```

Should show 4 policies (SELECT, INSERT, UPDATE, DELETE)

### 4. Test Insert
```sql
INSERT INTO vendor_suggestions (
  customer_name,
  customer_phone,
  budget,
  guest_count,
  city,
  theme,
  initial_price,
  status
) VALUES (
  'Test Customer',
  '9876543210',
  15000,
  30,
  'Dehradun',
  'Cartoon',
  10000,
  'pending_admin_review'
);
```

Should succeed without errors.

### 5. Test Select
```sql
SELECT * FROM vendor_suggestions;
```

Should return the test record.

---

## After Database Setup

Once the table is created:

1. **Refresh Your App**
   - Go back to your browser
   - Refresh the page (Ctrl/Cmd + R)

2. **Test Form Submission**
   - Go to `http://localhost:3000/plan`
   - Fill out the form
   - Submit

3. **Check Admin Panel**
   - Go to `http://localhost:3000/admin`
   - Click "Vendor Suggestions" tab
   - You should see your suggestion!

---

## Troubleshooting

### Error: "relation vendor_suggestions does not exist"
**Solution:** The table wasn't created. Run the SQL script again.

### Error: "column initial_price does not exist"
**Solution:** The table exists but is missing columns. Drop and recreate:
```sql
DROP TABLE IF EXISTS vendor_suggestions CASCADE;
-- Then run the full CREATE TABLE script again
```

### Error: "permission denied"
**Solution:** Check RLS policies are created correctly.

### Error: "foreign key constraint"
**Solution:** Make sure the `vendors` table exists first. If not, remove the REFERENCES constraints:
```sql
-- Change this:
vendor_1_id UUID REFERENCES vendors(id) ON DELETE SET NULL,

-- To this:
vendor_1_id UUID,
```

---

## Quick Fix Script

If you want to drop and recreate everything:

```sql
-- Drop existing table (if any)
DROP TABLE IF EXISTS vendor_suggestions CASCADE;

-- Then run the full CREATE TABLE script from above
```

---

## Need Help?

If you're still having issues:

1. **Check Supabase Connection**
   - Verify your `.env.local` has correct Supabase credentials
   - Test connection: `SELECT NOW();` in SQL Editor

2. **Check Server Logs**
   - Look at terminal running `npm run dev`
   - Check for Supabase connection errors

3. **Check Browser Console**
   - Open DevTools (F12)
   - Look for API errors
   - Check Network tab for failed requests

---

## Summary

**The Fix:**
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy and paste the SQL script above
4. Click Run
5. Verify table created
6. Refresh your app
7. Test form submission

That's it! The vendor suggestions feature will work once the table is created. 🚀
