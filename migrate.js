import { createClient } from "@supabase/supabase-js";
import { MongoClient, ServerApiVersion } from "mongodb";

const MONGODB_URI =
  "mongodb+srv://site:SARzofWlkE2JolOb@myhometown.etuosol.mongodb.net/?retryWrites=true&w=majority&appName=MyHometown";

const MONGODB_DB = "MyHometown";

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

async function migrateUsers() {
  const opts = {
    serverApi: ServerApiVersion.v1,
  };
  const client = new MongoClient(MONGODB_URI, opts);

  // Connect to MongoDB
  await client.connect();

  const db = client.db(MONGODB_DB);
  // Connect to MongoDB
  const users = db.collection("Users");

  // Fetch all users from MongoDB
  const mongoUsers = await users.find({}).toArray();
  console.log(`Found ${mongoUsers.length} users to migrate`);

  for (const user of mongoUsers) {
    try {
      // Step 1: Create auth user
      const { data, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        email_confirm: true,
        password: generateTemporaryPassword(),
        user_metadata: {
          name: user.name || "",
          firstName: user.firstName || "",
          lastName: user.lastName || "",
        },
      });

      if (authError) {
        console.error(`Auth error for user ${user.email}:`, authError);
        continue;
      }

      if (!data?.user?.id) {
        console.error(`No user ID returned for ${user.email}`);
        continue;
      }

      console.log(
        `Created auth user for ${user.email} with ID: ${data.user.id}`
      );

      // Step 2: Insert into public.users table
      const { error: profileError } = await supabase.from("users").insert({
        id: data.user.id,
        email: user.email,
        contact_number: user.contactNumber || "",
        permissions: {
          administrator: user.permissions?.administrator || false,
          city_management: user.permissions?.cityManagement || false,
          community_management: user.permissions?.communityManagement || false,
          texting: user.permissions?.texting || false,
          class_management: user.permissions?.classManagement || false,
        },
        cities: user.cities || [],
        communities: user.communities || [],
        created_at: user.createdAt || new Date(),
      });

      if (profileError) {
        console.error(`Profile error for user ${user.email}:`, profileError);
        // Clean up auth user if profile creation fails
        await supabase.auth.admin.deleteUser(data.user.id);
        continue;
      }

      console.log(`Successfully migrated user: ${user.email}`);
    } catch (error) {
      console.error(`Failed to migrate user ${user.email}:`, error);
    }
  }

  // Close the connection
  await client.close();
}

function generateTemporaryPassword() {
  return Math.random().toString(36).slice(-12) + "aA1!";
}

async function runMigration() {
  try {
    console.log("Starting migration...");
    await migrateUsers();
    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}

runMigration().catch(console.error);
