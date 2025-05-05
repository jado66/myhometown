import { Button, Tooltip, IconButton } from "@mui/material";
import { RestartAlt, Message } from "@mui/icons-material";
import { useState } from "react";

/**
 * Creates a link to resend a text message using the existing SMS functionality
 * @param {object} logData - The text message log data
 * @param {object} options - Optional parameters for customizing the message
 * @returns {string} URL to the SMS page with prefilled data
 */
const createResendTextLink = (logData, options = {}) => {
  try {
    // Base SMS URL
    const baseUrl =
      process.env.NEXT_PUBLIC_DOMAIN + "/admin-dashboard/texting/send";

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
 * ResendTextButton Component - Adds a button to resend a text message
 *
 * @param {Object} props - Component props
 * @param {Object} props.logData - The text message log data
 * @param {string} props.variant - Button variant (text, contained, outlined)
 * @param {string} props.size - Button size (small, medium, large)
 * @param {boolean} props.useIconButton - Use an IconButton instead of a regular Button
 * @param {Object} props.buttonProps - Additional props to pass to the Button component
 * @returns {JSX.Element} The ResendTextButton component
 */
const ResendTextButton = ({
  logData,
  variant = "contained",
  size = "small",
  color = "primary",
  text = "Resend",
  useIconButton = false,
  buttonProps = {},
}) => {
  const [linkUrl, setLinkUrl] = useState("#");

  // Generate the link URL when needed
  const handleClick = (e) => {
    // If link wasn't already generated, generate it now
    if (linkUrl === "#") {
      const url = createResendTextLink(logData);
      setLinkUrl(url);

      // If generated successfully, navigate
      if (url !== "/admin-dashboard/texting/send") {
        // If we're dealing with a multi-recipient message, try opening in a new tab
        const recipientCount =
          (logData.recipients && logData.recipients.length) ||
          (logData.recipient_phone ? 1 : 0);

        if (recipientCount > 1) {
          window.open(url, "_blank");
          e.preventDefault();
        } else {
          // For single recipients, just update the href
          e.currentTarget.href = url;
        }
      }
    }
  };

  // Render either an IconButton or a regular Button based on the prop
  if (useIconButton) {
    return (
      <Tooltip title="Resend this text">
        <IconButton
          href={linkUrl}
          onClick={handleClick}
          size={size}
          color={color}
          {...buttonProps}
        >
          <RestartAlt fontSize="small" />
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <Button
      href={linkUrl}
      onClick={handleClick}
      variant={variant}
      size={size}
      color={color}
      startIcon={<RestartAlt />}
      {...buttonProps}
    >
      {text}
    </Button>
  );
};

export default ResendTextButton;
