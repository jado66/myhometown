import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const {
      email,
      entries,
      period_type,
      period_start_date,
      period_end_date,
      entry_method,
    } = await request.json();

    if (!email || !entries || !Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json(
        { error: "Email and entries array are required" },
        { status: 400 }
      );
    }

    // Verify the missionary exists
    const { data: missionary, error: missionaryError } = await supabase
      .from("missionaries")
      .select("email, id")
      .eq("email", email)
      .single();

    if (missionaryError || !missionary) {
      return NextResponse.json(
        { error: "Missionary not found" },
        { status: 404 }
      );
    }

    // Generate bulk entry ID for grouping
    const bulkEntryId = crypto.randomUUID();

    // Prepare entries for insertion
    const insertEntries = entries.map((entry: any) => ({
      missionary_email: email,
      date: entry.date,
      hours: Number.parseFloat(entry.hours),
      activity_description: entry.activity_description,
      category: entry.category || "general",
      location: entry.location || "",
      created_by: missionary.id,
      bulk_entry_id: bulkEntryId,
      period_type: period_type || "day",
      period_start_date: period_start_date,
      period_end_date: period_end_date,
      entry_method: entry_method || "manual",
    }));

    const { data, error } = await supabase
      .from("missionary_hours")
      .insert(insertEntries)
      .select();

    if (error) {
      console.error("Bulk insert error:", error);
      return NextResponse.json(
        { error: "Failed to log bulk hours" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      bulk_entry_id: bulkEntryId,
      entries_created: data.length,
    });
  } catch (error) {
    console.error("Bulk hours API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const bulkEntryId = searchParams.get("bulk_entry_id");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    let query = supabase
      .from("bulk_entry_summary")
      .select("*")
      .eq("missionary_email", email)
      .order("created_at", { ascending: false });

    if (bulkEntryId) {
      query = query.eq("bulk_entry_id", bulkEntryId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Fetch bulk entries error:", error);
      return NextResponse.json(
        { error: "Failed to fetch bulk entries" },
        { status: 500 }
      );
    }

    return NextResponse.json({ bulk_entries: data });
  } catch (error) {
    console.error("Bulk entries GET API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
