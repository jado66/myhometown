import { supabaseServer } from "@/util/supabaseServer";

export async function POST(request) {
  try {
    const { token, password, email, firstName, lastName, userId } =
      await request.json();

    if (!token || !password || !email || !userId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate the invitation token first
    const { data: invitation, error: invitationError } = await supabaseServer
      .from("user_invitations")
      .select("*")
      .eq("token", token)
      .eq("used", false)
      .single();

    if (invitationError || !invitation) {
      return new Response(
        JSON.stringify({ error: "Invalid or used invitation token" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Since the user already exists (created in the invite process),
    // we just need to update them with a password and remove the invitation_pending flag
    const { data: authData, error: updateError } =
      await supabaseServer.auth.admin.updateUserById(userId, {
        password: password,
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
          invitation_pending: false, // Remove the pending flag
        },
      });

    if (updateError) {
      console.error("Failed to update user password:", updateError);
      return new Response(
        JSON.stringify({
          error: "Unable to set password. Please contact your administrator.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("✅ Password set successfully for user:", userId);

    // Mark invitation as used
    const { error: markUsedError } = await supabaseServer
      .from("user_invitations")
      .update({ used: true, used_at: new Date().toISOString() })
      .eq("token", token);

    if (markUsedError) {
      console.warn("Failed to mark invitation as used:", markUsedError);
      // Don't fail the whole operation for this
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Setup password error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
