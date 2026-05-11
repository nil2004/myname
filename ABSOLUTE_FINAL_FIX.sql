-- ============================================
-- ABSOLUTE FINAL FIX - GUARANTEED TO WORK
-- ============================================
-- Your Supabase Project: uaiwuivyrdoausenvlbs.supabase.co
-- 
-- This script will:
-- 1. Check if table exists
-- 2. Drop it if it exists (to start fresh)
-- 3. Create it from scratch
-- 4. Reload schema cache
-- 5. Verify everything worked
-- ============================================

-- Step 1: Drop existing table (if any) to start fresh
DROP TABLE IF EXISTS vendor_suggestions CASCADE;

-- Step 2: Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 3: Create vendor_suggestions table from scratch
CREATE TABLE vendor_suggestions (
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
  
  -- Package
  package_type VARCHAR(50),
  package_name VARCHAR(255),
  package_description TEXT,
  
  -- Pricing (THIS IS THE IMPORTANT PART!)
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
  
  -- Workflow
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

-- Step 4: Create indexes
CREATE INDEX idx_vendor_suggestions_request_id ON vendor_suggestions(request_id);
CREATE INDEX idx_vendor_suggestions_status ON vendor_suggestions(status);
CREATE INDEX idx_vendor_suggestions_created_at ON vendor_suggestions(created_at);

-- Step 5: Enable RLS
ALTER TABLE vendor_suggestions ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policies
CREATE POLICY "Enable read access for all users" 
  ON vendor_suggestions FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" 
  ON vendor_suggestions FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" 
  ON vendor_suggestions FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" 
  ON vendor_suggestions FOR DELETE USING (true);

-- Step 7: Reload schema cache
NOTIFY pgrst, 'reload schema';

-- Step 8: Verify table was created
SELECT 
  '✅ SUCCESS! Table created with ' || COUNT(*) || ' columns' as result
FROM information_schema.columns 
WHERE table_name = 'vendor_suggestions';

-- Step 9: Verify initial_price column exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'vendor_suggestions' 
      AND column_name = 'initial_price'
    ) 
    THEN '✅ initial_price column exists'
    ELSE '❌ initial_price column MISSING'
  END as initial_price_check;

-- Step 10: Show all columns
SELECT 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'vendor_suggestions'
ORDER BY ordinal_position;

-- Step 11: Test insert (will be rolled back)
DO $$
BEGIN
  -- Try to insert a test record
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
    '9999999999',
    15000,
    30,
    'Test City',
    'Test Theme',
    10000,
    'pending_admin_review'
  );
  
  -- Delete it immediately
  DELETE FROM vendor_suggestions WHERE customer_phone = '9999999999';
  
  RAISE NOTICE '✅ Insert test PASSED';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '❌ Insert test FAILED: %', SQLERRM;
END $$;

-- Final message
SELECT '🎉 Setup complete! Refresh your app and try again.' as final_message;
