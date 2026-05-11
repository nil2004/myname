-- ============================================
-- ADD TRUSTED PARTNERS TABLE
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Create trusted_partners table
CREATE TABLE IF NOT EXISTS trusted_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Partner details
  name TEXT NOT NULL,
  logo TEXT DEFAULT '🎉', -- Emoji or image URL
  category TEXT NOT NULL, -- 'Decorators', 'Photography', 'Cakes', etc.
  description TEXT,
  website TEXT,
  
  -- Display settings
  featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_trusted_partners_status ON trusted_partners(status);
CREATE INDEX IF NOT EXISTS idx_trusted_partners_featured ON trusted_partners(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_trusted_partners_display_order ON trusted_partners(display_order);
CREATE INDEX IF NOT EXISTS idx_trusted_partners_category ON trusted_partners(category);

-- 3. Create updated_at trigger
DROP TRIGGER IF EXISTS update_trusted_partners_updated_at ON trusted_partners;
CREATE TRIGGER update_trusted_partners_updated_at
  BEFORE UPDATE ON trusted_partners
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 4. Enable Row Level Security (RLS)
ALTER TABLE trusted_partners ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies
-- Public can read active partners
DROP POLICY IF EXISTS "Public can view active partners" ON trusted_partners;
CREATE POLICY "Public can view active partners"
  ON trusted_partners FOR SELECT
  USING (status = 'active');

-- Admin can do everything
DROP POLICY IF EXISTS "Admin can manage partners" ON trusted_partners;
CREATE POLICY "Admin can manage partners"
  ON trusted_partners FOR ALL
  USING (true)
  WITH CHECK (true);

-- 6. Insert sample data
INSERT INTO trusted_partners (name, logo, category, description, website, featured, display_order) VALUES
('Celebrations by Riya', '🎨', 'Decorators', 'Premium decoration services for all occasions', 'https://example.com', true, 1),
('Happy Moments Studio', '📸', 'Photography', 'Professional event photography and videography', 'https://example.com', true, 2),
('Sweetie''s Cake House', '🎂', 'Cakes', 'Custom designer cakes for every celebration', 'https://example.com', true, 3),
('Magic Moments', '🎭', 'Entertainment', 'Fun activities and entertainment for kids', 'https://example.com', true, 4),
('Party Perfect', '🍽️', 'Catering', 'Delicious food and catering services', 'https://example.com', false, 5),
('Balloon Bliss', '🎈', 'Balloons', 'Creative balloon decorations and installations', 'https://example.com', false, 6),
('Snap & Smile', '📷', 'Photography', 'Candid photography specialists', 'https://example.com', false, 7),
('Sweet Treats', '🍰', 'Desserts', 'Gourmet desserts and sweet tables', 'https://example.com', false, 8);

-- 7. Reload schema cache
NOTIFY pgrst, 'reload schema';

-- 8. Verify table created
SELECT 
  'trusted_partners' as table_name,
  COUNT(*) as row_count
FROM trusted_partners;

SELECT '✅ Trusted Partners table created successfully!' as message;
