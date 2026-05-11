import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const phone: string = (body.phone ?? "").replace(/\D/g, "");

    if (phone.length < 10) {
      return NextResponse.json(
        { error: "Please provide a valid 10-digit phone number." },
        { status: 400 }
      );
    }

    // Check if phone already exists
    const { data: existing } = await supabase
      .from("waitlist")
      .select("phone")
      .eq("phone", phone)
      .single();

    if (existing) {
      return NextResponse.json(
        { message: "You're already on the waitlist!" },
        { status: 200 }
      );
    }

    // Insert new waitlist entry
    const { error } = await supabase
      .from("waitlist")
      .insert({ phone });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to add to waitlist. Please try again." },
        { status: 500 }
      );
    }

    // Get total count
    const { count } = await supabase
      .from("waitlist")
      .select("*", { count: "exact", head: true });

    return NextResponse.json(
      { message: "Added to waitlist successfully!", total: count || 0 },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Admin endpoint — add auth before exposing in production
    const { count, error } = await supabase
      .from("waitlist")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "Failed to fetch waitlist count" }, { status: 500 });
    }

    return NextResponse.json({ count: count || 0 });
  } catch (err) {
    console.error("Error:", err);
    return NextResponse.json({ error: "Failed to fetch waitlist count" }, { status: 500 });
  }
}
