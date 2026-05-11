import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export type EventStatus = "upcoming" | "ongoing" | "completed" | "cancelled";

export interface Event {
  id: string;
  title: string;
  customerName: string;
  date: string;
  time: string;
  location: string;
  city: string;
  theme: string;
  guestCount: number;
  budget: number;
  status: EventStatus;
  vendors: string[];
  notes: string;
}

// Helper to convert DB row to Event interface
function dbRowToEvent(row: any): Event {
  return {
    id: row.id,
    title: row.title,
    customerName: row.customer_name,
    date: row.date,
    time: row.time,
    location: row.location,
    city: row.city,
    theme: row.theme,
    guestCount: row.guest_count,
    budget: row.budget,
    status: row.status,
    vendors: row.vendors || [],
    notes: row.notes || "",
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") as EventStatus | null;

    let query = supabase.from("events").select("*").order("date", { ascending: true });

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
    }

    const events = (data || []).map(dbRowToEvent);
    return NextResponse.json({ events, total: events.length });
  } catch (err) {
    console.error("Error:", err);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: Partial<Event> = await req.json();

    const { data, error } = await supabase
      .from("events")
      .insert({
        title: body.title || "",
        customer_name: body.customerName || "",
        date: body.date || "",
        time: body.time || "",
        location: body.location || "Home",
        city: body.city || "Dehradun",
        theme: body.theme || "Cartoon",
        guest_count: body.guestCount || 0,
        budget: body.budget || 0,
        status: body.status || "upcoming",
        vendors: body.vendors || [],
        notes: body.notes || "",
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
    }

    return NextResponse.json(dbRowToEvent(data), { status: 201 });
  } catch (err) {
    console.error("Error:", err);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body: Event = await req.json();

    const { data, error } = await supabase
      .from("events")
      .update({
        title: body.title,
        customer_name: body.customerName,
        date: body.date,
        time: body.time,
        location: body.location,
        city: body.city,
        theme: body.theme,
        guest_count: body.guestCount,
        budget: body.budget,
        status: body.status,
        vendors: body.vendors,
        notes: body.notes,
      })
      .eq("id", body.id)
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "Event not found or update failed" }, { status: 404 });
    }

    return NextResponse.json(dbRowToEvent(data));
  } catch (err) {
    console.error("Error:", err);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}
