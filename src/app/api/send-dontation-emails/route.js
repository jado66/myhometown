import { citiesStrongTransporter } from "@/util/email/nodemailer-transporter";

const donorEmailTemplate = (data) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 5px; }
        .header { color: #333; margin-bottom: 20px; }
        .content { margin-bottom: 20px; }
        .footer { font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2 class="header">Thank You for Your Donation!</h2>
        <div class="content">
          <p>Dear ${data.name},</p>
          <p>Thank you for your ${
            data.recurring ? "recurring" : "one-time"
          } donation of $${(data.amount / 100).toFixed(2)} to Cities Strong.</p>
          <p>Your contribution will help revitalize neighborhoods and lift lives.</p>
          <p>Donation Details:</p>
          <ul>
            <li>Name: ${data.name}</li>
            <li>Email: ${data.email}</li>
            <li>Amount: $${(data.amount / 100).toFixed(2)}</li>
            <li>Type: ${data.recurring ? "Monthly" : "One-time"}</li>
          </ul>
        </div>
        <div class="footer">
          <p>This is your donation receipt. Please keep it for your records.</p>
          <p>Contact csffinance@citiesstrong.org for any questions.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const financeEmailTemplate = (data) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 5px; }
        .header { color: #333; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2 class="header">New Donation Received</h2>
        <p>A new donation has been processed:</p>
        <ul>
          <li>Name: ${data.name}</li>
          <li>Email: ${data.email}</li>
          <li>Phone: ${data.phone}</li>
          <li>Amount: $${(data.amount / 100).toFixed(2)}</li>
          <li>Type: ${data.recurring ? "Monthly" : "One-time"}</li>
        </ul>
      </div>
    </body>
    </html>
  `;
};

export async function POST(request) {
  const data = await request.json();

  try {
    // Send email to donor
    await citiesStrongTransporter.sendMail({
      to: data.email,
      subject: "Cities Strong Donation Receipt",
      html: donorEmailTemplate(data),
    });

    // Send email to finance team
    await citiesStrongTransporter.sendMail({
      to: "csffinance@citiesstrong.org",
      subject: "New Donation Notification",
      html: financeEmailTemplate(data),
    });

    return new Response(
      JSON.stringify({ message: "Emails sent successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ message: "Error sending emails", error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
