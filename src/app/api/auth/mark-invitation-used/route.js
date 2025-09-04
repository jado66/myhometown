import { supabaseServer } from "@/util/supabaseServer";

export async function POST(request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return new Response(JSON.stringify({ message: "Token is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Mark the invitation as used
    const { data, error } = await supabaseServer
      .from("user_invitations")
      .update({
        used: true,
        used_at: new Date().toISOString(),
      })
      .eq("token", token)
      .eq("used", false)
      .select()
      .single();

    if (error) {
      console.error("Error marking invitation as used:", error);
      return new Response(
        JSON.stringify({
          message: "Error marking invitation as used",
          error: error.message,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!data) {
      return new Response(
        JSON.stringify({
          message: "Invitation not found or already used",
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        message: "Invitation marked as used successfully",
        data,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Mark invitation used error:", error);
    return new Response(
      JSON.stringify({
        message: "Error processing request",
        error: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
