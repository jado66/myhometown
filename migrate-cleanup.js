import { createClient } from "@supabase/supabase-js";

const NEXT_PUBLIC_SUPABASE_URL = "https://qmfekhfrtraocrzyjhwl.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtZmVraGZydHJhb2NyenlqaHdsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjY1Nzc4OCwiZXhwIjoyMDUyMjMzNzg4fQ.PjZH-wwKwF2pWBMuyGZ1eo-cyjtpd3Q-YEoNS7fjUXk";
("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtZmVraGZydHJhb2NyenlqaHdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY2NTc3ODgsImV4cCI6MjA1MjIzMzc4OH0.1crS53IiQ9GIHEZaFscm_3P4hSxYRIaoCxAOziXrjYk");

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

async function cleanupUsers() {
  try {
    console.log("Starting cleanup...");

    // Get all users from auth.users
    const { data: authUsers, error: listError } =
      await supabase.auth.admin.listUsers();

    if (listError) {
      console.error("Error listing users:", listError);
      return;
    }

    console.log(`Found ${authUsers.users.length} users to delete`);

    // Delete each user
    for (const user of authUsers.users) {
      try {
        const { error: deleteError } = await supabase.auth.admin.deleteUser(
          user.id
        );

        if (deleteError) {
          console.error(`Failed to delete user ${user.email}:`, deleteError);
        } else {
          console.log(`Successfully deleted user: ${user.email}`);
        }
      } catch (error) {
        console.error(`Error deleting user ${user.email}:`, error);
      }
    }

    console.log("Cleanup completed!");
  } catch (error) {
    console.error("Cleanup failed:", error);
    throw error;
  }
}

cleanupUsers().catch(console.error);
