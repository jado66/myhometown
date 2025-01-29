import { myHometownTransporter } from "@/util/email/nodemailer-transporter";

const formattedHtml = ({ fromName, message, url }) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Project Collaboration Invitation</title>
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
        <h2>Days Of Service Project Collaboration Invitation</h2>
        <p>Hi there,</p>
        <p>You've been invited to collaborate on a Days Of Service project by ${fromName}.</p>
        
        <div class="message">
          <strong>Message from ${fromName}:</strong>
          <p>${message}</p>
        </div>

        <div class="divider"></div>

        <p>To access the project and start collaborating, please click the button below:</p>
        <a href="${url}" class="button" style="display: inline-block; padding: 12px 24px; background-color: #188d4e; color: #ffffff !important; text-decoration: none; border-radius: 6px; margin-top: 20px; font-family: Arial, sans-serif;">Go To Project</a>

        <div class="divider"></div>
        
        <p>Thanks,<br>${fromName}</p>
      </div>
    </body>
    </html>
  `;
};

export async function POST(request) {
  try {
    const { to, from, message } = await request.json();

    if (!to || !from || !message) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields",
          message: "Email, sender name, and message are required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Get the current URL from the request headers
    const url = request.headers.get("referer") || request.headers.get("origin");

    // Send mail with defined transport object
    const info = await myHometownTransporter.sendMail({
      to,
      from: "volunteer@myhometownut.org", // Use organization's email as sender
      replyTo: to, // Set reply-to as the collaborator's email
      subject: "Invitation to Collaborate on Days Of Service Project",
      html: formattedHtml({
        fromName: from,
        message: message.trim(),
        url,
      }),
    });

    console.log("Collaboration email sent:", info.messageId);

    return new Response(
      JSON.stringify({
        message: "Collaboration email sent successfully",
        messageId: info.messageId,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error sending collaboration email:", error);

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
