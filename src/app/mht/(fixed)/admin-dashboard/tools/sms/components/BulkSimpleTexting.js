import React, { useState, useEffect } from "react";
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
  Alert,
  AlertTitle,
} from "@mui/material";
import {
  Send,
  Info,
  Check,
  Close,
  AttachFile,
  Clear,
  Warning,
  Error,
} from "@mui/icons-material";
import Select from "react-select";
import BackButton from "@/components/BackButton";
import { useSendSMS } from "@/hooks/communications/useSendSMS";
import { toast } from "react-toastify";
import { useRedisHealth } from "@/hooks/health/useRedisHealth";
import { RecipientsList } from "./RecipientList";
import { useSearchParams } from "next/navigation";

const MAX_ATTACHMENTS = 10;
const MAX_TOTAL_SIZE_MB = 5;
const MAX_TOTAL_SIZE_BYTES = MAX_TOTAL_SIZE_MB * 1024 * 1024; // Convert MB to bytes

export default function BulkMMSMessaging() {
  const searchParams = useSearchParams();

  const [message, setMessage] = useState("");
  const [contacts, setContacts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const { sendStatus, progress, sendMessages, reset } = useSendSMS();
  const [hasSent, setHasSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [mediaFiles, setMediaFiles] = useState([]); // Array of {url, preview} objects
  const [isUploading, setIsUploading] = useState(false);
  const [totalFileSize, setTotalFileSize] = useState(0);

  const redisHealth = useRedisHealth(60000);

  useEffect(() => {
    const phone = searchParams.get("phone");
    const urlMessage = searchParams.get("message");

    if (urlMessage) {
      const decodedMessage = decodeURIComponent(urlMessage);
      setMessage(decodedMessage);
    }

    if (phone) {
      setSelectedRecipients([
        {
          value: phone,
          label: `${phone}`,
        },
      ]);
    }
  }, [searchParams]);

  useEffect(() => {
    const savedContacts = JSON.parse(localStorage.getItem("contacts")) || [];
    const savedGroups = JSON.parse(localStorage.getItem("groups")) || [];
    setContacts(savedContacts);
    setGroups(savedGroups);
  }, []);

  // upon completion send toast message with amount of messages sent / total
  // useEffect(() => {
  //   if (sendStatus === "completed") {
  //     toast.success(
  //       `Sent ${progress.successful} of ${progress.total} messages`
  //     );
  //   }
  // }, [sendStatus]);

  useEffect(() => {
    setHasSent(false);
    setIsSending(false);
  }, [message, selectedRecipients, mediaFiles]);

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);

    // Check number of attachments
    if (mediaFiles.length + files.length > MAX_ATTACHMENTS) {
      toast.error(`Maximum ${MAX_ATTACHMENTS} attachments allowed`);
      return;
    }

    // Calculate total size including existing files
    const newTotalSize = files.reduce(
      (acc, file) => acc + file.size,
      totalFileSize
    );

    if (newTotalSize > MAX_TOTAL_SIZE_BYTES) {
      toast.error(
        `Total file size must be less than ${MAX_TOTAL_SIZE_MB}MB. Current total: ${formatFileSize(
          newTotalSize
        )}`
      );
      return;
    }

    setIsUploading(true);

    try {
      for (const file of files) {
        // Sanitize filename - replace spaces with underscores
        const sanitizedFilename = file.name.replace(/\s+/g, "_");

        const response = await fetch("/api/database/media/s3/getPresignedUrl", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: sanitizedFilename,
            contentType: file.type,
            originalFilename: sanitizedFilename,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to get presigned URL");
        }

        const { url, fields } = await response.json();

        const formData = new FormData();
        Object.entries(fields).forEach(([key, value]) => {
          formData.append(key, value);
        });
        formData.append("file", file);

        const uploadResponse = await fetch(url, {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error("Upload failed");
        }

        const bucketName =
          fields.bucket || process.env.NEXT_PUBLIC_AWS_BUCKET_NAME;
        const region = "us-west-1";
        const mediaUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${encodeURIComponent(
          fields.key
        )}`;

        setMediaFiles((prev) => [
          ...prev,
          {
            url: mediaUrl,
            preview: URL.createObjectURL(file),
            type: file.type,
            size: file.size, // Store file size
          },
        ]);

        setTotalFileSize((prev) => prev + file.size);
      }

      toast.success("Media uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload media: " + error.message);
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };
  const handleRemoveMedia = (index) => {
    setMediaFiles((prev) => {
      const removedFile = prev[index];
      setTotalFileSize((prevSize) => prevSize - (removedFile.size || 0));
      return prev.filter((_, i) => i !== index);
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
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
            label: `${contact.firstName} ${contact.lastName} (${contact.phone})`,
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
    // Process recipients to keep only the first occurrence of each phone number
    const phoneNumberMap = new Map();
    const uniqueRecipients = [];

    const expandedRecipients = expandGroups(selectedRecipients).flatMap(
      (group) => group.contacts
    );

    expandedRecipients.forEach((recipient) => {
      if (!phoneNumberMap.has(recipient.value)) {
        phoneNumberMap.set(recipient.value, true);
        uniqueRecipients.push(recipient);
      }
    });

    try {
      const mediaUrls = mediaFiles.map((file) => file.url);
      setIsSending(true);
      await sendMessages(message, uniqueRecipients, mediaUrls);
      setHasSent(true);
      setIsSending(false);
    } catch (error) {
      console.error("Error sending messages:", error);
      toast.error("Failed to send messages: " + error.message);
      setIsSending(false);
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
    setMediaFiles([]);
    setHasSent(false);
    setTotalFileSize(0);
    setIsSending(false);
    reset();
    setActiveTab(0);
  };

  const getGroupMembers = (groupValue) => {
    return contacts.filter((contact) =>
      contact.groups.some((g) => g.value === groupValue)
    );
  };

  const renderMediaPreviews = (files, showRemove = true) => (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 2 }}>
      {files.map((file, index) => (
        <Box key={index} sx={{ position: "relative", display: "inline-block" }}>
          {file.type.startsWith("image/") ? (
            <img
              src={file.preview}
              alt={`Media ${index + 1}`}
              style={{
                width: "150px",
                height: "150px",
                objectFit: "cover",
                borderRadius: "4px",
              }}
            />
          ) : (
            <Box
              sx={{
                width: "150px",
                height: "150px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "grey.200",
                borderRadius: "4px",
              }}
            >
              <Typography variant="body2">
                {file.type.split("/")[1].toUpperCase()} File
              </Typography>
            </Box>
          )}
          {activeTab === 0 && (
            <Typography
              variant="caption"
              sx={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                bgcolor: "rgba(0, 0, 0, 0.6)",
                color: "white",
                padding: "4px",
                textAlign: "center",
              }}
            >
              {formatFileSize(file.size)}
            </Typography>
          )}

          {showRemove && (
            <IconButton
              size="small"
              sx={{
                position: "absolute",
                top: -8,
                right: -8,
                backgroundColor: "white",
                "&:hover": {
                  backgroundColor: "grey.100",
                },
              }}
              onClick={() => handleRemoveMedia(index)}
            >
              <Clear />
            </IconButton>
          )}
        </Box>
      ))}
      {/* {mediaFiles.length > 0 && (
        <Typography variant="caption" sx={{ width: "100%", mt: 1 }}>
          Total size: {formatFileSize(totalFileSize)} / {MAX_TOTAL_SIZE_MB}MB
        </Typography>
      )} */}
    </Box>
  );

  const renderProgress = () => {
    if (sendStatus === "idle") return null;

    return (
      <Paper elevation={3} sx={{ p: 2, mt: 2, mx: "auto", mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Sending Progress
        </Typography>

        {/* Spinner */}
        {sendStatus === "sending" && (
          <>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Sending messages...
            </Typography>
          </>
        )}

        {/* Progress bar */}

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

  if (!redisHealth.isConnected && !redisHealth.isLoading) {
    <Alert
      severity="error"
      sx={{
        position: "sticky",
        top: "64px",
        zIndex: 1000,
        mx: 3,
        mt: 2,
      }}
    >
      <AlertTitle>Texting Service Unavailable</AlertTitle>
      The messaging service is currently experiencing technical difficulties.
      Please try again later.
      {redisHealth.lastChecked && (
        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
          Last checked: {new Date(redisHealth.lastChecked).toLocaleString()}
        </Typography>
      )}
    </Alert>;
  }

  const uniqueGroups = new Set(groups.map((g) => g.value));
  const uniqueGroupOptions = Array.from(uniqueGroups).map((value) => {
    const group = groups.find((g) => g.value === value);
    return {
      value: `group:${group.value}`,
      label: (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>{`Group: ${group.label}`}</span>
          <Info
            style={{ cursor: "pointer", marginLeft: "8px" }}
            onClick={(e) => handleGroupInfoClick(e, group)}
          />
        </div>
      ),
    };
  });

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
          {contacts.length === 0 && (
            <Alert severity="info">
              You don't have any contacts in your Directory. Visit your{" "}
              <a href="./directory">Contact Directory</a> to add contacts.
            </Alert>
          )}

          <CssBaseline />

          <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            {activeTab === 0 && (
              <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ mb: 2, textAlign: "center" }}
                >
                  Compose Message
                </Typography>

                <Typography variant="subtitle1" gutterBottom>
                  Select Recipients
                </Typography>
                <Select
                  isMulti
                  closeMenuOnSelect={false}
                  options={[
                    ...contacts.map((c) => ({
                      value: c.id,
                      label: `${c.firstName} ${c.lastName} (${c.phone})`,
                    })),
                    ...uniqueGroupOptions,
                  ]}
                  value={selectedRecipients}
                  onChange={handleRecipientSelection}
                  placeholder="Select recipients or groups"
                />

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                  Message Content
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  variant="outlined"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  sx={{ mb: 2 }}
                  error={message.length > 1600}
                  helperText={
                    message.length > 1600 &&
                    "MSM messages are limited to 1600 characters"
                  }
                />

                <Divider sx={{ mb: 2 }} />

                <Box sx={{ mb: 2 }}>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    style={{ display: "none" }}
                    id="media-upload"
                    onChange={handleFileSelect}
                  />
                  <label htmlFor="media-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<AttachFile />}
                      disabled={
                        isUploading || mediaFiles.length >= MAX_ATTACHMENTS
                      }
                    >
                      {isUploading ? "Uploading..." : "Attach Media"}
                    </Button>
                  </label>

                  {/* <Typography
                    variant="caption"
                    sx={{ display: "block", mt: 1 }}
                  >
                    {mediaFiles.length} of {MAX_ATTACHMENTS} attachments used
                  </Typography> */}

                  {mediaFiles.length > 0 && renderMediaPreviews(mediaFiles)}
                </Box>

                <Button
                  sx={{ mt: 2 }}
                  variant="contained"
                  color="primary"
                  onClick={() => setActiveTab(2)}
                  startIcon={<Send />}
                  disabled={selectedRecipients.length === 0}
                >
                  Review and Send
                </Button>
              </Paper>
            )}

            {activeTab === 2 && (
              <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
                <Typography variant="h6" gutterBottom textAlign="center">
                  Review and Send
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Selected Recipients:
                </Typography>
                <Paper
                  elevation={1}
                  sx={{ p: 2, mb: 2, backgroundColor: "grey.100" }}
                >
                  <RecipientsList
                    selectedRecipients={selectedRecipients}
                    contacts={contacts}
                  />
                </Paper>
                <Typography variant="body1" gutterBottom>
                  Message:
                </Typography>
                <Paper
                  elevation={1}
                  sx={{ p: 2, mb: 2, backgroundColor: "grey.100" }}
                >
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
                    {renderMediaPreviews(mediaFiles, false)}
                  </Box>
                )}

                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSend}
                  startIcon={<Send />}
                  disabled={hasSent || isSending}
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
                    primary={`${contact.firstName} ${contact.lastName}`}
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
