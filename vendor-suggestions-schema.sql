-- ============================================
-- Vendor Suggestions System - Hybrid Model
-- ============================================
-- This table stores vendor suggestions for customer requests
-- Supports both automatic AI matching and manual admin override

-- Create vendor_suggestions table
CREATE TABLE IF NOT EXISTS vendor_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL, -- Links to requests table
  
  -- Customer requirements (from form)
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
  add_ons TEXT[], -- Array of selected add-ons (Restaurant, Cake, Decoration, etc.)
  specifications TEXT, -- Special requirements from customer
  
  -- Suggested vendors (3 choices)
  vendor_1_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
  vendor_1_name VARCHAR(255),
  vendor_1_category VARCHAR(50),
  vendor_1_price INT,
  vendor_1_auto_matched BOOLEAN DEFAULT TRUE, -- TRUE if AI matched, FALSE if manually selected
  
  vendor_2_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
  vendor_2_name VARCHAR(255),
  vendor_2_category VARCHAR(50),
  vendor_2_price INT,
  vendor_2_auto_matched BOOLEAN DEFAULT TRUE,
  
  vendor_3_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
  vendor_3_name VARCHAR(255),
  vendor_3_category VARCHAR(50),
  vendor_3_price INT,
  vendor_3_auto_matched BOOLEAN DEFAULT TRUE,
  
  -- Package details (customized by admin)
  package_type VARCHAR(50), -- "essential", "premium", "custom"
  package_name VARCHAR(255), -- Custom package name set by admin
  package_description TEXT, -- Custom description
  
  -- Pricing (set by admin)
  initial_price INT, -- AI calculated price
  admin_adjusted_price INT, -- Admin can adjust the price
  final_price INT, -- Final price after all adjustments
  discount_amount INT DEFAULT 0,
  discount_reason TEXT,
  
  -- Customization & Tweaks (by admin)
  customizations JSONB, -- Store custom line items, upgrades, etc.
  admin_notes TEXT, -- Admin can add notes about customizations
  
  -- Slot/Schedule (set by admin)
  event_date DATE,
  event_time VARCHAR(50),
  event_duration VARCHAR(50), -- e.g., "4 hours"
  setup_time VARCHAR(50), -- e.g., "2 hours before"
  slot_confirmed BOOLEAN DEFAULT FALSE,
  
  -- Status tracking
  status VARCHAR(50) DEFAULT 'pending_admin_review', 
  -- Statuses:
  -- 'pending_admin_review' - Customer submitted, waiting for admin
  -- 'admin_customizing' - Admin is working on it
  -- 'waiting_customer_approval' - Admin finalized, waiting for customer to see
  -- 'customer_approved' - Customer approved, ready for payment
  -- 'payment_pending' - Waiting for payment
  -- 'payment_completed' - Payment done
  -- 'confirmed' - Booking confirmed
  -- 'cancelled' - Cancelled
  
  -- Admin workflow
  reviewed_by VARCHAR(255), -- Admin who reviewed/modified
  reviewed_at TIMESTAMP WITH TIME ZONE,
  finalized_by VARCHAR(255), -- Admin who finalized pricing
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

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_vendor_suggestions_updated_at ON vendor_suggestions;
CREATE TRIGGER update_vendor_suggestions_updated_at 
  BEFORE UPDATE ON vendor_suggestions
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

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

-- ============================================
-- Sample data for testing
-- ============================================
-- This will be populated automatically when customers submit requests
