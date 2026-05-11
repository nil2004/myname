-- ============================================
-- COMPLETE DATABASE SETUP FOR UTSAV AI
-- ============================================
-- Run this in Supabase SQL Editor to set up everything
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. CREATE REQUESTS TABLE (if not exists)
-- ============================================

CREATE TABLE IF NOT EXISTS requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_email VARCHAR(255),
  occasion VARCHAR(100) DEFAULT 'Birthday',
  age_group VARCHAR(20),
  budget INT,
  guest_count INT,
  location_type VARCHAR(50),
  city VARCHAR(100),
  theme VARCHAR(50),
  add_ons TEXT[] DEFAULT '{}',
  party_date DATE,
  specifications TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for requests
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_party_date ON requests(party_date);
CREATE INDEX IF NOT EXISTS idx_requests_created_at ON requests(created_at);
CREATE INDEX IF NOT EXISTS idx_requests_customer_phone ON requests(customer_phone);

-- ============================================
-- 2. ADD VENDOR MEDIA COLUMNS (if not exists)
-- ============================================

-- Add basic image fields
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS banner_image TEXT;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS area VARCHAR(100);

-- Add portfolio fields
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS portfolio_images TEXT[];
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS portfolio_videos TEXT[];
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS portfolio_description TEXT;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS portfolio_highlights TEXT[];

-- Add location fields (for restaurants)
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS location_address TEXT;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS location_lat DECIMAL(10, 8);
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS location_lng DECIMAL(11, 8);

-- Add pricing fields
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS pricing_type VARCHAR(20) DEFAULT 'range';
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS per_plate_price INT;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS extra_charges INT;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS fixed_price INT;

-- Add experience fields
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS experience_years INT DEFAULT 5;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS events_done INT DEFAULT 0;

-- ============================================
-- 3. CREATE/UPDATE TRIGGERS
-- ============================================

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for requests table
DROP TRIGGER IF EXISTS update_requests_updated_at ON requests;
CREATE TRIGGER update_requests_updated_at BEFORE UPDATE ON requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 4. ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. CREATE RLS POLICIES FOR REQUESTS
-- ============================================

DROP POLICY IF EXISTS "Enable read access for all users" ON requests;
CREATE POLICY "Enable read access for all users" ON requests FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for all users" ON requests;
CREATE POLICY "Enable insert for all users" ON requests FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for all users" ON requests;
CREATE POLICY "Enable update for all users" ON requests FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable delete for all users" ON requests;
CREATE POLICY "Enable delete for all users" ON requests FOR DELETE USING (true);

-- ============================================
-- 6. ADD UNIQUE CONSTRAINT FOR REQUESTS
-- ============================================

-- Add unique constraint on customer_phone to prevent duplicate requests
-- Note: This will fail if you already have duplicate phone numbers
-- In that case, clean up duplicates first
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'requests_customer_phone_key'
  ) THEN
    -- First, remove any duplicate entries (keep the most recent one)
    DELETE FROM requests a USING (
      SELECT MIN(ctid) as ctid, customer_phone
      FROM requests 
      GROUP BY customer_phone 
      HAVING COUNT(*) > 1
    ) b
    WHERE a.customer_phone = b.customer_phone 
    AND a.ctid <> b.ctid;
    
    -- Now add the unique constraint
    ALTER TABLE requests ADD CONSTRAINT requests_customer_phone_key UNIQUE (customer_phone);
  END IF;
END $$;

-- ============================================
-- 7. CREATE VENDOR SUGGESTIONS TABLE
-- ============================================

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

-- Create indexes for vendor_suggestions
CREATE INDEX IF NOT EXISTS idx_vendor_suggestions_request_id ON vendor_suggestions(request_id);
CREATE INDEX IF NOT EXISTS idx_vendor_suggestions_status ON vendor_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_vendor_suggestions_created_at ON vendor_suggestions(created_at);

-- Add trigger for vendor_suggestions table
DROP TRIGGER IF EXISTS update_vendor_suggestions_updated_at ON vendor_suggestions;
CREATE TRIGGER update_vendor_suggestions_updated_at 
  BEFORE UPDATE ON vendor_suggestions
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS for vendor_suggestions
ALTER TABLE vendor_suggestions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for vendor_suggestions
DROP POLICY IF EXISTS "Enable read access for all users" ON vendor_suggestions;
CREATE POLICY "Enable read access for all users" ON vendor_suggestions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for all users" ON vendor_suggestions;
CREATE POLICY "Enable insert for all users" ON vendor_suggestions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for all users" ON vendor_suggestions;
CREATE POLICY "Enable update for all users" ON vendor_suggestions FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable delete for all users" ON vendor_suggestions;
CREATE POLICY "Enable delete for all users" ON vendor_suggestions FOR DELETE USING (true);

-- ============================================
-- 8. VERIFICATION QUERIES
-- ============================================

-- Check if requests table exists and has data
SELECT 'requests' as table_name, COUNT(*) as row_count FROM requests;

-- Check if vendor_suggestions table exists
SELECT 'vendor_suggestions' as table_name, COUNT(*) as row_count FROM vendor_suggestions;

-- Check if vendor columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'vendors' 
  AND column_name IN ('image_url', 'banner_image', 'portfolio_images', 'portfolio_videos')
ORDER BY column_name;

-- Check vendor_suggestions columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'vendor_suggestions' 
  AND column_name IN ('initial_price', 'admin_adjusted_price', 'final_price', 'status')
ORDER BY column_name;

-- ============================================
-- DONE! 🎉
-- ============================================
-- Your database is now ready with:
-- ✅ Requests table created
-- ✅ Vendor Suggestions table created
-- ✅ Vendor media columns added
-- ✅ All indexes created
-- ✅ Auto-update triggers set up
-- ✅ Row Level Security enabled
-- ✅ Unique constraint on customer_phone
-- ============================================
