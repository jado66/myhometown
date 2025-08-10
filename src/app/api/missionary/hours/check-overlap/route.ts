import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import moment from "moment";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { email, entryMethod, date } = await request.json();

    if (!email || !entryMethod || !date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get missionary ID
    const { data: missionary } = await supabase
      .from("missionaries")
      .select("id")
      .eq("email", email)
      .single();

    if (!missionary) {
      return NextResponse.json(
        { error: "Missionary not found" },
        { status: 404 }
      );
    }

    // Convert entryMethod to proper moment unit and calculate period start
    const momentUnit = entryMethod === "weekly" ? "week" : "month";
    const periodStartDate = moment(date)
      .startOf(momentUnit)
      .format("YYYY-MM-DD");

    console.log("Checking overlap for:", {
      missionary_id: missionary.id,
      period_start_date: periodStartDate,
      entry_method: entryMethod,
      original_date: date,
    });

    // Check for existing entry
    const { data: existingEntry, error } = await supabase
      .from("missionary_hours")
      .select("id, period_start_date, entry_method")
      .eq("missionary_id", missionary.id)
      .eq("period_start_date", periodStartDate)
      .eq("entry_method", entryMethod)
      .maybeSingle();

    if (error) {
      console.error("Overlap check error:", error);
      return NextResponse.json(
        { error: "Failed to check for overlap" },
        { status: 500 }
      );
    }

    console.log("Existing entry found:", existingEntry);

    return NextResponse.json({
      overlap: !!existingEntry,
      existingEntry: existingEntry || null,
      calculatedPeriodStart: periodStartDate,
    });
  } catch (error) {
    console.error("Overlap check API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
