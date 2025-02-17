import { myHometownTransporter } from "@/util/email/nodemailer-transporter";
import { createClient } from "@supabase/supabase-js";

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
      <title>Welcome to MyHometown</title>
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
          <h1>Welcome to MyHometown!</h1>
        </div>
        <div class="content">
          <p>Hello ${firstName} ${lastName},</p>
          <p>You've been invited to join MyHometown. To get started, click the button below to set up your account.</p>
          <p style="text-align: center;">
            <a href="${inviteLink}" class="button" style="color: #ffffff">Set Up Your Account</a>
          </p>
          <p>This invitation link will expire in 24 hours for security reasons. If you need a new invitation after that, please contact your administrator.</p>
          <p>If you didn't expect this invitation, you can safely ignore this email.</p>
        </div>
        <div class="footer">
          <p>This is an automated message, please do not reply to this email.</p>
          <p>&copy; ${new Date().getFullYear()} MyHometown. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export async function POST(request) {
  try {
    const { email, firstName, lastName } = await request.json();

    // First, check if user exists in our database
    const { data: existingUser, error: lookupError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (lookupError && lookupError.code !== "PGRST116") {
      // PGRST116 is "not found"
      throw lookupError;
    }

    let userData;

    if (!existingUser) {
      try {
        // Try to create user in auth system
        const { data: newUser, error: createError } =
          await supabase.auth.admin.createUser({
            email,
            email_confirm: true,
            user_metadata: {
              first_name: firstName,
              last_name: lastName,
            },
          });

        if (createError) throw createError;
        userData = newUser;
      } catch (error) {
        // If user exists in auth but not in our database
        if (
          error.message ===
          "A user with this email address has already been registered"
        ) {
          // List users to find the existing one
          const { data: users, error: listError } =
            await supabase.auth.admin.listUsers({
              search_by: "email",
              search_value: email,
            });

          if (listError) throw listError;

          const existingAuthUser = users.users.find((u) => u.email === email);
          if (!existingAuthUser)
            throw new Error("Could not find existing user");

          userData = { user: existingAuthUser };
        } else {
          throw error;
        }
      }
    }

    // Generate a password reset link
    const { data: linkData, error: linkError } =
      await supabase.auth.admin.generateLink({
        type: "recovery",
        email,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_DOMAIN}/auth/setup-password`,
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

    if (linkError) {
      throw linkError;
    }

    // Send our custom formatted invitation email
    const info = await myHometownTransporter.sendMail({
      to: email,
      subject: "Welcome to MyHometown - Set Up Your Account",
      html: formattedInviteHtml(
        email,
        firstName,
        lastName,
        linkData.properties.action_link
      ),
    });

    console.log("Invitation email sent: %s", info.messageId);

    return new Response(
      JSON.stringify({
        message: "Invitation sent successfully",
        messageId: info.messageId,
        data: {
          user: userData?.user || existingUser,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Invitation email error:", error);
    return new Response(
      JSON.stringify({
        message: "Error sending invitation",
        error: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
