import { myHometownTransporter } from "@/util/email/nodemailer-transporter";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const formattedHtml = ({ propertyOwner, url }) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Property Owner Project Form Access</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background-color: #f9fafb;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }
        .message {
          margin: 20px 0;
          padding: 15px;
          background-color: #ffffff;
          border-radius: 6px;
          border: 1px solid #e5e7eb;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #188d4e;
          color: #ffffff;
          text-decoration: none;
          border-radius: 6px;
          margin-top: 20px;
        }
        .divider {
          border-top: 1px solid #e5e7eb;
          margin: 20px 0;
        }
        a {
          color: #ffffff;
        }
        a:hover {
          color: #ffffff;
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Please Review and Sign the Property Owner Release Form</h2>
        <p>Hi ${propertyOwner},</p>
        <p>You've been requested to review and sign the property owner release form, please click the button below:</p>
    
        <p></p>
        <a href="${url}" class="button" style="display: inline-block; padding: 12px 24px; background-color: #188d4e; color: #ffffff !important; text-decoration: none; border-radius: 6px; margin-top: 20px; font-family: Arial, sans-serif;">Property owner Release Form</a>

        <div class="divider"></div>
        
        <p>Thanks,<br>myHometown Days Of Service</p>
      </div>
    </body>
    </html>
  `;
};

export async function POST(request) {
  try {
    const { to, propertyOwner, formId } = await request.json();

    if (!to || !formId) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields",
          message: "Email, property owner, and form ID are required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Generate a unique token
    const accessToken = uuidv4();

    // Store token in Supabase
    const { error: tokenError } = await supabase.from("tokens").insert({
      email: to,
      token: accessToken,
      is_used: false,
    });

    if (tokenError) {
      console.error("Supabase token insertion error:", tokenError);
      return new Response(
        JSON.stringify({
          error: "Failed to store access token",
          message: tokenError.message,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Get the base URL from the request headers
    const baseUrl = process.env.NEXT_PUBLIC_DOMAIN;

    // Construct the access URL with the new format
    const accessUrl = `${baseUrl}/auth/days-of-service-project/${formId}/signature?token=${accessToken}`;

    // Send mail with defined transport object
    const info = await myHometownTransporter.sendMail({
      to,
      from: "volunteer@myhometownut.org", // Organization's email as sender
      replyTo: to, // Reply-to set to property owner's email
      subject:
        "myHometown Days Of Service - Property Owner Release Form Access",
      html: formattedHtml({
        propertyOwner: propertyOwner,
        url: accessUrl,
      }),
    });

    console.log("Property owner access email sent:", info.messageId);

    return new Response(
      JSON.stringify({
        message: "Property owner access email sent successfully",
        messageId: info.messageId,
        token: accessToken,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error sending property owner access email:", error);

    return new Response(
      JSON.stringify({
        error: "Failed to send email",
        message: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
