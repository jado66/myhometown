export const formatPhoneNumber = (phone) => {
  if (!phone) return "";

  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, "");

  // Check if it's a valid length (assuming US numbers for this example)
  if (cleaned.length < 10) return cleaned;

  // Format as (XXX) XXX-XXXX if 10 digits
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
      6
    )}`;
  }

  // If it's 11 digits and starts with 1 (US country code), format without the 1
  if (cleaned.length === 11 && cleaned.charAt(0) === "1") {
    return `(${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(
      7
    )}`;
  }

  // For international numbers or other formats, just group logically
  if (cleaned.length > 10) {
    // Group in chunks of 3-3-4 for longer numbers
    const lastFour = cleaned.slice(-4);
    const secondPart = cleaned.slice(-7, -4);
    const firstPart = cleaned.slice(0, -7);
    return `+${firstPart} ${secondPart}-${lastFour}`;
  }

  // Return the cleaned version if we can't format it properly
  return cleaned;
};
