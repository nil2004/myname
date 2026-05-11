import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export interface ClientTestimonial {
  id: string;
  client_name: string;
  client_image?: string;
  event_type: string;
  event_date?: string;
  review_text: string;
  rating: number;
  video_url?: string;
  video_thumbnail?: string;
  vendor_id?: string;
  vendor_name?: string;
  featured: boolean;
  published: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  created_by: string;
}

// GET - Fetch all testimonials
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventType = searchParams.get("eventType");
    const featured = searchParams.get("featured");
    const minRating = searchParams.get("minRating");
    const published = searchParams.get("published") !== "false"; // Default to true

    let query = supabase
      .from("client_testimonials")
      .select("*")
      .eq("published", published)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (eventType) query = query.eq("event_type", eventType);
    if (featured === "true") query = query.eq("featured", true);
    if (minRating) query = query.gte("rating", parseFloat(minRating));

    const { data: testimonials, error } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ testimonials: testimonials || [], total: testimonials?.length || 0 });
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return NextResponse.json({ error: "Failed to fetch testimonials" }, { status: 500 });
  }
}

// POST - Create new testimonial
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { data, error } = await supabase
      .from("client_testimonials")
      .insert([
        {
          client_name: body.clientName,
          client_image: body.clientImage,
          event_type: body.eventType,
          event_date: body.eventDate,
          review_text: body.reviewText,
          rating: body.rating,
          video_url: body.videoUrl,
          video_thumbnail: body.videoThumbnail,
          vendor_id: body.vendorId,
          vendor_name: body.vendorName,
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
    console.error("Error creating testimonial:", error);
    return NextResponse.json({ error: "Failed to create testimonial" }, { status: 500 });
  }
}

// PUT - Update testimonial
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (body.clientName !== undefined) updateData.client_name = body.clientName;
    if (body.clientImage !== undefined) updateData.client_image = body.clientImage;
    if (body.eventType !== undefined) updateData.event_type = body.eventType;
    if (body.eventDate !== undefined) updateData.event_date = body.eventDate;
    if (body.reviewText !== undefined) updateData.review_text = body.reviewText;
    if (body.rating !== undefined) updateData.rating = body.rating;
    if (body.videoUrl !== undefined) updateData.video_url = body.videoUrl;
    if (body.videoThumbnail !== undefined) updateData.video_thumbnail = body.videoThumbnail;
    if (body.vendorId !== undefined) updateData.vendor_id = body.vendorId;
    if (body.vendorName !== undefined) updateData.vendor_name = body.vendorName;
    if (body.featured !== undefined) updateData.featured = body.featured;
    if (body.published !== undefined) updateData.published = body.published;
    if (body.displayOrder !== undefined) updateData.display_order = body.displayOrder;

    const { data, error } = await supabase
      .from("client_testimonials")
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
    console.error("Error updating testimonial:", error);
    return NextResponse.json({ error: "Failed to update testimonial" }, { status: 500 });
  }
}

// DELETE - Delete testimonial
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Testimonial ID required" }, { status: 400 });
    }

    const { error } = await supabase.from("client_testimonials").delete().eq("id", id);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting testimonial:", error);
    return NextResponse.json({ error: "Failed to delete testimonial" }, { status: 500 });
  }
}
