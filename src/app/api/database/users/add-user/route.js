import { getSession } from "@auth0/nextjs-auth0";
import { connectToMongoDatabase } from "@/util/db/mongodb";
import { getManagementToken } from "@/util/auth/GetManagementToken";

async function isAdmin(session) {
  if (!session?.user) return false;
  // const { db } = await connectToMongoDatabase();
  // const users = db.collection("Users");
  // const user = await users.findOne({ _id: session.user.sub });
  // return user?.role === "Admin";
  return true;
}

export async function POST(req) {
  const session = await getSession(req);
  if (!(await isAdmin(session))) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const token = await getManagementToken();

  const { email, name, role, contactNumber, cities, communities } =
    await req.json();

  if (!email) {
    return new Response(JSON.stringify({ error: "Email is required" }), {
      status: 400,
    });
  }

  const { db } = await connectToMongoDatabase();
  const users = db.collection("Users");

  try {
    // Check if user already exists with this email
    const existingUser = await users.findOne({ email: email });
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Send invitation email
    const inviteResponse = await fetch(
      `https://myhometown.us.auth0.com/api/v2/tickets/invite`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          client_id: process.env.AUTH0_CLIENT_ID,
          connection_id: process.env.AUTH0_CONNECTION_ID,
          email: email,
          ttl_sec: 604800, // 7 days
          send_invitation_email: true,
        }),
      }
    );

    if (!inviteResponse.ok) {
      const inviteError = await inviteResponse.json();
      throw new Error(
        `Failed to send invitation: ${
          inviteError.message || inviteError.error_description
        }`
      );
    }

    // Create pending user with a special _id format that won't conflict with Auth0 subs
    // Auth0 subs start with 'auth0|', 'google-oauth2|', etc.
    // We'll use 'pending|' prefix + timestamp + email hash
    const pendingId = `pending|${Date.now()}|${Buffer.from(email).toString(
      "base64"
    )}`;

    const newUser = {
      _id: pendingId,
      email: email,
      name: name || "",
      role: role || "None",
      contactNumber: contactNumber || "",
      cities: cities || [],
      communities: communities || [],
      isPending: true,
      createdAt: new Date(),
    };

    await users.insertOne(newUser);

    return new Response(
      JSON.stringify({
        message:
          "Invitation sent successfully. User will be activated upon acceptance.",
        user: newUser,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Invitation failed:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
