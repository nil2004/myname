import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    // Test 1: Check environment variables
    const envCheck = {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      keyPrefix: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + "...",
    };

    // Test 2: Try to connect to Supabase
    const { data, error } = await supabase
      .from("vendors")
      .select("count")
      .limit(1);

    if (error) {
      return NextResponse.json({
        success: false,
        message: "Supabase connection failed",
        envCheck,
        error: error.message,
        details: error,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Supabase connection successful!",
      envCheck,
      data,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: "Test failed",
      error: error.message,
    }, { status: 500 });
  }
}
