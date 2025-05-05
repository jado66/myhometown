/**
 * Utility functions for resending text messages
 */

/**
 * Creates a link to resend a text message using the existing SMS functionality
 * @param {object} logData - The text message log data
 * @param {object} options - Optional parameters for customizing the message
 * @returns {string} URL to the SMS page with prefilled data
 */
export const createResendTextLink = (logData, options = {}) => {
  try {
    // Base SMS URL
    const baseUrl = "/admin-dashboard/texting/send";

    // Extract recipients data from metadata
    let recipients = [];
    let mediaUrls = [];

    // Parse the metadata if it exists
    if (logData.metadata) {
      const metadata =
        typeof logData.metadata === "string"
          ? JSON.parse(logData.metadata)
          : logData.metadata;

      // Try to get recipients from our new metadata structure
      if (metadata.allRecipients && Array.isArray(metadata.allRecipients)) {
        recipients = metadata.allRecipients.map((r) => r.phone);
      } else if (
        metadata.recipientsList &&
        Array.isArray(metadata.recipientsList)
      ) {
        // Backward compatibility
        recipients = metadata.recipientsList.map((r) => r.phone);
      }

      // If we couldn't extract recipients from metadata, use the recipient_phone field
      if (recipients.length === 0 && logData.recipient_phone) {
        recipients = [logData.recipient_phone];
      }

      // If we couldn't extract recipients but have multiple recipients in the log
      if (
        recipients.length === 0 &&
        logData.recipients &&
        Array.isArray(logData.recipients)
      ) {
        recipients = logData.recipients;
      }
    } else if (logData.recipient_phone) {
      // Fallback if no metadata
      recipients = [logData.recipient_phone];
    } else if (logData.recipients && Array.isArray(logData.recipients)) {
      recipients = logData.recipients;
    }

    // Extract media URLs if they exist
    if (logData.media_urls) {
      try {
        mediaUrls =
          typeof logData.media_urls === "string"
            ? JSON.parse(logData.media_urls)
            : logData.media_urls;
      } catch (error) {
        console.error("Error parsing media URLs:", error);
      }
    }

    // Build query parameters
    const params = new URLSearchParams();

    // Add recipients as comma-separated string
    if (recipients.length > 0) {
      params.append("phone", recipients.join(","));
    }

    // Add message content
    if (options.message) {
      params.append("message", options.message);
    } else if (logData.message_content) {
      params.append("message", logData.message_content);
    }

    // Add media URLs if they exist
    if (mediaUrls.length > 0 && !options.skipMedia) {
      params.append("mediaUrls", JSON.stringify(mediaUrls));
    }

    // Construct the full URL
    return `${baseUrl}?${params.toString()}`;
  } catch (error) {
    console.error("Error creating resend link:", error);
    // Return a basic link if there's an error
    return "/admin-dashboard/texting/send";
  }
};

/**
 * Creates a link to send a text message to an item (bug or feature request)
 * @param {object} item - The item containing recipient data
 * @param {string} message - The message to send
 * @returns {string} URL to the SMS page with prefilled data
 */
export const createItemTextLink = (item, message) => {
  try {
    // Base SMS URL
    const baseUrl =
      process.env.NEXT_PUBLIC_DOMAIN + "/admin-dashboard/texting/send";

    // Build query parameters
    const params = new URLSearchParams();

    // Add recipient phone number if available
    if (item.phone_number) {
      params.append("phone", item.phone_number);
    }

    // Add message content
    if (message) {
      params.append("message", message);
    }

    // Construct the full URL
    return `${baseUrl}?${params.toString()}`;
  } catch (error) {
    console.error("Error creating item text link:", error);
    // Return a basic link if there's an error
    return "/admin-dashboard/texting/send";
  }
};
