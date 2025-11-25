import { type NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/util/supabaseServer";

// GET a single entry (for the edit page)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const { data, error } = await supabaseServer
    .from("missionary_hours")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
  return NextResponse.json(data);
}

// UPDATE an existing entry
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const body = await request.json();

  const totalHoursFromActivities = Array.isArray(body.activities)
    ? body.activities.reduce(
        (sum: number, act: { hours: number }) => sum + (Number(act.hours) || 0),
        0
      )
    : 0;

  const { data, error } = await supabaseServer
    .from("missionary_hours")
    .update({
      entry_method: body.entryMethod,
      period_start_date: body.period_start_date,
      total_hours: totalHoursFromActivities,
      activities: body.activities, // This is the JSONB field
      location: body.location || null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, data });
}

// DELETE an entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log("DELETE request received for ID:", params.id);

  const { id } = params;
  const { error } = await supabaseServer
    .from("missionary_hours")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
