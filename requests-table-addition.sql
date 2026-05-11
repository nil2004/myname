-- Add Requests Table to Supabase
-- Run this SQL in Supabase SQL Editor to add the requests table

-- Requests Table
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_party_date ON requests(party_date);
CREATE INDEX IF NOT EXISTS idx_requests_created_at ON requests(created_at);

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_requests_updated_at ON requests;
CREATE TRIGGER update_requests_updated_at BEFORE UPDATE ON requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Enable read access for all users" ON requests;
CREATE POLICY "Enable read access for all users" ON requests FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for all users" ON requests;
CREATE POLICY "Enable insert for all users" ON requests FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for all users" ON requests;
CREATE POLICY "Enable update for all users" ON requests FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable delete for all users" ON requests;
CREATE POLICY "Enable delete for all users" ON requests FOR DELETE USING (true);

-- Verify table was created
SELECT 'requests' as table_name, COUNT(*) as row_count FROM requests;
