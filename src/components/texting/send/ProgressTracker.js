import React from "react";
import {
  Paper,
  Typography,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Button,
} from "@mui/material";
import { Check, Close } from "@mui/icons-material";
import { formatTimestamp } from "@/util/texting/utils";

const ProgressTracker = ({ sendStatus, progress, onReset }) => {
  if (sendStatus === "idle") return null;

  const renderMessageResult = (result) => {
    if (result.status === "failed") {
      return `Error: ${result.error || "Unknown error"}`;
    }
    if (result.status === "sent") {
      let details = [];
      if (result.sid) details.push(`SID: ${result.sid}`);
      if (result.timestamp)
        details.push(`at ${formatTimestamp(result.timestamp)}`);
      return details.length > 0 ? details.join(" ") : "Sent";
    }
    return "Status unknown";
  };

  return (
    <Paper elevation={3} sx={{ p: 2, mt: 2, mx: "auto", mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Sending Progress
      </Typography>
      {sendStatus === "sending" && (
        <Typography variant="body2" sx={{ mb: 1 }}>
          Sending messages...
        </Typography>
      )}
      <Box sx={{ mb: 2 }}>
        <LinearProgress
          variant="determinate"
          value={(progress.completed / progress.total) * 100}
        />
        <Typography variant="body2" sx={{ mt: 1 }}>
          {progress.completed} of {progress.total} messages sent (
          {progress.successful} successful, {progress.failed} failed)
        </Typography>
      </Box>
      <List>
        {progress.results.map((result, index) => (
          <ListItem key={index}>
            <ListItemIcon>
              {result.status === "sent" ? (
                <Check color="success" />
              ) : (
                <Close color="error" />
              )}
            </ListItemIcon>
            <ListItemText
              primary={result.phone || result.recipient || "Unknown recipient"}
              secondary={renderMessageResult(result)}
            />
          </ListItem>
        ))}
      </List>
      {sendStatus === "completed" && (
        <Button variant="outlined" onClick={onReset} sx={{ mt: 2 }}>
          Clear Results
        </Button>
      )}
    </Paper>
  );
};

export default ProgressTracker;
