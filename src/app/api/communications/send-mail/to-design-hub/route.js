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
        .cart-section {
          background-color: white;
          padding: 15px;
          margin: 15px 0;
          border-radius: 8px;
          border: 1px solid #ddd;
        }
        .cart-header {
          display: flex;
          align-items: center;
          margin-bottom: 15px;
          font-weight: bold;
          font-size: 1.1em;
        }
        .cart-icon {
          margin-right: 8px;
        }
        .cart-item {
          background-color: #f8f9fa;
          border: 1px solid #e3e6ea;
          border-radius: 8px;
          padding: 15px;
          margin: 10px 0;
        }
        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 10px;
        }
        .item-title {
          font-weight: bold;
          font-size: 1.05em;
          margin-bottom: 5px;
        }
        .item-type {
          background-color: #e3f2fd;
          color: #1976d2;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.8em;
          border: 1px solid #bbdefb;
        }
        .item-details {
          font-size: 0.9em;
          line-height: 1.4;
        }
        .item-detail-row {
          margin-bottom: 6px;
        }
        .item-detail-label {
          font-weight: bold;
          color: #555;
          margin-right: 8px;
        }
        .section-divider {
          height: 1px;
          background-color: #ddd;
          margin: 20px 0;
        }
        .cart-empty {
          text-align: center;
          color: #666;
          font-style: italic;
          padding: 20px;
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
          <h2>🛒 MHT Design Hub Order Request</h2>
        </div>
        
        <div class="section">
          <h3>Contact Information</h3>
          <div class="field-row">
            <span class="label">Authorized By:</span>
            <span class="value">${html.authorizedBy}</span>
          </div>
          <div class="field-row">
            <span class="label">Requester Name:</span>
            <span class="value">${html.firstName} ${html.lastName}</span>
          </div>
          <div class="field-row">
            <span class="label">Requester Email:</span>
            <span class="value">${html.email}</span>
          </div>
          <div class="field-row">
            <span class="label">Requester Phone:</span>
            <span class="value">${html.phone}</span>
          </div>
          <div class="field-row">
            <span class="label">To Be Designed For:</span>
            <span class="value">${html.location}</span>
          </div>
        </div>
        
        ${
          html.designItems &&
          html.designItems.some((item) => item.hasAttachments)
            ? `
          <div class="section" style="background-color: #fff3cd; border: 2px solid #ffeaa7;">
            <h3 style="color: #856404; margin-top: 0;">⚠️ IMPORTANT: Additional Attachments Required</h3>
            <div style="color: #856404; font-weight: bold;">
              <p>One or more items in this order requires additional attachments from the requestor. </p>
              <p><strong>Please follow up with the requestor via email (${html.email}) to collect these materials before starting the design work.</strong></p>
            </div>
          </div>
        `
            : ""
        }
        
        <div class="cart-section">
          <div class="cart-header">
            <span class="cart-icon">🛒</span>
            Cart (${
              (html.designItems?.length || 0) +
              (html.promotionalItems?.length || 0)
            })
          </div>
          
          ${
            html.designItems && html.designItems.length > 0
              ? `
            <div style="margin-bottom: 20px;">
              <div class="cart-header" style="font-size: 1em; margin-bottom: 10px;">
                <span class="cart-icon">📋</span>
                Design Requests (${html.designItems.length})
              </div>
              ${html.designItems
                .map(
                  (item) => `
                <div class="cart-item">
                  <div class="item-header">
                    <div>
                      <div class="item-title">${item.itemTitle}</div>
                      <span class="item-type">${item.itemType.replace(
                        "-",
                        " "
                      )}</span>
                    </div>
                  </div>
                  <div class="item-details">
                    <div class="item-detail-row">
                      <span class="item-detail-label">Purpose: </span>${
                        item.purpose
                      }
                    </div>
                    <div class="item-detail-row">
                      <span class="item-detail-label">Theme: </span>${
                        item.theme
                      }
                    </div>
                    <div class="item-detail-row">
                      <span class="item-detail-label">Due Date:</span>${
                        item.dueDate
                      }
                    </div>
                    <div class="item-detail-row">
                      <span class="item-detail-label">Size: </span>${
                        item.size === "other"
                          ? item.otherSize || "Not specified"
                          : item.size
                      }
                    </div>
                    ${
                      item.englishText
                        ? `
                      <div class="item-detail-row">
                        <span class="item-detail-label">English Text: </span>${item.englishText}
                      </div>
                    `
                        : ""
                    }
                    ${
                      item.spanishText
                        ? `
                      <div class="item-detail-row">
                        <span class="item-detail-label">Spanish Text: </span>${item.spanishText}
                      </div>
                    `
                        : ""
                    }
                    ${
                      item.hasAttachments
                        ? `
                      <div class="item-detail-row" style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 8px; border-radius: 4px; margin-top: 8px;">
                        <span class="item-detail-label" style="color: #856404; font-weight: bold;">⚠️ ATTACHMENTS REQUIRED: </span>
                        <span style="color: #856404; font-weight: bold;">The requestor has additional attachments (QR codes, images, logos, etc.) that need to be collected via email. Please follow up with them to obtain these materials.</span>
                      </div>
                    `
                        : ""
                    }
                  </div>
                </div>
              `
                )
                .join("")}
            </div>
          `
              : ""
          }
          
          ${
            html.designItems &&
            html.designItems.length > 0 &&
            html.promotionalItems &&
            html.promotionalItems.length > 0
              ? '<div class="section-divider"></div>'
              : ""
          }
          
          ${
            html.promotionalItems && html.promotionalItems.length > 0
              ? `
            <div>
              <div class="cart-header" style="font-size: 1em; margin-bottom: 10px;">
                <span class="cart-icon">📦</span>
                Promotional Items (${html.promotionalItems.length})
              </div>
              ${html.promotionalItems
                .map(
                  (item) => `
                <div class="cart-item">
                  <div class="item-header">
                    <div>
                      <div class="item-title">${item.title}</div>
                      <span class="item-type">Promotional</span>
                    </div>
                  </div>
                  <div class="item-details">
                    <div class="item-detail-row">${item.description}</div>
                  </div>
                </div>
              `
                )
                .join("")}
            </div>
          `
              : ""
          }
          
          ${
            (!html.designItems || html.designItems.length === 0) &&
            (!html.promotionalItems || html.promotionalItems.length === 0)
              ? `
            <div class="cart-empty">Cart is empty</div>
          `
              : ""
          }
        </div>
        
        ${
          html.additionalRequests && html.additionalRequests !== "None"
            ? `
          <div class="section">
            <h3>Additional Information</h3>
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; border: 1px solid #dee2e6;">
              ${html.additionalRequests}
            </div>
          </div>
        `
            : ""
        }
        
        <div class="footer">
          <p>This request was submitted on ${html.submittedAt}</p>
          <p>Please respond within 24 hours as promised to the customer.</p>
        </div>
      </div>
    </body>
    </html>
  `;
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

export async function POST(request, res) {
  const requestBody = await request.json();
  const { subject, html } = requestBody;

  const recipientEmails = [
    "kathy.craven@cementation.com",
    "canace@me.com",
    "ostevens@byu.edu",
  ];

  try {
    // Use the Design Hub HTML formatter
    const emailHtml = formattedDesignHubHtml(html);

    // Send mail with defined transport object
    let info = await myHometownTransporter.sendMail({
      to: recipientEmails.join(", "), // Join multiple emails with comma and space
      subject: subject || "Contact Form Submission", // Default subject
      html: emailHtml,
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Sent to: %s", recipientEmails.join(", "));

    return new Response(
      JSON.stringify({
        message: "Email sent successfully",
        recipients: recipientEmails,
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
