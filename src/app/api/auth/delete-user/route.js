import { supabaseServer } from "@/util/supabaseServer";

export async function POST(request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return new Response(JSON.stringify({ error: "User ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log("API: Attempting to delete user with ID:", userId);

    // Step 1: Get user info for cleanup
    let userEmail = null;
    try {
      const { data: userData } = await supabaseServer
        .from("users")
        .select("email")
        .eq("id", userId)
        .single();

      userEmail = userData?.email;
    } catch (error) {
      console.log("Could not get user email:", error.message);
    }

    // Step 2: Delete from auth system
    let authDeleted = false;
    try {
      const { data: authUser, error: getUserError } =
        await supabaseServer.auth.admin.getUserById(userId);

      if (authUser && !getUserError) {
        console.log("API: Auth user found, deleting...");
        const { error: authError } = await supabaseServer.auth.admin.deleteUser(
          userId
        );

        if (authError) {
          console.error("API: Auth deletion error:", authError);
          // Continue with cleanup but note the failure
        } else {
          console.log("API: Successfully deleted from auth system");
          authDeleted = true;
        }
      }
    } catch (error) {
      console.log("API: Auth user not found or error:", error.message);
    }

    // Step 3: Clean up invitation records
    if (userEmail) {
      try {
        console.log("API: Cleaning up invitation records for:", userEmail);
        const { error: inviteError } = await supabaseServer
          .from("user_invitations")
          .delete()
          .eq("email", userEmail);

        if (inviteError) {
          console.warn(
            "API: Failed to delete invitation records:",
            inviteError.message
          );
        }
      } catch (error) {
        console.warn("API: Error during invitation cleanup:", error.message);
      }
    }

    // Step 4: Delete from users table (with foreign key handling)
    console.log("API: Deleting from users table...");

    // First, set foreign key references to NULL
    try {
      await supabaseServer
        .from("days_of_service_project_forms")
        .update({ created_by: null })
        .eq("created_by", userId);

      await supabaseServer
        .from("days_of_service_project_forms")
        .update({ updated_by: null })
        .eq("updated_by", userId);
    } catch (error) {
      console.warn(
        "API: Error updating foreign key references:",
        error.message
      );
    }

    // Now delete the user
    const { error: dbError } = await supabaseServer
      .from("users")
      .delete()
      .eq("id", userId);

    if (dbError) {
      console.error("API: Database deletion error:", dbError);
      return new Response(
        JSON.stringify({
          error: `Failed to delete user from database: ${dbError.message}`,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("API: Successfully deleted from users table");

    return new Response(
      JSON.stringify({
        success: true,
        authDeleted,
        message: "User deleted successfully",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("API: Delete user error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
