// Create this as /api/auth/validate-invitation/route.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return new Response(
        JSON.stringify({ valid: false, message: "No token provided" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check if the invitation exists and is unused
    const { data: invitation, error } = await supabase
      .from("user_invitations")
      .select("*")
      .eq("token", token)
      .eq("used", false)
      .single();

    if (error || !invitation) {
      return new Response(
        JSON.stringify({
          valid: false,
          message: "Invalid or used invitation link",
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        valid: true,
        invitation: {
          email: invitation.email,
          firstName: invitation.first_name,
          lastName: invitation.last_name,
          userId: invitation.user_id, // Include the user ID
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Token validation error:", error);
    return new Response(
      JSON.stringify({
        valid: false,
        message: "Error validating invitation",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
