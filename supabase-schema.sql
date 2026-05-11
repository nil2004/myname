-- Utsav AI Database Schema for Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Vendors Table
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  rating DECIMAL(2,1) DEFAULT 4.5,
  review_count INT DEFAULT 0,
  price_min INT NOT NULL,
  price_max INT NOT NULL,
  city VARCHAR(100) NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  tags TEXT[] DEFAULT '{}',
  image_emoji VARCHAR(10) DEFAULT '🎨',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) DEFAULT 'customer',
  status VARCHAR(20) DEFAULT 'active',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  orders_count INT DEFAULT 0,
  total_spent INT DEFAULT 0,
  city VARCHAR(100) DEFAULT 'Dehradun',
  verified BOOLEAN DEFAULT FALSE
);

-- Events Table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  time VARCHAR(20) NOT NULL,
  location VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  theme VARCHAR(50) NOT NULL,
  guest_count INT DEFAULT 0,
  budget INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'upcoming',
  vendors TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_email VARCHAR(255),
  occasion VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  time VARCHAR(20) NOT NULL,
  city VARCHAR(100) NOT NULL,
  theme VARCHAR(50) NOT NULL,
  total INT NOT NULL,
  paid_amount INT DEFAULT 0,
  due_amount INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'Booked',
  vendors JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Waitlist Table
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone VARCHAR(20) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vendors_category ON vendors(category);
CREATE INDEX IF NOT EXISTS idx_vendors_city ON vendors(city);
CREATE INDEX IF NOT EXISTS idx_vendors_verified ON vendors(verified);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(date);

-- Insert seed data for vendors
INSERT INTO vendors (name, category, rating, review_count, price_min, price_max, city, verified, tags, image_emoji) VALUES
  ('Celebrations by Riya', 'decorator', 4.9, 142, 7000, 15000, 'Dehradun', true, ARRAY['balloon', 'theme', 'floral'], '🎨'),
  ('Dream Decor Studio', 'decorator', 4.7, 89, 5000, 12000, 'Dehradun', true, ARRAY['budget-friendly', 'cartoon', 'kids'], '🎈'),
  ('Luxury Events Co', 'decorator', 4.8, 67, 12000, 25000, 'Dehradun', true, ARRAY['luxury', 'premium', 'elegant'], '✨'),
  ('Balloon Magic', 'decorator', 4.6, 134, 4000, 9000, 'Dehradun', false, ARRAY['balloon', 'colorful', 'kids'], '🎈'),
  
  ('Happy Moments Studio', 'photographer', 4.8, 98, 5000, 12000, 'Dehradun', true, ARRAY['photos', 'video', 'reels'], '📸'),
  ('Capture Life Photography', 'photographer', 4.9, 156, 8000, 18000, 'Dehradun', true, ARRAY['candid', 'cinematic', 'drone'], '📷'),
  ('Budget Clicks', 'photographer', 4.5, 72, 3000, 7000, 'Dehradun', true, ARRAY['affordable', 'basic', 'photos'], '📱'),
  ('Pro Lens Studio', 'photographer', 4.7, 103, 6000, 14000, 'Dehradun', false, ARRAY['professional', 'editing', 'album'], '🎥'),
  
  ('Sweetie''s Cake House', 'cake', 4.7, 211, 1500, 6000, 'Dehradun', true, ARRAY['custom', 'theme', 'fondant'], '🎂'),
  ('Cake Studio Deluxe', 'cake', 4.9, 187, 2500, 8000, 'Dehradun', true, ARRAY['premium', '3D', 'designer'], '🍰'),
  ('Home Baker''s Delight', 'cake', 4.6, 94, 800, 3000, 'Dehradun', true, ARRAY['homemade', 'fresh', 'budget'], '🧁'),
  ('Royal Cakes & Pastries', 'cake', 4.8, 145, 2000, 7000, 'Dehradun', true, ARRAY['eggless', 'custom', 'delivery'], '🎂'),
  
  ('Party Beats DJ', 'dj', 4.6, 55, 4000, 10000, 'Dehradun', true, ARRAY['kids', 'bollywood', 'games'], '🎵'),
  ('DJ Rockstar Events', 'dj', 4.8, 78, 6000, 15000, 'Dehradun', true, ARRAY['professional', 'lights', 'sound'], '🎧'),
  ('Music Mania DJ', 'dj', 4.5, 42, 3000, 8000, 'Dehradun', false, ARRAY['budget', 'bollywood', 'retro'], '🎶'),
  ('Elite Sound Systems', 'dj', 4.9, 91, 8000, 20000, 'Dehradun', true, ARRAY['premium', 'LED', 'karaoke'], '🎤'),
  
  ('Magic Wonders', 'entertainment', 4.8, 73, 3000, 8000, 'Dehradun', true, ARRAY['magician', 'clown', 'games'], '🎪'),
  ('Fun Factory Entertainment', 'entertainment', 4.7, 65, 4000, 10000, 'Dehradun', true, ARRAY['games', 'activities', 'kids'], '🎭'),
  ('Clown Around', 'entertainment', 4.6, 58, 2500, 6000, 'Dehradun', true, ARRAY['clown', 'balloon-art', 'face-paint'], '🤡'),
  ('Puppet Show Masters', 'entertainment', 4.5, 41, 2000, 5000, 'Dehradun', false, ARRAY['puppets', 'storytelling', 'kids'], '🎎'),
  
  ('Yummy Bites Catering', 'catering', 4.5, 89, 5000, 20000, 'Dehradun', true, ARRAY['snacks', 'food stalls', 'veg'], '🍕'),
  ('Tasty Treats Kitchen', 'catering', 4.7, 112, 6000, 25000, 'Dehradun', true, ARRAY['buffet', 'live-counter', 'veg-nonveg'], '🍽️'),
  ('Street Food Express', 'catering', 4.6, 76, 4000, 15000, 'Dehradun', true, ARRAY['chaat', 'street-food', 'budget'], '🌮'),
  ('Premium Feast Catering', 'catering', 4.8, 94, 10000, 40000, 'Dehradun', true, ARRAY['luxury', 'multi-cuisine', 'service'], '🍱')
ON CONFLICT DO NOTHING;

-- Insert seed data for users
INSERT INTO users (name, email, phone, role, status, orders_count, total_spent, city, verified) VALUES
  ('Priya Sharma', 'priya@email.com', '+91 98765 43210', 'customer', 'active', 3, 52000, 'Dehradun', true),
  ('Rahul Verma', 'rahul.v@email.com', '+91 98123 45678', 'customer', 'active', 1, 32000, 'Dehradun', true),
  ('Celebrations by Riya', 'riya@celebrations.com', '+91 97654 32109', 'vendor', 'active', 42, 0, 'Dehradun', true),
  ('Anjali Gupta', 'anjali.g@email.com', '+91 96543 21098', 'customer', 'active', 2, 48500, 'Dehradun', false),
  ('Amit Kumar', 'amit@email.com', '+91 95432 10987', 'customer', 'pending', 0, 0, 'Dehradun', false)
ON CONFLICT DO NOTHING;

-- Insert seed data for events
INSERT INTO events (title, customer_name, date, time, location, city, theme, guest_count, budget, status, vendors, notes) VALUES
  ('Aarav''s 5th Birthday', 'Priya Sharma', '2026-05-15', '6:00 PM', 'Home', 'Dehradun', 'Cartoon', 30, 18500, 'upcoming', ARRAY['Dream Decor Studio', 'Sweetie''s Cake House', 'Happy Moments Studio'], 'Kids party, need extra balloons'),
  ('Neha''s 25th Birthday Bash', 'Rahul Verma', '2026-05-10', '8:00 PM', 'Restaurant', 'Dehradun', 'Luxury', 50, 32000, 'upcoming', ARRAY['Luxury Events Co', 'Cake Studio Deluxe', 'DJ Rockstar Events'], 'Premium setup required'),
  ('Anniversary Celebration', 'Anjali Gupta', '2026-04-29', '7:00 PM', 'Home', 'Dehradun', 'Romantic', 20, 24500, 'ongoing', ARRAY['Celebrations by Riya', 'Royal Cakes & Pastries'], 'Intimate gathering'),
  ('Kids Birthday Party', 'Meera Singh', '2026-04-20', '4:00 PM', 'City Park', 'Dehradun', 'Cartoon', 40, 22000, 'completed', ARRAY['Balloon Magic', 'Home Baker''s Delight', 'Fun Factory Entertainment'], 'Outdoor setup')
ON CONFLICT DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (you can modify these based on your needs)
CREATE POLICY "Enable read access for all users" ON vendors FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON users FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON events FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON orders FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON waitlist FOR SELECT USING (true);

-- Create policies for insert/update/delete (currently open, add auth later)
CREATE POLICY "Enable insert for all users" ON vendors FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON vendors FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON vendors FOR DELETE USING (true);

CREATE POLICY "Enable insert for all users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON users FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON users FOR DELETE USING (true);

CREATE POLICY "Enable insert for all users" ON events FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON events FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON events FOR DELETE USING (true);

CREATE POLICY "Enable insert for all users" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON orders FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON orders FOR DELETE USING (true);

CREATE POLICY "Enable insert for all users" ON waitlist FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON waitlist FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON waitlist FOR DELETE USING (true);
