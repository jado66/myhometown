import { Chip } from "@mui/material";
import { CheckCircle, Error as ErrorIcon, Schedule } from "@mui/icons-material";

/**
 * StatusChip component to display message status
 *
 * @param {Object} props - Component props
 * @param {string} props.status - Message status (sent, delivered, failed)
 * @returns {JSX.Element} The StatusChip component
 */
const StatusChip = ({ status }) => {
  let color = "default";
  let icon = null;

  switch (status?.toLowerCase()) {
    case "sent":
      color = "info";
      icon = <Schedule fontSize="small" />;
      break;
    case "delivered":
      color = "success";
      icon = <CheckCircle fontSize="small" />;
      break;
    case "failed":
      color = "error";
      icon = <ErrorIcon fontSize="small" />;
      break;
    default:
      color = "default";
  }

  return (
    <Chip label={status || "Unknown"} color={color} size="small" icon={icon} />
  );
};

export default StatusChip;
