-- ============================================
-- ADD GALLERY AND TESTIMONIALS TABLES
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Create event_gallery table for Real Event Looks
CREATE TABLE IF NOT EXISTS event_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Event details
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL, -- 'birthday', 'wedding', 'corporate', etc.
  event_date DATE,
  location TEXT,
  
  -- Images (array of image URLs)
  images TEXT[] NOT NULL DEFAULT '{}',
  
  -- Associated vendor (optional)
  vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
  vendor_name TEXT,
  
  -- Categories/tags
  tags TEXT[] DEFAULT '{}', -- ['decoration', 'venue', 'cake', 'theme-cartoon', etc.]
  theme TEXT, -- 'Cartoon', 'Romantic', 'Luxury', 'Surprise'
  
  -- Visibility
  featured BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT DEFAULT 'admin'
);

-- 2. Create client_testimonials table for Client Stories
CREATE TABLE IF NOT EXISTS client_testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Client details
  client_name TEXT NOT NULL,
  client_image TEXT, -- Profile photo URL
  event_type TEXT NOT NULL, -- 'birthday', 'wedding', etc.
  event_date DATE,
  
  -- Review content
  review_text TEXT NOT NULL,
  rating NUMERIC(2,1) CHECK (rating >= 0 AND rating <= 5),
  
  -- Video testimonial
  video_url TEXT, -- YouTube, Vimeo, or direct video URL
  video_thumbnail TEXT, -- Thumbnail image URL
  
  -- Associated vendor (optional)
  vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
  vendor_name TEXT,
  
  -- Visibility
  featured BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT DEFAULT 'admin'
);

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_event_gallery_event_type ON event_gallery(event_type);
CREATE INDEX IF NOT EXISTS idx_event_gallery_vendor_id ON event_gallery(vendor_id);
CREATE INDEX IF NOT EXISTS idx_event_gallery_featured ON event_gallery(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_event_gallery_published ON event_gallery(published) WHERE published = true;
CREATE INDEX IF NOT EXISTS idx_event_gallery_tags ON event_gallery USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_client_testimonials_event_type ON client_testimonials(event_type);
CREATE INDEX IF NOT EXISTS idx_client_testimonials_vendor_id ON client_testimonials(vendor_id);
CREATE INDEX IF NOT EXISTS idx_client_testimonials_featured ON client_testimonials(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_client_testimonials_published ON client_testimonials(published) WHERE published = true;
CREATE INDEX IF NOT EXISTS idx_client_testimonials_rating ON client_testimonials(rating DESC);

-- 4. Create updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Add triggers for updated_at
DROP TRIGGER IF EXISTS update_event_gallery_updated_at ON event_gallery;
CREATE TRIGGER update_event_gallery_updated_at
  BEFORE UPDATE ON event_gallery
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_client_testimonials_updated_at ON client_testimonials;
CREATE TRIGGER update_client_testimonials_updated_at
  BEFORE UPDATE ON client_testimonials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 6. Enable Row Level Security (RLS)
ALTER TABLE event_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_testimonials ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies (allow public read, admin write)
-- Public can read published items
DROP POLICY IF EXISTS "Public can view published gallery items" ON event_gallery;
CREATE POLICY "Public can view published gallery items"
  ON event_gallery FOR SELECT
  USING (published = true);

DROP POLICY IF EXISTS "Public can view published testimonials" ON client_testimonials;
CREATE POLICY "Public can view published testimonials"
  ON client_testimonials FOR SELECT
  USING (published = true);

-- Admin can do everything (adjust based on your auth setup)
DROP POLICY IF EXISTS "Admin can manage gallery" ON event_gallery;
CREATE POLICY "Admin can manage gallery"
  ON event_gallery FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can manage testimonials" ON client_testimonials;
CREATE POLICY "Admin can manage testimonials"
  ON client_testimonials FOR ALL
  USING (true)
  WITH CHECK (true);

-- 8. Insert sample data for testing
INSERT INTO event_gallery (title, description, event_type, images, tags, theme, featured) VALUES
(
  'Magical Cartoon Birthday Party',
  'A vibrant cartoon-themed birthday celebration with colorful decorations and fun activities for kids.',
  'birthday',
  ARRAY[
    'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800',
    'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800',
    'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800'
  ],
  ARRAY['decoration', 'kids', 'cartoon', 'balloons', 'colorful'],
  'Cartoon',
  true
),
(
  'Elegant Romantic Dinner Setup',
  'Beautiful romantic dinner setup with candles, flowers, and elegant table decorations.',
  'birthday',
  ARRAY[
    'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800',
    'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800'
  ],
  ARRAY['decoration', 'romantic', 'candles', 'flowers', 'elegant'],
  'Romantic',
  true
);

INSERT INTO client_testimonials (client_name, event_type, review_text, rating, video_url, featured) VALUES
(
  'Priya Sharma',
  'birthday',
  'Utsav AI made my daughter''s birthday party absolutely magical! The vendor recommendations were perfect, and everything was within our budget. Highly recommended!',
  5.0,
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  true
),
(
  'Rahul Verma',
  'birthday',
  'Amazing service! The AI matched us with the perfect vendors for our son''s cartoon-themed party. The decorations were stunning and the food was delicious.',
  4.8,
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  true
);

-- 9. Reload schema cache
NOTIFY pgrst, 'reload schema';

-- 10. Verify tables created
SELECT 
  'event_gallery' as table_name,
  COUNT(*) as row_count
FROM event_gallery
UNION ALL
SELECT 
  'client_testimonials' as table_name,
  COUNT(*) as row_count
FROM client_testimonials;

SELECT '✅ Gallery and Testimonials tables created successfully!' as message;
