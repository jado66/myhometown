import { supabaseServer } from "@/util/supabaseServer";

export async function PATCH(request) {
  try {
    const { id, is_contacted } = await request.json();

    // Validate required fields
    if (!id) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Volunteer signup ID is required",
        }),
        { status: 400 }
      );
    }

    if (typeof is_contacted !== "boolean") {
      return new Response(
        JSON.stringify({
          success: false,
          message: "is_contacted must be a boolean value",
        }),
        { status: 400 }
      );
    }

    // Update the volunteer signup contact status
    const { data, error } = await supabaseServer
      .from("volunteer_signups")
      .update({
        is_contacted,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating volunteer contact status:", error);

      if (error.code === "PGRST116") {
        return new Response(
          JSON.stringify({
            success: false,
            message: "Volunteer signup not found",
          }),
          { status: 404 }
        );
      }

      return new Response(
        JSON.stringify({
          success: false,
          message: "Failed to update volunteer contact status",
        }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Volunteer marked as ${
          is_contacted ? "contacted" : "not contacted"
        }`,
        data: data,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Volunteer contact status API error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Internal server error",
      }),
      { status: 500 }
    );
  }
}
