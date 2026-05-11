-- ============================================
-- RELOAD SUPABASE SCHEMA CACHE
-- ============================================
-- This fixes the PGRST204 error:
-- "Could not find the 'initial_price' column in the schema cache"
-- ============================================

-- Step 1: Reload the schema cache
NOTIFY pgrst, 'reload schema';

-- Step 2: Verify the table exists
SELECT 
  table_name,
  COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'vendor_suggestions'
GROUP BY table_name;

-- Step 3: Verify the initial_price column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'vendor_suggestions' 
AND column_name = 'initial_price';

-- Step 4: If table doesn't exist, create it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'vendor_suggestions'
  ) THEN
    -- Create the table
    CREATE TABLE vendor_suggestions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      request_id UUID NOT NULL,
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
      vendor_1_id UUID,
      vendor_1_name VARCHAR(255),
      vendor_1_category VARCHAR(50),
      vendor_1_price INT,
      vendor_1_auto_matched BOOLEAN DEFAULT TRUE,
      vendor_2_id UUID,
      vendor_2_name VARCHAR(255),
      vendor_2_category VARCHAR(50),
      vendor_2_price INT,
      vendor_2_auto_matched BOOLEAN DEFAULT TRUE,
      vendor_3_id UUID,
      vendor_3_name VARCHAR(255),
      vendor_3_category VARCHAR(50),
      vendor_3_price INT,
      vendor_3_auto_matched BOOLEAN DEFAULT TRUE,
      package_type VARCHAR(50),
      package_name VARCHAR(255),
      package_description TEXT,
      initial_price INT,
      admin_adjusted_price INT,
      final_price INT,
      discount_amount INT DEFAULT 0,
      discount_reason TEXT,
      customizations JSONB,
      admin_notes TEXT,
      event_date DATE,
      event_time VARCHAR(50),
      event_duration VARCHAR(50),
      setup_time VARCHAR(50),
      slot_confirmed BOOLEAN DEFAULT FALSE,
      status VARCHAR(50) DEFAULT 'pending_admin_review',
      reviewed_by VARCHAR(255),
      reviewed_at TIMESTAMP WITH TIME ZONE,
      finalized_by VARCHAR(255),
      finalized_at TIMESTAMP WITH TIME ZONE,
      sent_to_customer_at TIMESTAMP WITH TIME ZONE,
      customer_viewed_at TIMESTAMP WITH TIME ZONE,
      customer_approved_at TIMESTAMP WITH TIME ZONE,
      payment_method VARCHAR(50),
      payment_status VARCHAR(50),
      payment_id VARCHAR(255),
      paid_amount INT DEFAULT 0,
      paid_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE INDEX idx_vendor_suggestions_request_id ON vendor_suggestions(request_id);
    CREATE INDEX idx_vendor_suggestions_status ON vendor_suggestions(status);
    CREATE INDEX idx_vendor_suggestions_created_at ON vendor_suggestions(created_at);

    ALTER TABLE vendor_suggestions ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Enable read access for all users" ON vendor_suggestions FOR SELECT USING (true);
    CREATE POLICY "Enable insert for all users" ON vendor_suggestions FOR INSERT WITH CHECK (true);
    CREATE POLICY "Enable update for all users" ON vendor_suggestions FOR UPDATE USING (true);
    CREATE POLICY "Enable delete for all users" ON vendor_suggestions FOR DELETE USING (true);

    RAISE NOTICE 'vendor_suggestions table created';
  ELSE
    RAISE NOTICE 'vendor_suggestions table already exists';
  END IF;
END $$;

-- Step 5: Reload schema cache again
NOTIFY pgrst, 'reload schema';

-- Step 6: Final verification
SELECT 
  'Setup complete!' as message,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'vendor_suggestions') as table_exists,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'vendor_suggestions') as column_count;
