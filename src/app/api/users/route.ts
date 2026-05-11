import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export type UserRole = "customer" | "vendor" | "admin";
export type UserStatus = "active" | "suspended" | "pending";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  joined_at: string;
  last_active: string;
  orders_count: number;
  total_spent: number;
  city: string;
  verified: boolean;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role") as UserRole | null;
    const status = searchParams.get("status") as UserStatus | null;

    let query = supabase.from("users").select("*");

    if (role) query = query.eq("role", role);
    if (status) query = query.eq("status", status);

    const { data: users, error } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ users: users || [], total: users?.length || 0 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: Partial<User> = await req.json();
    
    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          name: body.name || "",
          email: body.email || "",
          phone: body.phone || "",
          role: body.role || "customer",
          status: body.status || "pending",
          last_active: new Date().toISOString(),
          orders_count: 0,
          total_spent: 0,
          city: body.city || "Dehradun",
          verified: false,
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
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body: User = await req.json();

    const { data, error } = await supabase
      .from("users")
      .update({
        name: body.name,
        email: body.email,
        phone: body.phone,
        role: body.role,
        status: body.status,
        last_active: new Date().toISOString(),
        orders_count: body.orders_count,
        total_spent: body.total_spent,
        city: body.city,
        verified: body.verified,
      })
      .eq("id", body.id)
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const { error } = await supabase.from("users").delete().eq("id", id);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
