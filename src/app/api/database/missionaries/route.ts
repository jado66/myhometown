import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { data: missionaries, error } = await supabase
      .from("missionaries")
      .select(
        `
        *,
        cities (name, state, country),
        communities (name)
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch missionaries error:", error);
      return NextResponse.json(
        { error: "Failed to fetch missionaries" },
        { status: 500 }
      );
    }

    return NextResponse.json({ missionaries });
  } catch (error) {
    console.error("Missionaries API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      first_name,
      last_name,
      city_id,
      community_id,
      assignment_status,
      contact_number,
      notes,
    } = body;

    if (!email || !first_name || !last_name) {
      return NextResponse.json(
        { error: "Email, first name, and last name are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("missionaries")
      .insert({
        email,
        first_name,
        last_name,
        city_id: city_id || null,
        community_id: community_id || null,
        assignment_status: assignment_status || "active",
        contact_number: contact_number || null,
        notes: notes || "",
      })
      .select()
      .single();

    if (error) {
      console.error("Create missionary error:", error);
      return NextResponse.json(
        { error: "Failed to create missionary" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Create missionary API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
