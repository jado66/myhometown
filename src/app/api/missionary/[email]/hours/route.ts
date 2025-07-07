import { type NextRequest, NextResponse } from "next/server";
import { MissionaryAuth } from "@/util/missionaries/missionary-auth";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest, { params }) {
  const { email } = params;

  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let query = supabase
      .from("missionary_hours")
      .select("*")
      .eq("missionary_email", email)
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
    const cookieStore = cookies();
    const sessionToken = cookieStore.get("missionary_session")?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const missionary = await MissionaryAuth.getCurrentMissionary(sessionToken);
    if (!missionary) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { date, hours, activity_description, category, location } =
      await request.json();

    if (!date || !hours || !activity_description) {
      return NextResponse.json(
        { error: "Date, hours, and activity description are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("missionary_hours")
      .insert({
        missionary_id: missionary.id,
        date,
        hours: Number.parseFloat(hours),
        activity_description,
        category: category || "general",
        location: location || "",
        created_by: missionary.id,
        approval_status: "pending",
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
