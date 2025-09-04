"use client";

import React, { useState } from "react";
import { useTheme } from "@mui/material/styles";
import moment from "moment";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Pagination from "@mui/material/Pagination";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import {
  ExpandMore as ChevronDownIcon,
  ChevronRight as ChevronRightIcon,
  Message as MessageSquareIcon,
  Schedule as ClockIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as XCircleIcon,
  Warning as AlertCircleIcon,
  Info,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useTextLogs, parseMetadata } from "@/hooks/useTextLogs";
import { Stack } from "@mui/material";

interface TextLog {
  id: string;
  message_id: string | null;
  sender_id: string;
  recipient_phone: string;
  recipient_contact_id: string | null;
  message_content: string;
  media_urls: any;
  status: string;
  error_message: string | null;
  owner_id: string;
  owner_type: string;
  created_at: string;
  updated_at: string;
  delivered_at: string | null;
  metadata: any;
  sent_at: string | null;
  batch_id: string;
  twilio_sid: string | null;
}

interface TextBatch {
  id: string;
  created_at: string;
  updated_at: string;
  sender_id: string;
  owner_type: string;
  owner_id: string;
  message_content: string;
  media_urls: any;
  status: string;
  total_count: number;
  pending_count: number;
  sent_count: number;
  delivered_count: number;
  failed_count: number;
  metadata: any;
}

interface TextBatchViewerProps {
  userId: string;
  userCommunities?: string[];
  userCities?: string[];
  isAdmin?: boolean;
}

interface StatusDialogProps {
  open: boolean;
  onClose: () => void;
  log: TextLog | null;
  status: "pending" | "sent";
}

const StatusDialog = ({ open, onClose, log, status }: StatusDialogProps) => {
  if (!log) return null;

  const isPending = status === "pending";
  const metadata = log.metadata ? parseMetadata(log.metadata) : {};

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {isPending ? (
          <AlertCircleIcon sx={{ color: "warning.main" }} />
        ) : (
          <ClockIcon sx={{ color: "info.main" }} />
        )}
        {isPending ? "Message Pending" : "Message Sent"}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Recipient:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {log.recipient_phone}
            </Typography>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Status:
            </Typography>
            <Chip
              label={isPending ? "Pending Delivery" : "Sent"}
              color={isPending ? "warning" : "info"}
              size="small"
            />
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Sent At:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {log.sent_at
                ? moment(log.sent_at).format("MMM DD, YYYY HH:mm:ss")
                : moment(log.created_at).format("MMM DD, YYYY HH:mm:ss")}
            </Typography>
          </Box>

          {isPending ? (
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Why is this message pending?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Text messages fail to deliver due to poor cell reception, the
                recipient&apos;s phone being off or out of range, network
                issues, wrong numbers, or being blocked by the recipient.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                If the message is not received within 24-72 hours it will be
                marked as failed.
              </Typography>
            </Box>
          ) : (
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Next Steps:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                The message has been successfully sent and is being processed by
                the recipient's carrier. You should receive a delivery
                confirmation shortly.
              </Typography>
            </Box>
          )}

          {log.twilio_sid && (
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Message ID:
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontFamily: "monospace" }}
              >
                {log.twilio_sid}
              </Typography>
            </Box>
          )}

          {/* {metadata && Object.keys(metadata).length > 0 && (
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Additional Details:
              </Typography>
              <Box sx={{ bgcolor: "action.hover", p: 1, borderRadius: 1 }}>
                <pre
                  style={{
                    fontSize: "12px",
                    margin: 0,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {JSON.stringify(metadata, null, 2)}
                </pre>
              </Box>
            </Box>
          )} */}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case "delivered":
      return <CheckCircleIcon sx={{ fontSize: 16, color: "success.main" }} />;
    case "sent":
      return <AlertCircleIcon sx={{ fontSize: 16, color: "warning.main" }} />;
    case "failed":
      return <XCircleIcon sx={{ fontSize: 16, color: "error.main" }} />;
    default:
      return (
        <MessageSquareIcon sx={{ fontSize: 16, color: "text.secondary" }} />
      );
  }
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "delivered":
    case "completed":
      return "success";
    case "sent":
    case "in_progress":
      return "warning";
    case "failed":
      return "error";
    default:
      return "default";
  }
};

const getBatchStatus = (status: string) => {
  return status.toLowerCase() === "in_progress" ? "mixed results" : status;
};

const getDisplayStatus = (status: string) => {
  return status.toLowerCase() === "sent" ? "pending" : status;
};

export function TextBatchViewer({
  userId,
  userCommunities = [],
  userCities = [],
  isAdmin = false,
}: TextBatchViewerProps) {
  const theme = useTheme();
  const { logs, loading, error, fetchTextLogs, fetchBatchDetails } =
    useTextLogs();
  const [expandedBatches, setExpandedBatches] = useState<Set<string>>(
    new Set()
  );
  const [batchDetails, setBatchDetails] = useState<Record<string, TextLog[]>>(
    {}
  );
  const [loadingDetails, setLoadingDetails] = useState<Set<string>>(new Set());

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<TextLog | null>(null);
  const [dialogStatus, setDialogStatus] = useState<"pending" | "sent">(
    "pending"
  );

  const handleOpenDialog = (log: TextLog, status: "pending" | "sent") => {
    setSelectedLog(log);
    setDialogStatus(status);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedLog(null);
  };

  // Pagination handlers
  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (event: any) => {
    setPageSize(event.target.value);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Fetch data when pagination changes
  React.useEffect(() => {
    fetchTextLogs({
      page: currentPage,
      limit: pageSize,
    });
  }, [currentPage, pageSize, fetchTextLogs]);

  const toggleBatch = async (batchId: string) => {
    const newExpanded = new Set(expandedBatches);

    if (expandedBatches.has(batchId)) {
      newExpanded.delete(batchId);
    } else {
      newExpanded.add(batchId);

      // Fetch batch details if not already loaded
      if (!batchDetails[batchId]) {
        setLoadingDetails((prev) => new Set(prev).add(batchId));
        try {
          const details = await fetchBatchDetails(batchId);
          setBatchDetails((prev) => ({ ...prev, [batchId]: details }));
        } catch (err) {
          console.error("Error fetching batch details:", err);
        } finally {
          setLoadingDetails((prev) => {
            const newSet = new Set(prev);
            newSet.delete(batchId);
            return newSet;
          });
        }
      }
    }

    setExpandedBatches(newExpanded);
  };

  const renderBatchSection = (title: string, batches: TextBatch[]) => {
    if (!batches || batches.length === 0) return null;

    const totalCount = logs.totalCounts.allUserLogs || 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    return (
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {title} ({totalCount} total)
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Per Page</InputLabel>
              <Select
                value={pageSize}
                onChange={handlePageSizeChange}
                label="Per Page"
              >
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
        {batches.map((batch) => (
          <Card key={batch.id} sx={{ mb: 2, width: "100%" }}>
            <CardHeader
              sx={{
                cursor: "pointer",
                "&:hover": {
                  bgcolor: "action.hover",
                },
                transition: "background-color 0.2s",
              }}
              onClick={() => toggleBatch(batch.id)}
              action={
                <IconButton>
                  {expandedBatches.has(batch.id) ? (
                    <ChevronDownIcon />
                  ) : (
                    <ChevronRightIcon />
                  )}
                </IconButton>
              }
              title={
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <Box>
                    <Typography variant="subtitle1">
                      <strong>{batch.total_count} Sent Messages </strong> -{" "}
                      {batch.message_content.length > 50
                        ? `${batch.message_content.slice(0, 50)}...`
                        : batch.message_content}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.5 }}
                    >
                      {moment(batch.created_at).format("MMM DD, YYYY HH:mm")}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Chip
                      label={getBatchStatus(batch.status)}
                      color={getStatusColor(batch.status) as any}
                      size="small"
                      sx={{ textTransform: "capitalize" }}
                    />
                  </Box>
                </Box>
              }
              subheader={
                <Grid container spacing={1} sx={{ mt: 1 }}>
                  <Grid item xs={2}>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <CheckCircleIcon
                        sx={{ fontSize: 12, color: "success.main" }}
                      />
                      <Typography variant="caption">
                        Delivered: {batch.delivered_count}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={2}>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <AlertCircleIcon
                        sx={{ fontSize: 12, color: "warning.main" }}
                      />
                      <Typography variant="caption">
                        Pending: {batch.sent_count + batch.pending_count}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={2}>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <XCircleIcon sx={{ fontSize: 12, color: "error.main" }} />
                      <Typography variant="caption">
                        Failed: {batch.failed_count}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              }
            />

            <Collapse in={expandedBatches.has(batch.id)}>
              <CardContent sx={{ pt: 0, borderTop: 1, borderColor: "divider" }}>
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1, fontWeight: 600 }}
                  >
                    Message Content:
                  </Typography>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "action.hover",
                      borderRadius: 1,
                      border: 1,
                      borderColor: "divider",
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      {batch.message_content}
                    </Typography>
                  </Box>
                </Box>

                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 2, fontWeight: 600 }}
                  >
                    Individual Messages:
                  </Typography>
                  {loadingDetails.has(batch.id) ? (
                    <Box sx={{ textAlign: "center", py: 4 }}>
                      <CircularProgress size={24} sx={{ mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Loading message details...
                      </Typography>
                    </Box>
                  ) : batchDetails[batch.id] ? (
                    <Box sx={{ maxHeight: 384, overflowY: "auto" }}>
                      {batchDetails[batch.id].map((log) => (
                        <Card
                          key={log.id}
                          variant="outlined"
                          sx={{
                            mb: 1,
                            p: 2,
                            bgcolor: "background.default",
                          }}
                        >
                          <Box>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                mb: 1,
                              }}
                            >
                              {getStatusIcon(log.status)}
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 600 }}
                              >
                                {log.recipient_phone}
                              </Typography>
                              <Chip
                                label={getDisplayStatus(log.status)}
                                color={getStatusColor(log.status) as any}
                                variant="outlined"
                                sx={{ textTransform: "capitalize" }}
                                size="small"
                              />
                              {log.status.toLowerCase() === "sent" && (
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenDialog(log, "pending");
                                  }}
                                >
                                  <Info sx={{ fontSize: 20 }} />
                                </IconButton>
                              )}
                            </Box>
                            {log.error_message && (
                              <Typography
                                variant="caption"
                                color="error.main"
                                sx={{ display: "block", mb: 1 }}
                              >
                                Error: {log.error_message}
                              </Typography>
                            )}
                          </Box>
                        </Card>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Click to expand and view individual messages
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Collapse>
          </Card>
        ))}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
            />
          </Box>
        )}
      </Box>
    );
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 8,
          minWidth: "400px",
        }}
      >
        <CircularProgress size={32} sx={{ mr: 2 }} />
        <Typography>Loading text batches...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: "center", p: 8 }}>
        <XCircleIcon sx={{ fontSize: 48, color: "error.main", mb: 2 }} />
        <Typography color="error.main">
          Error loading text batches: {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, flexGrow: 1, position: "relative" }}>
      {loading && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <Box sx={{ textAlign: "center" }}>
            <CircularProgress size={32} sx={{ mb: 2 }} />
            <Typography>Loading batches...</Typography>
          </Box>
        </Box>
      )}
      <Stack spacing={4}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              component="h2"
              fontWeight="bold"
              sx={{ mt: 5 }}
            >
              Text Message Batches
            </Typography>
            {logs.totalCounts.allUserLogs > 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Page {currentPage} of{" "}
                {Math.ceil(logs.totalCounts.allUserLogs / pageSize)}• Showing{" "}
                {pageSize} per page
              </Typography>
            )}
          </Box>
        </Box>

        {logs.userLogs &&
          logs.userLogs.length > 0 &&
          renderBatchSection("Your Messages", logs.userLogs)}

        {Object.entries(logs.communityLogs).map(([communityId, batches]) =>
          renderBatchSection(`All Messages`, batches as TextBatch[])
        )}

        {Object.entries(logs.cityLogs).map(([cityId, batches]) =>
          renderBatchSection(`City ${cityId} Messages`, batches as TextBatch[])
        )}

        {(!logs.userLogs || logs.userLogs.length === 0) &&
          Object.keys(logs.communityLogs).length === 0 &&
          Object.keys(logs.cityLogs).length === 0 && (
            <Box
              sx={{
                textAlign: "center",
                py: 6,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <MessageSquareIcon
                sx={{ fontSize: 48, color: "text.disabled", mb: 2 }}
              />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                No text message batches found
              </Typography>
              <Typography variant="body2" color="text.disabled">
                {currentPage > 1
                  ? "Try going back to previous pages or adjusting your filters."
                  : "Text message batches will appear here once they are sent."}
              </Typography>
            </Box>
          )}
      </Stack>

      {/* Status Dialog */}
      <StatusDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        log={selectedLog}
        status={dialogStatus}
      />
    </Box>
  );
}
