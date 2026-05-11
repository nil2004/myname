import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export interface Partner {
  id: string;
  name: string;
  logo: string;
  category: string;
  description: string;
  website: string;
  featured: boolean;
  display_order: number;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

// GET - Fetch all partners
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const featured = searchParams.get("featured");
    const status = searchParams.get("status") || "active";

    let query = supabase
      .from("trusted_partners")
      .select("*")
      .eq("status", status)
      .order("display_order", { ascending: true });

    if (featured === "true") {
      query = query.eq("featured", true);
    }

    const { data: partners, error } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ partners: partners || [], total: partners?.length || 0 });
  } catch (error) {
    console.error("Error fetching partners:", error);
    return NextResponse.json({ error: "Failed to fetch partners" }, { status: 500 });
  }
}

// POST - Create new partner
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { data, error } = await supabase
      .from("trusted_partners")
      .insert([
        {
          name: body.name,
          logo: body.logo || "🎉",
          category: body.category,
          description: body.description,
          website: body.website,
          featured: body.featured || false,
          display_order: body.displayOrder || 0,
          status: body.status || "active",
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating partner:", error);
    return NextResponse.json({ error: "Failed to create partner" }, { status: 500 });
  }
}

// PUT - Update partner
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (body.name !== undefined) updateData.name = body.name;
    if (body.logo !== undefined) updateData.logo = body.logo;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.website !== undefined) updateData.website = body.website;
    if (body.featured !== undefined) updateData.featured = body.featured;
    if (body.displayOrder !== undefined) updateData.display_order = body.displayOrder;
    if (body.status !== undefined) updateData.status = body.status;

    const { data, error } = await supabase
      .from("trusted_partners")
      .update(updateData)
      .eq("id", body.id)
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating partner:", error);
    return NextResponse.json({ error: "Failed to update partner" }, { status: 500 });
  }
}

// DELETE - Delete partner
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Partner ID required" }, { status: 400 });
    }

    const { error } = await supabase.from("trusted_partners").delete().eq("id", id);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting partner:", error);
    return NextResponse.json({ error: "Failed to delete partner" }, { status: 500 });
  }
}
