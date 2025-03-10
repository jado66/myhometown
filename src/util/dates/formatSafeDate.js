import moment from "moment";

export const formatSafeDate = (dateString) => {
  if (!dateString) return "";

  // First try standard moment parsing
  let parsedDate = moment(dateString);

  // If moment couldn't parse it properly, try manual parsing for MM-DD-YYYY format
  if (!parsedDate.isValid() && dateString.includes("-")) {
    const parts = dateString.split("-");
    if (parts.length === 3) {
      // If first part is 4 digits, it's likely YYYY-MM-DD already
      if (parts[0].length === 4) {
        parsedDate = moment(dateString);
      } else {
        // Otherwise, assume MM-DD-YYYY and convert to YYYY-MM-DD for better browser compatibility
        parsedDate = moment(
          `${parts[2]}-${parts[0]}-${parts[1]}`,
          "YYYY-MM-DD"
        );
      }
    }
  }

  return parsedDate.isValid()
    ? parsedDate.format("dddd, MMMM Do, YYYY")
    : dateString; // Fallback to original string if parsing still fails
};
