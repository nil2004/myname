-- ============================================
-- CREATE VENDOR SUGGESTIONS TABLE ONLY
-- ============================================
-- Run this if you already ran COMPLETE_DATABASE_SETUP.sql
-- but vendor_suggestions table is still missing
-- ============================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing table if you want to recreate it
-- DROP TABLE IF EXISTS vendor_suggestions CASCADE;

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

-- Verify table was created
SELECT 
  'vendor_suggestions table created successfully!' as message,
  COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'vendor_suggestions';

-- Show all columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'vendor_suggestions'
ORDER BY ordinal_position;
