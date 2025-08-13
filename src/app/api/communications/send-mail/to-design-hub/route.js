import { myHometownTransporter } from "@/util/email/nodemailer-transporter";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role key for server-side
);

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

// Function to parse selected items from the message
const parseSelectedItemsFromMessage = (message) => {
  try {
    // Extract the items section from the message
    const itemsMatch = message.match(
      /Selected Items \((\d+)\):\n(.*?)(?:\n\nAdditional Requests:|$)/s
    );
    if (!itemsMatch) return [];

    const itemsText = itemsMatch[2];
    const items = itemsText
      .split("\n")
      .filter((line) => line.trim().startsWith("- "))
      .map((line) => {
        const match = line.match(/- (.*?) \((.*?)\)/);
        if (match) {
          return {
            title: match[1].trim(),
            category: match[2].trim(),
          };
        }
        return null;
      })
      .filter(Boolean);

    return items;
  } catch (error) {
    console.error("Error parsing selected items:", error);
    return [];
  }
};

// Function to extract location information
const parseLocationInfo = (html) => {
  const locationString = html.location || "";

  if (locationString === "myHometown Utah") {
    return {
      locationType: "myHometown Utah",
      locationName: null,
    };
  }

  if (locationString.startsWith("City: ")) {
    return {
      locationType: "city",
      locationName: locationString.replace("City: ", "").trim(),
    };
  }

  if (locationString.startsWith("Community: ")) {
    return {
      locationType: "community",
      locationName: locationString.replace("Community: ", "").trim(),
    };
  }

  return {
    locationType: "unknown",
    locationName: locationString,
  };
};

// Function to log request to Supabase
const logRequestToSupabase = async (subject, html, rawRequestData) => {
  try {
    const selectedItems = parseSelectedItemsFromMessage(html.message);
    const { locationType, locationName } = parseLocationInfo(html);

    // Extract additional requests from message
    const additionalRequestsMatch = html.message.match(
      /Additional Requests: (.*?)(?:\n\nSubmitted:|$)/s
    );
    const additionalRequests = additionalRequestsMatch
      ? additionalRequestsMatch[1].trim()
      : null;

    const requestData = {
      first_name: html.firstName || "",
      last_name: html.lastName || "",
      title: html.title || "",
      email: html.email || "",
      phone: html.phone || "",
      location_type: locationType,
      location_name: locationName,
      selected_items: selectedItems,
      additional_requests: additionalRequests,
      total_items: selectedItems.length,
      email_sent: false, // Will be updated after email is sent successfully
      raw_request_data: rawRequestData,
    };

    const { data, error } = await supabase
      .from("design_hub_requests")
      .insert(requestData)
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return null;
    }

    console.log("Request logged to Supabase:", data.id);
    return data;
  } catch (error) {
    console.error("Error logging to Supabase:", error);
    return null;
  }
};

// Function to update email sent status
const updateEmailSentStatus = async (requestId, success) => {
  try {
    const { error } = await supabase
      .from("design_hub_requests")
      .update({
        email_sent: success,
        email_sent_at: success ? new Date().toISOString() : null,
      })
      .eq("id", requestId);

    if (error) {
      console.error("Error updating email status:", error);
    }
  } catch (error) {
    console.error("Error updating email status:", error);
  }
};

export async function POST(request, res) {
  const requestBody = await request.json();
  const { subject, html } = requestBody;

  const recipientEmail = "jado66@gmail.com"; // Testing email for Design Hub

  // Log the request to Supabase first
  const loggedRequest = await logRequestToSupabase(subject, html, requestBody);

  try {
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

    // Update the email sent status in Supabase
    if (loggedRequest) {
      await updateEmailSentStatus(loggedRequest.id, true);
    }

    return new Response(
      JSON.stringify({
        message: "Email sent successfully",
        recipient: recipientEmail,
        requestId: loggedRequest?.id || null,
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

    // Update the email sent status as failed in Supabase
    if (loggedRequest) {
      await updateEmailSentStatus(loggedRequest.id, false);
    }

    // Send a JSON response with status code 500 (Internal Server Error) if an error occurs
    return new Response(
      JSON.stringify({
        message: "Error sending email",
        error: error.message,
        requestId: loggedRequest?.id || null,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
