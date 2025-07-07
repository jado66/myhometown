import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: { email: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const missionaryEmail = params.email;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!missionaryEmail) {
      return NextResponse.json(
        { error: "Missionary email is required" },
        { status: 400 }
      );
    }

    // Verify the missionary exists
    const { data: missionary, error: missionaryError } = await supabase
      .from("missionaries") // Adjust table name as needed
      .select("email")
      .eq("email", missionaryEmail)
      .single();

    if (missionaryError || !missionary) {
      return NextResponse.json(
        { error: "Missionary not found" },
        { status: 404 }
      );
    }

    let query = supabase
      .from("missionary_hours")
      .select("*")
      .eq("missionary_email", missionaryEmail)
      .order("date", { ascending: false });

    if (startDate) {
      query = query.gte("date", startDate);
    }
    if (endDate) {
      query = query.lte("date", endDate);
    }

    const { data: hours, error } = await query;

    if (error) {
      console.error("Fetch hours error:", error);
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
