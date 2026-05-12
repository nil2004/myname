"use client";

import { useState, useEffect } from "react";

export default function SetupPage() {
  const [status, setStatus] = useState<{
    checking: boolean;
    tableExists: boolean;
    error: string | null;
    message: string;
  }>({
    checking: true,
    tableExists: false,
    error: null,
    message: "Checking database status...",
  });

  useEffect(() => {
    checkDatabaseStatus();
  }, []);

  async function checkDatabaseStatus() {
    try {
      const response = await fetch("/api/setup-database");
      const data = await response.json();

      setStatus({
        checking: false,
        tableExists: data.exists || false,
        error: data.error || null,
        message: data.message || "",
      });
    } catch (error: any) {
      setStatus({
        checking: false,
        tableExists: false,
        error: error.message,
        message: "Failed to check database status",
      });
    }
  }

  function copySQL() {
    const sql = `-- CREATE VENDOR SUGGESTIONS TABLE
-- Copy and paste this into Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS vendor_suggestions (
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

CREATE INDEX IF NOT EXISTS idx_vendor_suggestions_request_id ON vendor_suggestions(request_id);
CREATE INDEX IF NOT EXISTS idx_vendor_suggestions_status ON vendor_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_vendor_suggestions_created_at ON vendor_suggestions(created_at);

ALTER TABLE vendor_suggestions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON vendor_suggestions;
CREATE POLICY "Enable read access for all users" ON vendor_suggestions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for all users" ON vendor_suggestions;
CREATE POLICY "Enable insert for all users" ON vendor_suggestions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for all users" ON vendor_suggestions;
CREATE POLICY "Enable update for all users" ON vendor_suggestions FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable delete for all users" ON vendor_suggestions;
CREATE POLICY "Enable delete for all users" ON vendor_suggestions FOR DELETE USING (true);

-- Verify it worked
SELECT 'Table created successfully!' as message, COUNT(*) as columns 
FROM information_schema.columns WHERE table_name = 'vendor_suggestions';`;

    navigator.clipboard.writeText(sql);
    alert("✅ SQL copied to clipboard!\n\nNow:\n1. Go to Supabase Dashboard\n2. Click SQL Editor\n3. Click New Query\n4. Paste (Ctrl/Cmd + V)\n5. Click Run\n6. Come back and refresh this page");
  }

  return (
    <div className="min-h-screen bg-[var(--cream)] p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-playfair font-bold text-4xl mb-2">Database Setup</h1>
          <p className="text-[var(--text-muted)]">
            Check and fix your database configuration
          </p>
        </div>

        {/* Status Card */}
        <div className="bg-white border border-[var(--border)] rounded-[20px] p-8 shadow-[0_4px_24px_rgba(26,15,46,0.06)] mb-6">
          <div className="flex items-start gap-4">
            <div className="text-4xl">
              {status.checking ? "⏳" : status.tableExists ? "✅" : "❌"}
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-xl mb-2">
                {status.checking
                  ? "Checking Database..."
                  : status.tableExists
                    ? "Database Ready!"
                    : "Database Setup Required"}
              </h2>
              <p className="text-[var(--text-muted)] mb-4">{status.message}</p>

              {status.error && (
                <div className="p-4 bg-[rgba(255,122,89,0.08)] border border-[rgba(255,122,89,0.20)] rounded-xl mb-4">
                  <div className="font-medium text-[var(--coral)] mb-1">Error:</div>
                  <div className="text-sm text-[var(--text-muted)]">{status.error}</div>
                </div>
              )}

              {!status.checking && !status.tableExists && (
                <div className="space-y-4">
                  <div className="p-4 bg-[rgba(255,200,87,0.08)] border border-[rgba(255,200,87,0.20)] rounded-xl">
                    <div className="font-medium mb-2">⚠️ Action Required</div>
                    <div className="text-sm text-[var(--text-muted)]">
                      The <code className="px-2 py-1 bg-[var(--cream)] rounded">vendor_suggestions</code> table
                      doesn&apos;t exist in your Supabase database.
                    </div>
                  </div>

                  <button
                    onClick={copySQL}
                    className="w-full px-6 py-3 rounded-xl bg-[var(--purple)] text-white font-medium hover:bg-[var(--purple-light)] transition-colors"
                  >
                    📋 Copy SQL to Clipboard
                  </button>
                </div>
              )}

              {!status.checking && status.tableExists && (
                <div className="p-4 bg-[rgba(29,158,117,0.08)] border border-[rgba(29,158,117,0.20)] rounded-xl">
                  <div className="font-medium text-[#1D9E75] mb-1">✅ All Good!</div>
                  <div className="text-sm text-[var(--text-muted)]">
                    Your database is properly configured. Vendor suggestions will work correctly.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        {!status.checking && !status.tableExists && (
          <div className="bg-white border border-[var(--border)] rounded-[20px] p-8 shadow-[0_4px_24px_rgba(26,15,46,0.06)]">
            <h3 className="font-bold text-lg mb-4">📖 Setup Instructions</h3>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--purple)] text-white flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <div className="font-medium mb-1">Click &quot;Copy SQL to Clipboard&quot; above</div>
                  <div className="text-sm text-[var(--text-muted)]">
                    This will copy the SQL script needed to create the table
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--purple)] text-white flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <div className="font-medium mb-1">Open Supabase Dashboard</div>
                  <div className="text-sm text-[var(--text-muted)] mb-2">
                    Go to{" "}
                    <a
                      href="https://supabase.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--purple)] hover:underline"
                    >
                      supabase.com
                    </a>{" "}
                    and sign in to your project
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--purple)] text-white flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <div className="font-medium mb-1">Go to SQL Editor</div>
                  <div className="text-sm text-[var(--text-muted)]">
                    Click &quot;SQL Editor&quot; in the left sidebar, then &quot;New query&quot;
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--purple)] text-white flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <div className="font-medium mb-1">Paste and Run</div>
                  <div className="text-sm text-[var(--text-muted)]">
                    Paste the SQL (Ctrl/Cmd + V) and click &quot;Run&quot; or press Ctrl/Cmd + Enter
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--purple)] text-white flex items-center justify-center font-bold">
                  5
                </div>
                <div>
                  <div className="font-medium mb-1">Refresh This Page</div>
                  <div className="text-sm text-[var(--text-muted)]">
                    Come back here and refresh to verify the setup
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-[var(--border)]">
              <button
                onClick={checkDatabaseStatus}
                className="px-6 py-2.5 rounded-xl border border-[var(--border)] font-medium hover:border-[var(--purple)] hover:bg-[rgba(107,63,160,0.05)] transition-colors"
              >
                🔄 Check Status Again
              </button>
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="mt-6 flex gap-4">
          <a
            href="/"
            className="px-6 py-2.5 rounded-xl border border-[var(--border)] font-medium hover:border-[var(--purple)] transition-colors"
          >
            ← Back to Home
          </a>
          <a
            href="/admin"
            className="px-6 py-2.5 rounded-xl border border-[var(--border)] font-medium hover:border-[var(--purple)] transition-colors"
          >
            Go to Admin Panel →
          </a>
        </div>
      </div>
    </div>
  );
}
