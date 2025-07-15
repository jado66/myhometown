import { type NextRequest, NextResponse } from "next/server";
import moment from "moment";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
export async function POST(request: NextRequest) {
  try {
    const {
      email,
      entryMethod,
      date,
      totalHours,
      activities,
      location,
      updatePreference,
    } = await request.json();

    if (!email || !entryMethod || !date || !totalHours || !activities) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 1. Verify missionary and get their ID
    const { data: missionary, error: missionaryError } = await supabase
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

    // 2. Insert the new hours log
    const periodStartDate = moment(date)
      .startOf(entryMethod)
      .format("YYYY-MM-DD");
    const { data: newEntry, error: insertError } = await supabase
      .from("missionary_hours")
      .insert({
        missionary_id: missionary.id,
        period_start_date: periodStartDate,
        entry_method: entryMethod,
        total_hours: Number(totalHours),
        activities: activities, // This is the JSONB field
        location: location || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert hours error:", insertError);
      // Handle unique constraint violation
      if (insertError.code === "23505") {
        return NextResponse.json(
          { error: "An entry for this period already exists." },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "Failed to log hours" },
        { status: 500 }
      );
    }

    // 3. Update user's preference if needed
    if (updatePreference && missionary.preferred_entry_method !== entryMethod) {
      const { error: preferenceError } = await supabase
        .from("missionaries")
        .update({ preferred_entry_method: entryMethod })
        .eq("id", missionary.id);

      if (preferenceError) {
        // Log the error but don't fail the request, as the main task (logging hours) succeeded.
        console.error("Failed to update preference:", preferenceError);
      }
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
