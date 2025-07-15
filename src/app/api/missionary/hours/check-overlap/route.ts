import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
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

    const periodStartDate = moment(date)
      .startOf(entryMethod)
      .format("YYYY-MM-DD");

    const { data: existingEntry, error } = await supabase
      .from("missionary_hours")
      .select("id")
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

    return NextResponse.json({ overlap: !!existingEntry });
  } catch (error) {
    console.error("Overlap check API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
