import { createClient } from "@supabase/supabase-js";

const NEXT_PUBLIC_SUPABASE_URL = "https://qmfekhfrtraocrzyjhwl.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtZmVraGZydHJhb2NyenlqaHdsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjY1Nzc4OCwiZXhwIjoyMDUyMjMzNzg4fQ.PjZH-wwKwF2pWBMuyGZ1eo-cyjtpd3Q-YEoNS7fjUXk";

const supabase = createClient(
  NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

async function consolidateUserData() {
  try {
    console.log("Starting user data consolidation...");

    // Get all users from users_with_references to get metadata
    const { data: usersWithRefs, error: refsError } = await supabase
      .from("users_with_references")
      .select("id, raw_user_meta_data");

    if (refsError) {
      throw new Error(
        `Error fetching users_with_references: ${refsError.message}`
      );
    }

    // Get all users from users_with_details to get contact numbers
    const { data: usersWithDetails, error: detailsError } = await supabase
      .from("users_with_details")
      .select("id, contact_number");

    if (detailsError) {
      throw new Error(
        `Error fetching users_with_details: ${detailsError.message}`
      );
    }

    // Create a map of contact numbers by user ID
    const contactNumberMap = new Map(
      usersWithDetails.map((user) => [user.id, user.contact_number])
    );

    // Update each user in the users table
    for (const user of usersWithRefs) {
      const firstName = user.raw_user_meta_data?.firstName || "";
      const lastName = user.raw_user_meta_data?.lastName || "";
      const contactNumber = contactNumberMap.get(user.id) || "";

      const { error: updateError } = await supabase
        .from("users")
        .update({
          first_name: firstName,
          last_name: lastName,
          contact_number: contactNumber,
        })
        .eq("id", user.id);

      if (updateError) {
        console.error(`Error updating user ${user.id}:`, updateError);
        continue;
      }

      console.log(`Successfully updated user: ${user.id}`);
    }

    console.log("User data consolidation completed successfully!");
  } catch (error) {
    console.error("Consolidation failed:", error);
    throw error;
  }
}

// Run the consolidation
consolidateUserData().catch(console.error);
