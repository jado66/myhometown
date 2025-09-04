import { type NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/util/supabaseServer";

export async function GET(
  request: NextRequest,
  { params }: { params: { email: string } }
) {
  try {
    const email = params.email;
    if (!email) {
      return NextResponse.json(
        { error: "Missionary email is required" },
        { status: 400 }
      );
    }

    // First, get the missionary's ID from their email
    const { data: missionary, error: missionaryError } = await supabaseServer
      .from("missionaries")
      .select("id")
      .eq("email", email)
      .single();

    if (missionaryError || !missionary) {
      return NextResponse.json(
        { error: "Missionary not found" },
        { status: 404 }
      );
    }

    // Then, fetch all hour entries for that missionary ID
    const { data: hours, error: hoursError } = await supabaseServer
      .from("missionary_hours")
      .select("*")
      .eq("missionary_id", missionary.id)
      .order("period_start_date", { ascending: false });

    if (hoursError) {
      console.error("Fetch hours error:", hoursError);
      return NextResponse.json(
        { error: "Failed to fetch hours" },
        { status: 500 }
      );
    }

    return NextResponse.json({ hours });
  } catch (error) {
    console.error("Hours API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
