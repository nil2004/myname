import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// This endpoint creates the vendor_suggestions table if it doesn't exist
export async function POST(req: NextRequest) {
  try {
    // SQL to create vendor_suggestions table
    const createTableSQL = `
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
    `;

    // Execute the SQL using Supabase RPC or direct query
    // Note: This requires admin privileges
    const { data, error } = await supabase.rpc('exec_sql', { sql: createTableSQL });

    if (error) {
      console.error("Error creating table:", error);
      return NextResponse.json(
        { 
          error: "Failed to create table. Please run the SQL manually in Supabase Dashboard.",
          details: error.message,
          instructions: "Go to Supabase Dashboard → SQL Editor → Run COMPLETE_DATABASE_SETUP.sql"
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "vendor_suggestions table created successfully!",
    });
  } catch (error: any) {
    console.error("Setup error:", error);
    return NextResponse.json(
      {
        error: "Setup failed",
        message: error.message,
        instructions: "Please run COMPLETE_DATABASE_SETUP.sql manually in Supabase Dashboard"
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check if table exists
export async function GET(req: NextRequest) {
  try {
    // Try to query the table
    const { data, error } = await supabase
      .from("vendor_suggestions")
      .select("id")
      .limit(1);

    if (error) {
      if (error.message.includes("does not exist") || error.code === "PGRST204") {
        return NextResponse.json({
          exists: false,
          message: "vendor_suggestions table does not exist",
          instructions: "Run POST /api/setup-database or manually execute COMPLETE_DATABASE_SETUP.sql in Supabase"
        });
      }
      
      return NextResponse.json({
        exists: false,
        error: error.message
      });
    }

    return NextResponse.json({
      exists: true,
      message: "vendor_suggestions table exists and is accessible"
    });
  } catch (error: any) {
    return NextResponse.json({
      exists: false,
      error: error.message
    });
  }
}
