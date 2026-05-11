import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export type OrderStatus =
  | "Booked"
  | "Assigned"
  | "Vendors Confirmed"
  | "On the way"
  | "Setup started"
  | "Completed"
  | "Cancelled";

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  occasion: string;
  date: string;
  time: string;
  city: string;
  theme: string;
  total: number;
  paidAmount: number;
  dueAmount: number;
  status: OrderStatus;
  createdAt: string;
  vendors: { category: string; name: string; price?: number }[];
}

// Helper to convert DB row to Order interface
function dbRowToOrder(row: any): Order {
  return {
    id: row.id,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerEmail: row.customer_email || undefined,
    occasion: row.occasion,
    date: row.date,
    time: row.time,
    city: row.city,
    theme: row.theme,
    total: row.total,
    paidAmount: row.paid_amount,
    dueAmount: row.due_amount,
    status: row.status,
    createdAt: row.created_at,
    vendors: Array.isArray(row.vendors) ? row.vendors : [],
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    let query = supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }

    const orders = (data || []).map(dbRowToOrder);
    return NextResponse.json({ orders, total: orders.length });
  } catch (err) {
    console.error("Error:", err);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: Partial<Order> = await req.json();

    const { data, error } = await supabase
      .from("orders")
      .insert({
        customer_name: body.customerName || "",
        customer_phone: body.customerPhone || "",
        customer_email: body.customerEmail || null,
        occasion: body.occasion || "",
        date: body.date || "",
        time: body.time || "",
        city: body.city || "Dehradun",
        theme: body.theme || "",
        total: body.total || 0,
        paid_amount: body.paidAmount || 0,
        due_amount: body.dueAmount || 0,
        status: body.status || "Booked",
        vendors: body.vendors || [],
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }

    return NextResponse.json(dbRowToOrder(data), { status: 201 });
  } catch (err) {
    console.error("Error:", err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body: Order = await req.json();

    const { data, error } = await supabase
      .from("orders")
      .update({
        customer_name: body.customerName,
        customer_phone: body.customerPhone,
        customer_email: body.customerEmail || null,
        occasion: body.occasion,
        date: body.date,
        time: body.time,
        city: body.city,
        theme: body.theme,
        total: body.total,
        paid_amount: body.paidAmount,
        due_amount: body.dueAmount,
        status: body.status,
        vendors: body.vendors,
      })
      .eq("id", body.id)
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "Order not found or update failed" }, { status: 404 });
    }

    return NextResponse.json(dbRowToOrder(data));
  } catch (err) {
    console.error("Error:", err);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const { error } = await supabase.from("orders").delete().eq("id", id);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error:", err);
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
  }
}
