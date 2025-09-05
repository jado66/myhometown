"use client";

import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import { OpenInNew as OpenInNewIcon } from "@mui/icons-material";

// Common Twilio error codes and their user-friendly explanations
const TWILIO_ERROR_CODES: Record<string, string> = {
  "30001":
    "Queue overflow - Too many messages sent too quickly. Try reducing send rate.",
  "30002":
    "Account suspended - Your Twilio account has been suspended. Contact Twilio support.",
  "30003":
    "Unreachable destination handset - The recipient's phone is turned off or out of service.",
  "30004":
    "Message blocked - The message was blocked by the carrier or recipient.",
  "30005":
    "Unknown destination handset - The phone number is invalid or doesn't exist.",
  "30006":
    "Landline or unreachable carrier - Cannot send SMS to this number (landline or unsupported carrier).",
  "30007": "Carrier violation - Message content violates carrier guidelines.",
  "30008": "Unknown error - An unknown error occurred during message delivery.",
  "30009":
    "Missing segment - Part of a long message was lost during transmission.",
  "30010": "Message body or destination number is too long.",
  "21211":
    "Invalid phone number format - The phone number is not in a valid format.",
  "21212": "The phone number is not a valid mobile number.",
  "21408": "Permission to send an SMS has not been enabled for the region.",
  "21610": "Message cannot be sent to the unsubscribed number.",
  "21614": "Message body is required.",
  "30450":
    "Message delivery failed - Temporary carrier issue. Message may be retried.",
  "30451": "Message delivery failed permanently - Will not be retried.",
  "63002": "Message content rejected by carrier spam filters.",
  "63003": "Message rejected due to blacklisted content.",
  "63016": "Message could not be delivered due to carrier restrictions.",
};

// Helper function to parse Twilio error and provide user-friendly explanation
const parseErrorMessage = (errorMessage: string | null) => {
  if (!errorMessage) return null;

  // Try to extract error code (format: "Error 30006: description" or just "30006")
  const errorCodeMatch = errorMessage.match(/(?:Error\s+)?(\d{5})/i);

  if (errorCodeMatch) {
    const errorCode = errorCodeMatch[1];
    const knownError = TWILIO_ERROR_CODES[errorCode];

    if (knownError) {
      return {
        type: "known" as const,
        code: errorCode,
        explanation: knownError,
        originalMessage: errorMessage,
      };
    }
  }

  // If it's not a known error code, provide Google search option
  return {
    type: "unknown" as const,
    originalMessage: errorMessage,
    searchQuery: `Twilio ${errorMessage}`,
  };
};

interface ErrorMessageDisplayProps {
  errorMessage: string | null;
}

export const ErrorMessageDisplay = ({
  errorMessage,
}: ErrorMessageDisplayProps) => {
  if (!errorMessage) return null;

  const parsedError = parseErrorMessage(errorMessage);

  if (!parsedError) return null;

  if (parsedError.type === "known") {
    return (
      <Box sx={{ mb: 1 }}>
        <Typography
          variant="caption"
          color="error.main"
          sx={{ display: "block", fontWeight: 600, mb: 0.5 }}
        >
          Error {parsedError.code}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mb: 0.5 }}
        >
          {parsedError.explanation}
        </Typography>
        <Typography
          variant="caption"
          color="text.disabled"
          sx={{ display: "block", fontSize: "0.7rem", fontStyle: "italic" }}
        >
          Original: {parsedError.originalMessage}
        </Typography>
      </Box>
    );
  }

  // Unknown error - provide Google search link
  const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(
    parsedError.searchQuery
  )}`;

  return (
    <Box sx={{ mb: 1 }}>
      <Typography
        variant="caption"
        color="error.main"
        sx={{ display: "block", fontWeight: 600, mb: 0.5 }}
      >
        Error: {parsedError.originalMessage}
      </Typography>
      <Link
        href={googleSearchUrl}
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.5,
          fontSize: "0.7rem",
          color: "primary.main",
          textDecoration: "none",
          "&:hover": {
            textDecoration: "underline",
          },
        }}
      >
        Search for this error on Google
        <OpenInNewIcon sx={{ fontSize: 10 }} />
      </Link>
    </Box>
  );
};
