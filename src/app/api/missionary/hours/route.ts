import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const missionaryEmail = searchParams.get("email");
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

export async function POST(request: NextRequest) {
  try {
    const { email, date, hours, activity_description, category, location } =
      await request.json();

    if (!email || !date || !hours || !activity_description) {
      // Figure out which fields are missing
      const missingFields = [];
      if (!email) missingFields.push("email");
      if (!date) missingFields.push("date");
      if (!hours) missingFields.push("hours");
      if (!activity_description) missingFields.push("activity_description");

      return NextResponse.json(
        {
          error: "Missing required fields: " + missingFields.join(", "),
        },
        { status: 400 }
      );
    }

    // Verify the missionary exists
    const { data: missionary, error: missionaryError } = await supabase
      .from("missionaries") // Adjust table name as needed
      .select("email, id")
      .eq("email", email)
      .single();

    if (missionaryError || !missionary) {
      return NextResponse.json(
        { error: `Missionary not found: ${email}` },
        { status: 404 }
      );
    }

    const { data, error } = await supabase
      .from("missionary_hours")
      .insert({
        missionary_email: email,
        date,
        hours: Number.parseFloat(hours),
        activity_description,
        category: category || "general",
        location: location || "",
        created_by: missionary.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Insert hours error:", error);
      return NextResponse.json(
        { error: "Failed to log hours" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Hours POST API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
