import { getSession } from "@auth0/nextjs-auth0";
import { connectToMongoDatabase } from "@/util/db/mongodb";
import { getManagementToken } from "@/util/auth/GetManagementToken";

export async function POST(req) {
  try {
    const session = await getSession(req);
    if (!session?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const token = await getManagementToken();
    if (!token) {
      throw new Error("Failed to obtain Auth0 management token");
    }

    const { email, name, role, contactNumber, cities, communities } =
      await req.json();
    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
      });
    }

    // Connect to MongoDB and check for existing user
    const { db } = await connectToMongoDatabase();
    const users = db.collection("Users");
    const existingUser = await users.findOne({ email: email });

    if (existingUser) {
      return new Response(
        JSON.stringify({ error: "User with this email already exists" }),
        { status: 400 }
      );
    }

    // Create user in Auth0
    const auth0Domain =
      process.env.AUTH0_ISSUER_BASE_URL?.replace("https://", "") ||
      "myhometown.us.auth0.com";
    const tempPassword = Math.random().toString(36).slice(-12) + "aA1!";

    const auth0Response = await fetch(`https://${auth0Domain}/api/v2/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        email: email,
        name: name || email,
        connection: "Username-Password-Authentication",
        password: tempPassword,
        verify_email: true,
      }),
    });

    if (!auth0Response.ok) {
      const error = await auth0Response.json();
      console.error("Auth0 user creation error:", error);
      throw new Error(
        `Failed to create Auth0 user: ${
          error.message || error.error_description || error.error
        }`
      );
    }

    const auth0User = await auth0Response.json();

    // Create MongoDB user
    const newUser = {
      _id: auth0User.user_id,
      email: email,
      name: name || "",
      role: role || "None",
      contactNumber: contactNumber || "",
      cities: cities || [],
      communities: communities || [],
      createdAt: new Date(),
    };

    await users.insertOne(newUser);

    // Generate password reset ticket
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetResponse = await fetch(
      `https://${auth0Domain}/api/v2/tickets/password-change`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: auth0User.user_id,
          ttl_sec: 604800,
          mark_email_as_verified: true,
          result_url: `${appUrl}/api/auth/callback`,
          client_id: process.env.AUTH0_CLIENT_ID,
        }),
      }
    );

    if (!resetResponse.ok) {
      const resetError = await resetResponse.json();
      console.error("Password reset error:", resetError);

      // Don't throw an error here - the user is already created
      // Instead, return success with a note about the reset link
      return new Response(
        JSON.stringify({
          message:
            "User created successfully. Note: Password reset email could not be sent automatically.",
          user: newUser,
          resetError: resetError,
        }),
        { status: 200 }
      );
    }

    const resetData = await resetResponse.json();

    return new Response(
      JSON.stringify({
        message:
          "User created successfully. A password reset email has been sent.",
        user: newUser,
        resetTicket: resetData.ticket,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("User creation failed:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      }),
      { status: 500 }
    );
  }
}
