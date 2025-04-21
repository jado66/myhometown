import React from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import { Send, Warning } from "@mui/icons-material";
import RecipientsList from "./RecipientsList";
import MediaPreview from "./MediaPreview";

const ReviewAndSend = ({
  selectedRecipients,
  allContacts,
  message,
  mediaFiles,
  onSend,
  hasSent,
  isSending,
  onNewMessage,
}) => (
  <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
    <Typography variant="h6" gutterBottom textAlign="center">
      Review and Send
    </Typography>
    <Typography variant="body1" gutterBottom>
      Selected Recipients:
    </Typography>
    <Paper elevation={1} sx={{ p: 2, mb: 2, backgroundColor: "grey.100" }}>
      <RecipientsList
        selectedRecipients={selectedRecipients}
        contacts={allContacts}
      />
    </Paper>
    <Typography variant="body1" gutterBottom>
      Message:
    </Typography>
    <Paper elevation={1} sx={{ p: 2, mb: 2, backgroundColor: "grey.100" }}>
      <Typography sx={{ display: "flex" }}>
        {message?.trim() || (
          <>
            <Warning sx={{ mr: 2 }} />
            No message provided
          </>
        )}
      </Typography>
    </Paper>
    {mediaFiles.length > 0 && (
      <Box sx={{ mb: 2 }}>
        <Typography variant="body1" gutterBottom>
          Attachments:
        </Typography>
        <MediaPreview files={mediaFiles} showRemove={false} />
      </Box>
    )}
    <Button
      variant="contained"
      color="primary"
      onClick={onSend}
      startIcon={<Send />}
      disabled={hasSent || isSending}
    >
      Send
    </Button>
    {hasSent && (
      <Button
        variant="outlined"
        color="primary"
        onClick={onNewMessage}
        sx={{ ml: 2 }}
      >
        Send Another Message
      </Button>
    )}
  </Paper>
);

export default ReviewAndSend;
