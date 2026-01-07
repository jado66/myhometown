import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { supabaseServer } from "@/util/supabaseServer";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    // Find missionary by using supabaseServer (case-insensitive email match)

    const { data: missionary, error } = await supabaseServer
      .from("missionaries")
      .select("*")
      .ilike("email", email)
      .eq("assignment_status", "active")
      .single();

    if (error) {
      console.error("supabaseServer error:", error);
      return NextResponse.json(
        { success: false, message: "Missionary not found or inactive" },
        { status: 404 }
      );
    }

    if (!missionary) {
      return NextResponse.json(
        { success: false, message: "Missionary not found or inactive" },
        { status: 404 }
      );
    }

    // Create a simple session token
    const sessionToken = crypto.randomUUID();

    // Set session cookie (expires in 5 minutes)
    const cookieStore = await cookies();
    cookieStore.set("missionary-session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",

      maxAge: 5 * 60, // 5 minutes
    });

    // Store session data (in production, use a database)
    // For demo purposes, we'll just return success

    return NextResponse.json({
      success: true,
      message: "Login successful",
      missionary: {
        id: missionary.id,
        email: missionary.email,
        first_name: missionary.first_name,
        last_name: missionary.last_name,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Login failed" },
      { status: 500 }
    );
  }
}
