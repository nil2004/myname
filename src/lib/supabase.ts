import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export type Database = {
  public: {
    Tables: {
      vendors: {
        Row: {
          id: string;
          name: string;
          category: string;
          rating: number;
          review_count: number;
          price_min: number;
          price_max: number;
          city: string;
          verified: boolean;
          tags: string[];
          image_emoji: string;
          // Basic image fields
          image_url: string | null;
          banner_image: string | null;
          description: string | null;
          area: string | null;
          // Portfolio fields
          portfolio_images: string[] | null;
          portfolio_videos: string[] | null;
          portfolio_description: string | null;
          portfolio_highlights: string[] | null;
          // Location fields (for restaurants)
          location_address: string | null;
          location_lat: number | null;
          location_lng: number | null;
          // Pricing fields
          pricing_type: string | null;
          per_plate_price: number | null;
          extra_charges: number | null;
          fixed_price: number | null;
          // Experience fields
          experience_years: number | null;
          events_done: number | null;
          // Timestamps
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['vendors']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['vendors']['Insert']>;
      };
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string;
          role: string;
          status: string;
          joined_at: string;
          last_active: string;
          orders_count: number;
          total_spent: number;
          city: string;
          verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'joined_at' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      events: {
        Row: {
          id: string;
          title: string;
          customer_name: string;
          date: string;
          time: string;
          location: string;
          city: string;
          theme: string;
          guest_count: number;
          budget: number;
          status: string;
          vendors: string[];
          notes: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['events']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['events']['Insert']>;
      };
      orders: {
        Row: {
          id: string;
          customer_name: string;
          customer_phone: string;
          customer_email: string | null;
          occasion: string;
          date: string;
          time: string;
          city: string;
          theme: string;
          total: number;
          paid_amount: number;
          due_amount: number;
          status: string;
          vendors: any;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['orders']['Insert']>;
      };
      waitlist: {
        Row: {
          id: string;
          phone: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['waitlist']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['waitlist']['Insert']>;
      };
      partners: {
        Row: {
          id: string;
          name: string;
          logo: string;
          category: string;
          description: string;
          website: string;
          featured: boolean;
          display_order: number;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['partners']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['partners']['Insert']>;
      };
      requests: {
        Row: {
          id: string;
          customer_name: string;
          customer_phone: string;
          customer_email: string | null;
          occasion: string;
          age_group: string | null;
          budget: number | null;
          guest_count: number | null;
          location_type: string | null;
          city: string | null;
          theme: string | null;
          add_ons: string[];
          party_date: string | null;
          specifications: string | null;
          status: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['requests']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['requests']['Insert']>;
      };
    };
  };
};

// Helper type for vendor from database
export type Vendor = Database['public']['Tables']['vendors']['Row'];
