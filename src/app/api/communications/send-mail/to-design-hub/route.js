import { myHometownTransporter } from "@/util/email/nodemailer-transporter";

// Enhanced HTML formatter for Design Hub orders
const formattedDesignHubHtml = (html) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>MHT Design Hub Order Request</title>
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
          border: 1px solid #ddd;
          border-radius: 8px;
          background-color: #f9f9f9;
        }
        .header {
          background-color: #318d43;
          color: white;
          padding: 20px;
          border-radius: 8px 8px 0 0;
          text-align: center;
          margin: -20px -20px 20px -20px;
        }
        .section {
          background-color: white;
          padding: 15px;
          margin: 15px 0;
          border-radius: 8px;
          border: 1px solid #ddd;
        }
        .label {
          font-weight: bold;
          color: #555;
          display: inline-block;
          width: 120px;
          margin-bottom: 8px;
        }
        .value {
          display: inline-block;
          margin-bottom: 8px;
        }
        .field-row {
          margin-bottom: 10px;
          padding: 5px 0;
          border-bottom: 1px solid #eee;
        }
        .field-row:last-child {
          border-bottom: none;
        }
        .items-list {
          background-color: #f5f5f5;
          padding: 10px;
          border-radius: 4px;
          margin: 10px 0;
        }
        .item {
          padding: 8px;
          margin: 5px 0;
          background-color: white;
          border-left: 4px solid #1976d2;
          border-radius: 4px;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          padding: 10px;
          background-color: #eafde3ff;
          border-radius: 4px;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>MHT Design Hub Order Request</h2>
        </div>
        
        <div class="section">
          <h3>Contact Information</h3>
          <div class="field-row">
            <span class="label">Name:</span>
            <span class="value">${html.firstName} ${html.lastName}</span>
          </div>
           <div class="field-row">
            <span class="label">Title:</span>
            <span class="value">${html.title}</span>
          </div>
          <div class="field-row">
            <span class="label">Email:</span>
            <span class="value">${html.email}</span>
          </div>
         
          <div class="field-row">
            <span class="label">Phone:</span>
            <span class="value">${html.phone}</span>
          </div>
          <div class="field-row">
            <span class="label">Group:</span>
            <span class="value">${html.location}</span>
          </div>
          
        </div>
        
        <div class="section">
          <h3>Order Details</h3>
          <div style="white-space: pre-line; background-color: #f8f9fa; padding: 15px; border-radius: 4px; border: 1px solid #dee2e6;">
${html.message}
          </div>
        </div>
        
        <div class="footer">
          <p>This request was submitted on ${new Date().toLocaleString()}</p>
          <p>Please respond within 24 hours as promised to the customer.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export async function POST(request, res) {
  const { subject, html } = await request.json();

  const recipientEmail = "jado66@gmail.com"; // Testing email for Design Hub

  try {
    // Determine email recipient based on subject line

    // For Design Hub orders, use the testing email

    // Choose the appropriate HTML formatter
    let emailHtml;
    if (subject && subject.includes("MHT Design Hub Order Request")) {
      emailHtml = formattedDesignHubHtml(html);
    } else {
      emailHtml = formattedHtml(html);
    }

    // Send mail with defined transport object
    let info = await myHometownTransporter.sendMail({
      to: recipientEmail,
      subject: subject || "Contact Form Submission", // Default subject
      html: emailHtml,
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Sent to: %s", recipientEmail);

    return new Response(
      JSON.stringify({
        message: "Email sent successfully",
        recipient: recipientEmail,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Email sending error:", error);
    // Send a JSON response with status code 500 (Internal Server Error) if an error occurs
    return new Response(
      JSON.stringify({
        message: "Error sending email",
        error: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
