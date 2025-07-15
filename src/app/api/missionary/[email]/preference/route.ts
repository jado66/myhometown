import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: { email: string } }
) {
  try {
    const email = params.email;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("missionaries")
      .select("preferred_entry_method")
      .eq("email", email)
      .single();

    if (error) {
      console.error("Error fetching preference:", error);
      // If the user is not found, it's not a server error, just no preference.
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Missionary not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: "Failed to fetch preference" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      preference: data?.preferred_entry_method || null,
    });
  } catch (error) {
    console.error("Preference API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
