import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export type RequestStatus = "pending" | "in-progress" | "resolved" | "rejected";

export interface PlanRequest {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  occasion: string;
  ageGroup?: string;
  budget?: number;
  guestCount?: number;
  locationType?: string;
  city?: string;
  theme?: string;
  addOns: string[];
  partyDate?: string;
  specifications?: string;
  status: RequestStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Helper to convert DB row to PlanRequest interface
function dbRowToRequest(row: any): PlanRequest {
  return {
    id: row.id,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerEmail: row.customer_email || undefined,
    occasion: row.occasion || "Birthday",
    ageGroup: row.age_group || undefined,
    budget: row.budget || undefined,
    guestCount: row.guest_count || undefined,
    locationType: row.location_type || undefined,
    city: row.city || undefined,
    theme: row.theme || undefined,
    addOns: row.add_ons || [],
    partyDate: row.party_date || undefined,
    specifications: row.specifications || undefined,
    status: row.status || "pending",
    notes: row.notes || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    let query = supabase
      .from("requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
    }

    const requests = (data || []).map(dbRowToRequest);
    return NextResponse.json({ requests, total: requests.length });
  } catch (err) {
    console.error("Error:", err);
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: Partial<PlanRequest> = await req.json();

    // Check if a request already exists with same phone number (ignore name)
    const { data: existingRequest, error: checkError } = await supabase
      .from("requests")
      .select("*")
      .eq("customer_phone", body.customerPhone || "")
      .single();

    // If request exists, update it instead of creating new one
    if (existingRequest && !checkError) {
      const { data, error } = await supabase
        .from("requests")
        .update({
          customer_name: body.customerName || existingRequest.customer_name,
          customer_email: body.customerEmail || null,
          occasion: body.occasion || "Birthday",
          age_group: body.ageGroup || null,
          budget: body.budget || null,
          guest_count: body.guestCount || null,
          location_type: body.locationType || null,
          city: body.city || null,
          theme: body.theme || null,
          add_ons: body.addOns || [],
          party_date: body.partyDate || null,
          specifications: body.specifications || null,
          notes: body.notes || null,
          // Keep existing status, don't reset to pending
        })
        .eq("id", existingRequest.id)
        .select()
        .single();

      if (error) {
        console.error("Supabase error:", error);
        return NextResponse.json({ error: "Failed to update request" }, { status: 500 });
      }

      return NextResponse.json({
        ...dbRowToRequest(data),
        message: "Request updated successfully"
      }, { status: 200 });
    }

    // If no existing request, create new one
    const { data, error } = await supabase
      .from("requests")
      .insert({
        customer_name: body.customerName || "",
        customer_phone: body.customerPhone || "",
        customer_email: body.customerEmail || null,
        occasion: body.occasion || "Birthday",
        age_group: body.ageGroup || null,
        budget: body.budget || null,
        guest_count: body.guestCount || null,
        location_type: body.locationType || null,
        city: body.city || null,
        theme: body.theme || null,
        add_ons: body.addOns || [],
        party_date: body.partyDate || null,
        specifications: body.specifications || null,
        status: body.status || "pending",
        notes: body.notes || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "Failed to create request" }, { status: 500 });
    }

    return NextResponse.json({
      ...dbRowToRequest(data),
      message: "Request created successfully"
    }, { status: 201 });
  } catch (err) {
    console.error("Error:", err);
    return NextResponse.json({ error: "Failed to create request" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body: PlanRequest = await req.json();

    const { data, error } = await supabase
      .from("requests")
      .update({
        customer_name: body.customerName,
        customer_phone: body.customerPhone,
        customer_email: body.customerEmail || null,
        occasion: body.occasion,
        age_group: body.ageGroup || null,
        budget: body.budget || null,
        guest_count: body.guestCount || null,
        location_type: body.locationType || null,
        city: body.city || null,
        theme: body.theme || null,
        add_ons: body.addOns,
        party_date: body.partyDate || null,
        specifications: body.specifications || null,
        status: body.status,
        notes: body.notes || null,
      })
      .eq("id", body.id)
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "Request not found or update failed" }, { status: 404 });
    }

    return NextResponse.json(dbRowToRequest(data));
  } catch (err) {
    console.error("Error:", err);
    return NextResponse.json({ error: "Failed to update request" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Request ID is required" }, { status: 400 });
    }

    const { error } = await supabase.from("requests").delete().eq("id", id);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "Failed to delete request" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error:", err);
    return NextResponse.json({ error: "Failed to delete request" }, { status: 500 });
  }
}
