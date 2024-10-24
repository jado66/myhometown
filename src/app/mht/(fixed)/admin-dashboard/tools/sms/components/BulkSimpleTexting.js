import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  CssBaseline,
  Card,
  Typography,
  TextField,
  Button,
  Paper,
  Popover,
  List,
  ListItem,
  ListItemText,
  Divider,
  LinearProgress,
  ListItemIcon,
  IconButton,
} from "@mui/material";
import {
  Send,
  Info,
  Check,
  Close,
  AttachFile,
  Clear,
} from "@mui/icons-material";
import Select from "react-select";
import BackButton from "@/components/BackButton";
import { useSendSMS } from "@/hooks/communications/useSendSMS";
import { toast } from "react-toastify";

export default function BulkSimpleTexting() {
  const [message, setMessage] = useState("");
  const [contacts, setContacts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const { sendStatus, progress, sendMessages, reset } = useSendSMS();
  const [hasSent, setHasSent] = useState(false);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const savedContacts = JSON.parse(localStorage.getItem("contacts")) || [];
    const savedGroups = JSON.parse(localStorage.getItem("groups")) || [];
    setContacts(savedContacts);
    setGroups(savedGroups);
  }, []);

  useEffect(() => {
    setHasSent(false);
  }, [message, selectedRecipients, mediaFile]);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setIsUploading(true);

      // Create FormData for S3 upload
      const response = await fetch("/api/database/media/s3/getPresignedUrl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          originalFilename: file.name,
        }),
      });

      const { url, fields } = await response.json();
      const formData = new FormData();
      Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value);
      });
      formData.append("file", file);

      // Upload to S3
      const uploadResponse = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Upload failed");
      }

      // Get the public URL
      const mediaUrl = `https://${process.env.NEXT_PUBLIC_AWS_BUCKET_NAME}.s3.us-west-1.amazonaws.com/${fields.key}`;

      setMediaFile(mediaUrl);
      setMediaPreview(URL.createObjectURL(file));
      toast.success("Media uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload media");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
  };

  const formatTimestamp = (timestamp) => {
    try {
      // First check if timestamp is valid
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        throw new Error("Invalid date");
      }

      // Format the time in a locale-friendly way
      return date.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch (error) {
      console.warn("Invalid timestamp:", timestamp);
      return "Time unavailable";
    }
  };

  const renderMessageResult = (result) => {
    console.log(
      "Timestamp received:",
      result.timestamp,
      typeof result.timestamp
    );

    if (result.status === "failed") {
      return `Error: ${result.error}`;
    }

    const timeString = formatTimestamp(result.timestamp);
    console.log("Formatted time:", timeString);
    return `Sent at ${timeString}`;
  };

  const expandGroups = (recipients) => {
    return recipients.map((recipient) => {
      // Check if recipient and recipient.value exist and are strings
      if (
        typeof recipient.value === "string" &&
        recipient.value.startsWith("group:")
      ) {
        const groupName = recipient.value.replace("group:", "");
        const groupContacts = contacts.filter((contact) =>
          contact.groups.some((g) => g.value === groupName)
        );
        return {
          groupName: recipient.label.props.children[0].props.children,
          contacts: groupContacts.map((contact) => ({
            value: contact.phone,
            label: `${contact.name} (${contact.phone})`,
          })),
        };
      }
      return {
        groupName: "Individual Contacts",
        contacts: [recipient],
      };
    });
  };

  const handleSend = async () => {
    const expandedRecipients = expandGroups(selectedRecipients).flatMap(
      (group) => group.contacts
    );

    try {
      await sendMessages(message, expandedRecipients, mediaFile);
      setHasSent(true);
    } catch (error) {
      console.error("Error sending messages:", error);
      toast.error("Failed to send messages: " + error.message);
    }
  };

  const handleRecipientSelection = (selected) => {
    setSelectedRecipients(selected);
  };

  const handleGroupInfoClick = (event, group) => {
    setAnchorEl(event.currentTarget);
    setSelectedGroup(group);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
    setSelectedGroup(null);
  };

  const handleNewMessage = () => {
    setMessage("");
    setSelectedRecipients([]);
    setHasSent(false);
    reset();
    setActiveTab(0);
  };

  const getGroupMembers = (groupValue) => {
    return contacts.filter((contact) =>
      contact.groups.some((g) => g.value === groupValue)
    );
  };

  const renderProgress = () => {
    if (sendStatus === "idle") return null;

    return (
      <Paper elevation={3} sx={{ p: 2, mt: 2, mx: "auto", mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Sending Progress
        </Typography>
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
                {result.status === "success" ? (
                  <Check color="success" />
                ) : (
                  <Close color="error" />
                )}
              </ListItemIcon>
              <ListItemText
                primary={result.recipient}
                secondary={renderMessageResult(result)}
              />
            </ListItem>
          ))}
        </List>

        {sendStatus === "completed" && (
          <Button variant="outlined" onClick={reset} sx={{ mt: 2 }}>
            Clear Results
          </Button>
        )}
      </Paper>
    );
  };

  return (
    <>
      <BackButton
        top="0px"
        text={activeTab === 0 ? "Back to Admin Dashboard" : "Edit Message"}
        onClick={activeTab === 0 ? null : () => setActiveTab(0)}
      />
      <Card
        sx={{
          width: "100%",
          m: 3,
          mt: 5,
          p: 3,
          display: "flex",
          flexDirection: "column",
          boxShadow: "none",
          overflowX: "auto",
        }}
      >
        <Box>
          <CssBaseline />

          <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            {activeTab === 0 && (
              <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Compose Message
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  variant="outlined"
                  label="Message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  sx={{ mb: 2 }}
                />

                <Box sx={{ mb: 2 }}>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    style={{ display: "none" }}
                    id="media-upload"
                    onChange={handleFileSelect}
                  />
                  <label htmlFor="media-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<AttachFile />}
                      disabled={isUploading}
                    >
                      {isUploading ? "Uploading..." : "Attach Media"}
                    </Button>
                  </label>

                  {mediaPreview && (
                    <Box
                      sx={{
                        mt: 2,
                        position: "relative",
                        display: "inline-block",
                      }}
                    >
                      <img
                        src={mediaPreview}
                        alt="Media preview"
                        style={{ maxWidth: "200px", maxHeight: "200px" }}
                      />
                      <IconButton
                        size="small"
                        sx={{
                          position: "absolute",
                          top: -8,
                          right: -8,
                          backgroundColor: "white",
                        }}
                        onClick={handleRemoveMedia}
                      >
                        <Clear />
                      </IconButton>
                    </Box>
                  )}
                </Box>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  variant="outlined"
                  label="Message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Typography variant="subtitle1" gutterBottom>
                  Select Recipients
                </Typography>
                <Select
                  isMulti
                  options={[
                    ...contacts.map((c) => ({
                      value: c.phone,
                      label: `${c.name} (${c.phone})`,
                    })),
                    ...groups.map((g) => ({
                      value: `group:${g.value}`,
                      label: (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <span>{`Group: ${g.label}`}</span>
                          <Info
                            style={{ cursor: "pointer", marginLeft: "8px" }}
                            onClick={(e) => handleGroupInfoClick(e, g)}
                          />
                        </div>
                      ),
                    })),
                  ]}
                  value={selectedRecipients}
                  onChange={handleRecipientSelection}
                  placeholder="Select recipients or groups"
                />

                <Button
                  sx={{ mt: 2 }}
                  variant="contained"
                  color="primary"
                  onClick={() => setActiveTab(2)}
                  startIcon={<Send />}
                >
                  Review and Send
                </Button>
              </Paper>
            )}

            {activeTab === 2 && (
              <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Review and Send
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Message:
                </Typography>
                <Paper
                  elevation={1}
                  sx={{ p: 2, mb: 2, backgroundColor: "grey.100" }}
                >
                  <Typography>{message}</Typography>
                </Paper>
                <Typography variant="body1" gutterBottom>
                  Selected Recipients:
                </Typography>
                <Paper
                  elevation={1}
                  sx={{ p: 2, mb: 2, backgroundColor: "grey.100" }}
                >
                  {expandGroups(selectedRecipients).map((group, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: "bold" }}
                      >
                        {group.groupName}
                      </Typography>
                      <List dense>
                        {group.contacts.map((contact) => (
                          <ListItem key={contact.value}>
                            <ListItemText primary={contact.label} />
                          </ListItem>
                        ))}
                      </List>
                      {index < expandGroups(selectedRecipients).length - 1 && (
                        <Divider />
                      )}
                    </Box>
                  ))}
                </Paper>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSend}
                  startIcon={<Send />}
                  disabled={hasSent}
                >
                  Send
                </Button>
                {hasSent && (
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={handleNewMessage}
                    sx={{ ml: 2 }}
                  >
                    Send Another Message
                  </Button>
                )}
              </Paper>
            )}
          </Box>
        </Box>
      </Card>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        {selectedGroup && (
          <Box sx={{ p: 2, maxWidth: 300 }}>
            <Typography variant="h6" gutterBottom>
              {selectedGroup.label} Members
            </Typography>
            <List dense>
              {getGroupMembers(selectedGroup.value).map((contact) => (
                <ListItem key={contact.id}>
                  <ListItemText
                    primary={contact.name}
                    secondary={`${contact.phone} | ${contact.email}`}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Popover>
      {renderProgress()}
    </>
  );
}
