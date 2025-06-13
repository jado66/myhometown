import { myHometownTransporter } from "@/util/email/nodemailer-transporter";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid"; // Make sure to install: npm install uuid

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const formattedInviteHtml = (email, firstName, lastName, inviteLink) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to myHometown</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #f8f9fa;
          padding: 20px;
          text-align: center;
          border-bottom: 2px solid #dee2e6;
        }
        .content {
          padding: 30px 20px;
          background-color: #ffffff;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #318d43;
          color: #ffffff;
          text-decoration: none;
          border-radius: 4px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          padding: 20px;
          font-size: 12px;
          color: #6c757d;
        }
        a[class="button"] {
          color: #ffffff !important;
          text-decoration: none !important;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to myHometown!</h1>
        </div>
        <div class="content">
          <p>Hello ${firstName} ${lastName},</p>
          <p>You've been invited to join myHometown Admin Dashboard. To get started, click the button below to set up your account.</p>
          <p style="text-align: center;">
            <a href="${inviteLink}" class="button" style="color: #ffffff">Set Up Your Account</a>
          </p>
          <p>This invitation link will remain active until you use it to set up your account.</p>
          <p>If you didn't expect this invitation, you can safely ignore this email.</p>
        </div>
        <div class="footer">
          <p>This is an automated message, please do not reply to this email.</p>
          <p>&copy; ${new Date().getFullYear()} myHometown. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export async function POST(request) {
  console.log("🚀 Invite API called");

  try {
    // Step 1: Parse request body
    console.log("📥 Parsing request body...");
    const { email, firstName, lastName } = await request.json();
    console.log("📧 Request data:", { email, firstName, lastName });

    // Step 2: Validate input
    if (!email || !firstName || !lastName) {
      console.error("❌ Missing required fields");
      return new Response(
        JSON.stringify({
          message: "Missing required fields: email, firstName, lastName",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Step 3: Check environment variables
    console.log("🔧 Checking environment variables...");
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL");
      throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable");
    }
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("❌ Missing SUPABASE_SERVICE_ROLE_KEY");
      throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable");
    }
    if (!process.env.NEXT_PUBLIC_DOMAIN) {
      console.error("❌ Missing NEXT_PUBLIC_DOMAIN");
      throw new Error("Missing NEXT_PUBLIC_DOMAIN environment variable");
    }
    console.log("✅ Environment variables OK");

    // Step 4: Test Supabase connection
    console.log("🗄️ Testing Supabase connection...");
    try {
      const { data, error } = await supabase
        .from("users")
        .select("count")
        .single();
      if (error && error.code !== "PGRST116") {
        // PGRST116 is "not found" which is OK
        console.error("❌ Supabase connection test failed:", error);
        throw new Error(`Supabase connection failed: ${error.message}`);
      }
      console.log("✅ Supabase connection OK");
    } catch (connError) {
      console.error("❌ Supabase connection error:", connError);
      throw new Error(`Database connection failed: ${connError.message}`);
    }

    // Step 5: Check if user_invitations table exists
    console.log("📋 Checking user_invitations table...");
    try {
      const { error: tableError } = await supabase
        .from("user_invitations")
        .select("count")
        .limit(1);

      if (tableError) {
        console.error("❌ user_invitations table error:", tableError);
        if (
          tableError.message.includes("relation") &&
          tableError.message.includes("does not exist")
        ) {
          throw new Error(
            "user_invitations table does not exist. Please run the SQL schema first."
          );
        }
        throw new Error(`Database table error: ${tableError.message}`);
      }
      console.log("✅ user_invitations table exists");
    } catch (tableErr) {
      console.error("❌ Table check failed:", tableErr);
      throw tableErr;
    }

    // Step 6: Generate invitation token
    console.log("🎫 Generating invitation token...");
    let invitationToken;
    try {
      invitationToken = uuidv4();
      console.log(
        "✅ Token generated:",
        invitationToken.substring(0, 8) + "..."
      );
    } catch (uuidError) {
      console.error("❌ UUID generation failed:", uuidError);
      throw new Error(
        "Failed to generate invitation token. Make sure 'uuid' package is installed."
      );
    }

    // Step 7: Check for existing invitation
    console.log("🔍 Checking for existing invitation...");
    const { data: existingInvitation, error: lookupError } = await supabase
      .from("user_invitations")
      .select("*")
      .eq("email", email)
      .eq("used", false)
      .single();

    if (lookupError && lookupError.code !== "PGRST116") {
      console.error("❌ Lookup error:", lookupError);
      throw new Error(`Database lookup failed: ${lookupError.message}`);
    }

    let token = invitationToken;

    if (existingInvitation) {
      console.log("♻️ Reusing existing invitation token");
      token = existingInvitation.token;

      // Update the invitation with new details
      console.log("📝 Updating existing invitation...");
      const { error: updateError } = await supabase
        .from("user_invitations")
        .update({
          first_name: firstName,
          last_name: lastName,
          created_at: new Date().toISOString(),
        })
        .eq("id", existingInvitation.id);

      if (updateError) {
        console.error("❌ Update error:", updateError);
        throw new Error(`Failed to update invitation: ${updateError.message}`);
      }
      console.log("✅ Invitation updated");
    } else {
      // Create new invitation record
      console.log("➕ Creating new invitation...");
      const { error: insertError } = await supabase
        .from("user_invitations")
        .insert([
          {
            email,
            token,
            first_name: firstName,
            last_name: lastName,
          },
        ]);

      if (insertError) {
        console.error("❌ Insert error:", insertError);
        throw new Error(`Failed to create invitation: ${insertError.message}`);
      }
      console.log("✅ New invitation created");
    }

    // Step 8: Create invitation link
    const inviteLink = `${process.env.NEXT_PUBLIC_DOMAIN}/auth/setup-password?token=${token}`;
    console.log("🔗 Invitation link created:", inviteLink);

    // Step 9: Send email
    console.log("📬 Sending invitation email...");
    try {
      const info = await myHometownTransporter.sendMail({
        to: email,
        subject: "Welcome to myHometown - Set Up Your Account",
        html: formattedInviteHtml(email, firstName, lastName, inviteLink),
      });

      console.log("✅ Invitation email sent:", info.messageId);
    } catch (emailError) {
      console.error("❌ Email error:", emailError);
      throw new Error(`Failed to send email: ${emailError.message}`);
    }

    console.log("🎉 Invitation process completed successfully");

    return new Response(
      JSON.stringify({
        message: "Invitation sent successfully",
        token, // Remove this in production
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("💥 Invitation API error:", error);
    console.error("Error stack:", error.stack);

    return new Response(
      JSON.stringify({
        message: "Error sending invitation",
        error: error.message,
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
