import { List, ListItem, ListItemText, Typography } from "@mui/material";
import StatusChip from "./StatusChip";

/**
 * RecipientsList component to display recipients with their names and statuses
 *
 * @param {Object} props - Component props
 * @param {Array} props.recipients - Array of recipient phone numbers
 * @param {Array} props.statuses - Array of message statuses for each recipient
 * @param {Object|string} props.metadata - Metadata containing recipient information
 * @returns {JSX.Element} The RecipientsList component
 */
const RecipientsList = ({ recipients, statuses, metadata }) => {
  // Parse metadata to get recipient names if available
  let recipientData = [];

  try {
    // Check if we have metadata in the new format
    if (metadata) {
      const parsedMetadata =
        typeof metadata === "string" ? JSON.parse(metadata) : metadata;

      // Check for the new allRecipients field
      if (
        parsedMetadata.allRecipients &&
        Array.isArray(parsedMetadata.allRecipients)
      ) {
        recipientData = parsedMetadata.allRecipients.map((recipient) => ({
          name: recipient.name || "Unknown",
          phone: recipient.phone,
        }));
      } else if (
        parsedMetadata.recipientsList &&
        Array.isArray(parsedMetadata.recipientsList)
      ) {
        // For backward compatibility with older format
        recipientData = parsedMetadata.recipientsList.map((recipient) => ({
          name: recipient.name || "Unknown",
          phone: recipient.phone,
        }));
      }
    }
  } catch (error) {
    console.error("Error parsing metadata for recipients:", error);
  }

  // Fall back to just phone numbers if we couldn't extract names
  if (recipientData.length === 0 && recipients && recipients.length > 0) {
    recipientData = recipients.map((phone) => ({
      name: "Unknown",
      phone: phone,
    }));
  }

  if (!recipientData || recipientData.length === 0) return null;

  return (
    <List dense>
      {recipientData.map((recipient, index) => (
        <ListItem key={index} divider={index < recipientData.length - 1}>
          <ListItemText
            primary={
              <Typography>
                {recipient.name !== "Unknown" ? (
                  <strong>{recipient.name}</strong>
                ) : (
                  recipient.phone
                )}
              </Typography>
            }
            secondary={recipient.name !== "Unknown" ? recipient.phone : null}
          />
          {statuses && statuses[index] && (
            <StatusChip status={statuses[index]} />
          )}
        </ListItem>
      ))}
    </List>
  );
};

export default RecipientsList;
