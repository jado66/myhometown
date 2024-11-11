// app/api/database/users/[id]/route.js
import { getSession } from "@auth0/nextjs-auth0";
import { connectToMongoDatabase } from "@/util/db/mongodb";
import { getManagementToken } from "@/util/auth/GetManagementToken";

export async function DELETE(req, { params }) {
  try {
    const session = await getSession(req);
    if (!session?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const { id } = params;
    const token = await getManagementToken();
    if (!token) {
      throw new Error("Failed to obtain Auth0 management token");
    }

    // Delete user from Auth0
    const auth0Domain =
      process.env.AUTH0_ISSUER_BASE_URL?.replace("https://", "") ||
      "myhometown.us.auth0.com";
    const auth0Response = await fetch(
      `https://${auth0Domain}/api/v2/users/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!auth0Response.ok) {
      throw new Error("Failed to delete user from Auth0");
    }

    // Delete user from MongoDB
    const { db } = await connectToMongoDatabase();
    const result = await db.collection("Users").deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
      });
    }

    return new Response(
      JSON.stringify({ message: "User deleted successfully" }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("User deletion failed:", error);
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

// app/api/auth/reset-password/route.js
export async function POST(req) {
  try {
    const session = await getSession(req);
    if (!session?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const { email } = await req.json(); // Expect email in the request body
    const auth0Domain =
      process.env.AUTH0_ISSUER_BASE_URL?.replace("https://", "") ||
      "myhometown.us.auth0.com";
    const clientId = process.env.AUTH0_CLIENT_ID; // Ensure you set this in your environment

    // Call the Auth0 endpoint to trigger password reset email
    const resetResponse = await fetch(
      `https://${auth0Domain}/dbconnections/change_password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: clientId,
          email: email,
          connection: "Username-Password-Authentication", // Use your connection name
        }),
      }
    );

    if (!resetResponse.ok) {
      const error = await resetResponse.json();
      console.error("Auth0 password reset error:", error);
      throw new Error(
        `Failed to send password reset email: ${
          error.message || error.error_description || "Unknown error"
        }`
      );
    }

    return new Response(
      JSON.stringify({
        message: "Password reset email sent successfully",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Password reset failed:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
