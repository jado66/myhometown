/**
 * Utility functions for text logs
 */

/**
 * Format timestamp in a user-friendly way
 *
 * @param {string} timestamp - The timestamp to format
 * @returns {string} Formatted date/time string
 */
export const formatDateTime = (timestamp) => {
  if (!timestamp) return "N/A";

  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return "Invalid date";

    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Error";
  }
};

/**
 * Determine the overall status for a group of messages
 *
 * @param {Array} statuses - Array of message statuses
 * @returns {string} Summary status
 */
export const getStatusSummary = (statuses) => {
  if (!statuses || statuses.length === 0) return "Unknown";

  const counts = {
    failed: 0,
    sent: 0,
    delivered: 0,
    unknown: 0,
  };

  statuses.forEach((status) => {
    if (status?.toLowerCase() === "failed") counts.failed++;
    else if (status?.toLowerCase() === "sent") counts.sent++;
    else if (status?.toLowerCase() === "delivered") counts.delivered++;
    else counts.unknown++;
  });

  // Determine primary status (prioritize failed > sent > delivered)
  let primaryStatus = "delivered";
  if (counts.failed > 0) primaryStatus = "failed";
  else if (counts.sent > 0) primaryStatus = "sent";

  return primaryStatus;
};
