import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export interface EventGallery {
  id: string;
  title: string;
  description?: string;
  event_type: string;
  event_date?: string;
  location?: string;
  images: string[];
  vendor_id?: string;
  vendor_name?: string;
  tags: string[];
  theme?: string;
  featured: boolean;
  published: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  created_by: string;
}

// GET - Fetch all gallery items
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventType = searchParams.get("eventType");
    const featured = searchParams.get("featured");
    const theme = searchParams.get("theme");
    const published = searchParams.get("published") !== "false"; // Default to true

    let query = supabase
      .from("event_gallery")
      .select("*")
      .eq("published", published)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (eventType) query = query.eq("event_type", eventType);
    if (featured === "true") query = query.eq("featured", true);
    if (theme) query = query.eq("theme", theme);

    const { data: gallery, error } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ gallery: gallery || [], total: gallery?.length || 0 });
  } catch (error) {
    console.error("Error fetching gallery:", error);
    return NextResponse.json({ error: "Failed to fetch gallery" }, { status: 500 });
  }
}

// POST - Create new gallery item
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { data, error } = await supabase
      .from("event_gallery")
      .insert([
        {
          title: body.title,
          description: body.description,
          event_type: body.eventType,
          event_date: body.eventDate,
          location: body.location,
          images: body.images || [],
          vendor_id: body.vendorId,
          vendor_name: body.vendorName,
          tags: body.tags || [],
          theme: body.theme,
          featured: body.featured || false,
          published: body.published !== false, // Default to true
          display_order: body.displayOrder || 0,
          created_by: body.createdBy || "admin",
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
    console.error("Error creating gallery item:", error);
    return NextResponse.json({ error: "Failed to create gallery item" }, { status: 500 });
  }
}

// PUT - Update gallery item
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.eventType !== undefined) updateData.event_type = body.eventType;
    if (body.eventDate !== undefined) updateData.event_date = body.eventDate;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.images !== undefined) updateData.images = body.images;
    if (body.vendorId !== undefined) updateData.vendor_id = body.vendorId;
    if (body.vendorName !== undefined) updateData.vendor_name = body.vendorName;
    if (body.tags !== undefined) updateData.tags = body.tags;
    if (body.theme !== undefined) updateData.theme = body.theme;
    if (body.featured !== undefined) updateData.featured = body.featured;
    if (body.published !== undefined) updateData.published = body.published;
    if (body.displayOrder !== undefined) updateData.display_order = body.displayOrder;

    const { data, error } = await supabase
      .from("event_gallery")
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
    console.error("Error updating gallery item:", error);
    return NextResponse.json({ error: "Failed to update gallery item" }, { status: 500 });
  }
}

// DELETE - Delete gallery item
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Gallery item ID required" }, { status: 400 });
    }

    const { error } = await supabase.from("event_gallery").delete().eq("id", id);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting gallery item:", error);
    return NextResponse.json({ error: "Failed to delete gallery item" }, { status: 500 });
  }
}
