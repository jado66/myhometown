import { supabaseServer } from "@/util/supabaseServer";

export async function PATCH(request) {
  try {
    const { id, notes } = await request.json();

    // Validate required fields
    if (!id) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Volunteer signup ID is required",
        }),
        { status: 400 },
      );
    }

    // Update the volunteer signup notes
    const { data, error } = await supabaseServer
      .from("volunteer_signups")
      .update({
        notes: notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating volunteer notes:", error);

      if (error.code === "PGRST116") {
        return new Response(
          JSON.stringify({
            success: false,
            message: "Volunteer signup not found",
          }),
          { status: 404 },
        );
      }

      return new Response(
        JSON.stringify({
          success: false,
          message: "Failed to update volunteer notes",
        }),
        { status: 500 },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Notes updated successfully",
        data: data,
      }),
      { status: 200 },
    );
  } catch (error) {
    console.error("Volunteer notes API error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Internal server error",
      }),
      { status: 500 },
    );
  }
}
