import { type NextRequest, NextResponse } from "next/server";
import moment from "moment";
import { supabaseServer } from "@/util/supabaseServer";

export async function POST(request: NextRequest) {
  try {
    const {
      email,

      date,
      total_hours,
      activities,
      location,
      updatePreference,
    } = await request.json();

    if (
      !email ||
      !date ||
      total_hours === undefined ||
      total_hours === null ||
      activities === undefined ||
      activities === null
    ) {
      return NextResponse.json(
        {
          error: `Missing required fields: ${!email ? "email " : ""}${
            !date ? "date " : ""
          }${
            total_hours === undefined || total_hours === null
              ? "total_hours "
              : ""
          }${
            activities === undefined || activities === null ? "activities" : ""
          }`,
        },
        { status: 400 }
      );
    }

    // 1. Verify missionary and get their ID
    const { data: missionary, error: missionaryError } = await supabaseServer
      .from("missionaries")
      .select("id, preferred_entry_method")
      .eq("email", email)
      .single();

    if (missionaryError || !missionary) {
      return NextResponse.json(
        { error: `Missionary not found: ${email}` },
        { status: 404 }
      );
    }

    // 2. Insert the new hours log (allow multiple entries for same month/day)
    const periodStartDate = moment(date).startOf("month").format("YYYY-MM-DD");
    const { data: newEntry, error: insertError } = await supabaseServer
      .from("missionary_hours")
      .insert({
        missionary_id: missionary.id,
        period_start_date: periodStartDate,
        entry_method: "monthly",
        total_hours: Number(total_hours),
        activities: activities, // This is the JSONB field
        location: location || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert hours error:", insertError);
      return NextResponse.json(
        { error: "Failed to log hours" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: newEntry });
  } catch (error) {
    console.error("Hours POST API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
