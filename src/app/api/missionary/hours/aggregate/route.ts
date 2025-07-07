import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Get aggregate hours data for all missionaries
    const { data: hoursData, error } = await supabase.rpc(
      "get_missionary_hours_aggregate"
    );

    if (error) {
      console.error("Aggregate hours error:", error);
      return NextResponse.json(
        { error: "Failed to fetch aggregate hours" },
        { status: 500 }
      );
    }

    return NextResponse.json({ hours: hoursData || [] });
  } catch (error) {
    console.error("Aggregate hours API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
