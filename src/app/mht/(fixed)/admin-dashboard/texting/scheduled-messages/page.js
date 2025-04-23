"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Alert,
  Tooltip,
  Divider,
} from "@mui/material";
import {
  Delete,
  EditCalendar,
  Schedule,
  AccessTime,
  Group,
  Message,
  Image,
  InfoOutlined,
  Person,
} from "@mui/icons-material";
import moment from "moment";
import { useScheduledTexts } from "@/hooks/communications/useScheduledTexts";
import { useUser } from "@/hooks/use-user";
import BackButton from "@/components/BackButton";

export default function ScheduledTextsPage() {
  const { user } = useUser();
  const {
    getScheduledTexts,
    deleteScheduledText,
    batchDeleteScheduledTexts,
    loading,
    error,
  } = useScheduledTexts();

  const [scheduledTexts, setScheduledTexts] = useState([]);
  const [selectedText, setSelectedText] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [loadingTexts, setLoadingTexts] = useState(true);

  useEffect(() => {
    const loadScheduledTexts = async () => {
      if (!user?.id) return;

      setLoadingTexts(true);
      const { data } = await getScheduledTexts(user.id);
      setScheduledTexts(data || []);
      setLoadingTexts(false);
    };

    loadScheduledTexts();

    // Refresh every minute to update times
    const intervalId = setInterval(loadScheduledTexts, 60000);

    return () => clearInterval(intervalId);
  }, [user, getScheduledTexts]);

  const handleDeleteClick = (text) => {
    setSelectedText(text);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedText || !user?.id) return;

    await deleteScheduledText(selectedText.id, user.id);

    // Refresh the list
    const { data } = await getScheduledTexts(user.id);
    setScheduledTexts(data || []);

    setDeleteDialogOpen(false);
    setSelectedText(null);
  };

  const handleViewClick = (text) => {
    setSelectedText(text);
    setViewDialogOpen(true);
  };

  // Format recipient count from JSON data
  const getRecipientCount = (recipientsJson) => {
    try {
      const recipients = JSON.parse(recipientsJson || "[]");
      return recipients.length;
    } catch (e) {
      console.error("Error parsing recipients:", e);
      return 0;
    }
  };

  // Format recipients for display
  const formatRecipients = (recipientsJson) => {
    try {
      const recipients = JSON.parse(recipientsJson || "[]");
      return recipients.map((r) => ({
        name:
          r.label ||
          r.name ||
          `${r.firstName || ""} ${r.lastName || ""}`.trim() ||
          r.value ||
          r.phone,
        phone: r.value || r.phone,
      }));
    } catch (e) {
      console.error("Error parsing recipients:", e);
      return [];
    }
  };

  // Format media files for display
  const formatMediaFiles = (mediaUrlsJson) => {
    try {
      return JSON.parse(mediaUrlsJson || "[]");
    } catch (e) {
      console.error("Error parsing media URLs:", e);
      return [];
    }
  };

  // Get user timezone using native JavaScript
  const getUserTimeZone = () => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  };

  return (
    <>
      <BackButton top="0px" text="Back to Admin Dashboard" />
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
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h5" component="h1">
            <Schedule sx={{ verticalAlign: "middle", mr: 1 }} />
            Scheduled Messages
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Error: {error.message || "Failed to load scheduled messages"}
          </Alert>
        )}

        {loadingTexts ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : scheduledTexts.length === 0 ? (
          <Paper
            elevation={1}
            sx={{
              p: 4,
              textAlign: "center",
              backgroundColor: "background.default",
            }}
          >
            <Schedule sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No Scheduled Messages
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={3}>
              You haven't scheduled any messages for future delivery.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              href="/communications/bulk"
            >
              Create a New Message
            </Button>
          </Paper>
        ) : (
          <TableContainer component={Paper} elevation={1}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Scheduled For</TableCell>
                  <TableCell>Message</TableCell>
                  <TableCell>Recipients</TableCell>
                  <TableCell>Media</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {scheduledTexts.map((text) => {
                  const scheduledMoment = moment(text.scheduled_time);
                  const recipientCount = getRecipientCount(text.recipients);
                  const mediaFiles = formatMediaFiles(text.media_urls);

                  return (
                    <TableRow key={text.id} hover>
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <AccessTime fontSize="small" color="action" />
                          <Box>
                            <Typography variant="body2">
                              {scheduledMoment.format("MMM D, YYYY")}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {scheduledMoment.format("h:mm A")} (
                              {getUserTimeZone()})
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            maxWidth: "300px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {text.message_content || "<No message content>"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={<Group fontSize="small" />}
                          label={`${recipientCount} ${
                            recipientCount === 1 ? "recipient" : "recipients"
                          }`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        {mediaFiles.length > 0 ? (
                          <Chip
                            icon={<Image fontSize="small" />}
                            label={`${mediaFiles.length} ${
                              mediaFiles.length === 1
                                ? "attachment"
                                : "attachments"
                            }`}
                            size="small"
                            color="secondary"
                            variant="outlined"
                          />
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            No attachments
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => handleViewClick(text)}
                          >
                            <InfoOutlined fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(text)}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Scheduled Message</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this scheduled message? This action
            cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedText && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center">
                <Schedule sx={{ mr: 1 }} />
                Scheduled Message Details
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Scheduled For
                </Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <AccessTime color="primary" sx={{ mr: 1 }} />
                    <Typography>
                      {moment(selectedText.scheduled_time).format(
                        "MMMM D, YYYY [at] h:mm A"
                      )}{" "}
                      ({getUserTimeZone()})
                    </Typography>
                  </Box>
                </Paper>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Message
                </Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="body1">
                    {selectedText.message_content || "<No message content>"}
                  </Typography>
                </Paper>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Recipients ({getRecipientCount(selectedText.recipients)})
                </Typography>
                <Paper
                  variant="outlined"
                  sx={{ p: 2, maxHeight: "200px", overflow: "auto" }}
                >
                  {formatRecipients(selectedText.recipients).map(
                    (recipient, index) => (
                      <Box
                        key={index}
                        sx={{ display: "flex", alignItems: "center", mb: 1 }}
                      >
                        <Person fontSize="small" sx={{ mr: 1 }} />
                        <Typography variant="body2">
                          {recipient.name} - {recipient.phone}
                        </Typography>
                      </Box>
                    )
                  )}
                </Paper>
              </Box>

              {formatMediaFiles(selectedText.media_urls).length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Attachments
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    {formatMediaFiles(selectedText.media_urls).map(
                      (url, index) => (
                        <Box key={index} sx={{ mb: 1 }}>
                          <Typography variant="body2">
                            <Image
                              fontSize="small"
                              sx={{ mr: 1, verticalAlign: "middle" }}
                            />
                            Attachment {index + 1}
                          </Typography>
                        </Box>
                      )
                    )}
                  </Paper>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
              <Button
                color="error"
                startIcon={<Delete />}
                onClick={() => {
                  setViewDialogOpen(false);
                  handleDeleteClick(selectedText);
                }}
              >
                Delete
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
}
