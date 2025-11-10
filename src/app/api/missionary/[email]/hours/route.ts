import { type NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/util/supabaseServer";

export async function GET(
  request: NextRequest,
  { params }: { params: { email: string } }
) {
  const startTime = Date.now();
  console.log(`[GET /api/missionary/[email]/hours] Request started for email: ${params.email}`);
  
  try {
    const email = params.email;
    if (!email) {
      console.warn('[GET /api/missionary/[email]/hours] Missing email parameter');
      return NextResponse.json(
        { error: "Missionary email is required" },
        { status: 400 }
      );
    }

    // First, get the missionary's ID from their email
    console.log(`[GET /api/missionary/[email]/hours] Fetching missionary ID for email: ${email}`);
    const { data: missionary, error: missionaryError } = await supabaseServer
      .from("missionaries")
      .select("id")
      .eq("email", email)
      .single();

    if (missionaryError || !missionary) {
      console.error(`[GET /api/missionary/[email]/hours] Missionary not found for email: ${email}`, missionaryError);
      return NextResponse.json(
        { error: "Missionary not found" },
        { status: 404 }
      );
    }

    console.log(`[GET /api/missionary/[email]/hours] Found missionary ID: ${missionary.id}`);

    // Then, fetch all hour entries for that missionary ID
    console.log(`[GET /api/missionary/[email]/hours] Fetching hours for missionary ID: ${missionary.id}`);
    const { data: hours, error: hoursError } = await supabaseServer
      .from("missionary_hours")
      .select("*")
      .eq("missionary_id", missionary.id)
      .order("period_start_date", { ascending: false });

    if (hoursError) {
      console.error(`[GET /api/missionary/[email]/hours] Failed to fetch hours for missionary ID: ${missionary.id}`, hoursError);
      return NextResponse.json(
        { error: "Failed to fetch hours" },
        { status: 500 }
      );
    }

    const duration = Date.now() - startTime;
    console.log(`[GET /api/missionary/[email]/hours] Successfully fetched ${hours?.length || 0} hour entries for missionary ID: ${missionary.id} (${duration}ms)`);
    
    return NextResponse.json({ hours });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[GET /api/missionary/[email]/hours] Unexpected error after ${duration}ms:`, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
