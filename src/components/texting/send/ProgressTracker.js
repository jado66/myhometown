import React, { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Button,
  Collapse,
  IconButton,
  Chip,
  Alert,
  Divider,
} from "@mui/material";
import {
  Check,
  Close,
  ExpandMore,
  ExpandLess,
  Refresh,
  Warning,
  Schedule,
  Send,
  Info,
} from "@mui/icons-material";

const ProgressTracker = ({ sendStatus, progress, onReset, apiResponse }) => {
  const [expanded, setExpanded] = useState(false);
  const [showHelper, setShowHelper] = useState(true);
  const [detailedResults, setDetailedResults] = useState([]);

  // Update detailed results when we get the API response
  useEffect(() => {
    if (apiResponse?.summary?.results) {
      setDetailedResults(apiResponse.summary.results);
    }
  }, [apiResponse]);

  // Don't render if idle
  if (sendStatus === "idle") return null;

  const handleToggleExpanded = () => {
    setExpanded(!expanded);
  };

  const handleToggleHelper = () => {
    setShowHelper(!showHelper);
  };

  const getStatusIcon = (status, isTest = false) => {
    if (isTest) {
      return <Warning color="warning" fontSize="small" />;
    }

    switch (status) {
      case "sent":
      case "delivered":
        return <Check color="success" fontSize="small" />;
      case "failed":
      case "undelivered":
        return <Close color="error" fontSize="small" />;
      case "pending":
      case "queued":
        return <Schedule color="action" fontSize="small" />;
      default:
        return <Send color="disabled" fontSize="small" />;
    }
  };

  const getStatusColor = (status, isTest = false) => {
    if (isTest) return "warning";

    switch (status) {
      case "sent":
      case "delivered":
        return "success";
      case "failed":
      case "undelivered":
        return "error";
      case "pending":
      case "queued":
        return "default";
      default:
        return "default";
    }
  };

  const formatPhone = (phone) => {
    if (!phone) return "Unknown";

    // Remove country code for display
    const cleaned = phone.replace(/^\+1/, "").replace(/^\+/, "");

    // Format as (XXX) XXX-XXXX for 10 digit numbers
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
        6
      )}`;
    }

    return phone;
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    try {
      return new Date(timestamp).toLocaleTimeString();
    } catch (error) {
      return "";
    }
  };

  // Show spinner while sending
  if (sendStatus === "sending") {
    return (
      <Paper elevation={3} sx={{ p: 3, mt: 2, mx: 3, mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
          }}
        >
          <CircularProgress size={24} />
          <Typography variant="h6">
            Sending {progress.total || 0} message
            {progress.total !== 1 ? "s" : ""}...
          </Typography>
        </Box>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: "center", mt: 1 }}
        >
          Please wait while we process your messages
        </Typography>
      </Paper>
    );
  }

  // Show results when completed
  if (sendStatus === "completed" && apiResponse) {
    const summary = apiResponse.summary || {};
    const realResults = detailedResults.filter((r) => !r.isTestNumber);
    const testResults = detailedResults.filter((r) => r.isTestNumber);

    return (
      <Paper elevation={3} sx={{ p: 3, mt: 2, mx: 3, mb: 3 }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Typography variant="h6">Message Results</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
              size="small"
              onClick={handleToggleHelper}
              aria-label="status help"
              title="Status explanations"
            >
              <Info fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={handleToggleExpanded}
              aria-label={expanded ? "collapse" : "expand"}
            >
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
        </Box>

        {/* Helper Text */}
        <Collapse in={showHelper} timeout="auto" unmountOnExit>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Status Meanings:</strong>
            </Typography>
            <Typography variant="caption" component="div">
              <strong>Sent</strong> - Message was successfully handed off to
              Texting Provider for processing.{" "}
              <strong>
                This does not guarantee delivery to the recipient.
              </strong>
              <br />
              Delivery is dependant on many factors including: recipient&apos;s
              carrier, phone status, DO NOT DISTURB settings, etc.
              <br />
              <strong>Failed</strong> - Message could not be processed (i.e.,
              invalid number, carrier outage or maintenance, etc.)
              <br />
              <strong>Delivery Status</strong> - The delivery status (e.g.,
              delivered, undelivered, etc.) will be reported in the Texting
              Logs.
            </Typography>
          </Alert>
        </Collapse>

        {/* Summary Stats */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 1 }}>
            {realResults.filter((r) => r.status === "sent").length > 0 && (
              <Chip
                icon={<Check />}
                label={`${
                  realResults.filter((r) => r.status === "sent").length
                } Sent Successfully`}
                color="success"
                variant="outlined"
              />
            )}
            {realResults.filter((r) => r.status === "failed").length > 0 && (
              <Chip
                icon={<Close />}
                label={`${
                  realResults.filter((r) => r.status === "failed").length
                } Failed`}
                color="error"
                variant="outlined"
              />
            )}
          </Box>

          {/* Test Numbers Alert */}
          {testResults.length > 0 && (
            <Alert severity="info" sx={{ mt: 1 }}>
              <Typography variant="body2">
                {testResults.length} test number
                {testResults.length !== 1 ? "s were" : " was"} included for
                system validation
              </Typography>
            </Alert>
          )}
        </Box>

        {/* Detailed Results */}
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Divider sx={{ mb: 2 }} />

          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
            Detailed Results
          </Typography>

          {/* Real Numbers Section */}
          {realResults.length > 0 && (
            <>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ mb: 1 }}
              >
                Recipients ({realResults.length})
              </Typography>
              <List dense sx={{ mb: 2 }}>
                {realResults.map((result, index) => (
                  <ListItem key={index} divider>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {getStatusIcon(result.status)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ fontFamily: "monospace" }}
                          >
                            {formatPhone(result.phone)}
                          </Typography>
                          <Chip
                            label={result.status}
                            size="small"
                            color={getStatusColor(result.status)}
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        <Box component="span">
                          {result.sid && (
                            <Typography variant="caption" component="span">
                              ID: {result.sid.substring(0, 10)}...
                            </Typography>
                          )}
                          {result.error && (
                            <Typography
                              variant="caption"
                              component="span"
                              color="error"
                              sx={{ ml: result.sid ? 2 : 0 }}
                            >
                              {result.error}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </>
          )}

          {/* Test Numbers Section */}
          {testResults.length > 0 && (
            <>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ mb: 1 }}
              >
                Test Numbers (System Validation)
              </Typography>
              <List dense>
                {testResults.map((result, index) => (
                  <ListItem key={index} divider>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {getStatusIcon(result.status, true)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ fontFamily: "monospace" }}
                          >
                            {result.phone}
                          </Typography>
                          <Chip
                            label="Test"
                            size="small"
                            color="warning"
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          Expected failure - Invalid test number
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </>
          )}

          {detailedResults.length === 0 && (
            <Box sx={{ py: 2, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                No detailed results available
              </Typography>
            </Box>
          )}
        </Collapse>
      </Paper>
    );
  }

  // Error state
  if (sendStatus === "error") {
    return (
      <Paper elevation={3} sx={{ p: 3, mt: 2, mx: 3, mb: 3 }}>
        <Alert severity="error">
          <Typography variant="body1">
            An error occurred while sending messages
          </Typography>
          {progress.error && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              {progress.error}
            </Typography>
          )}
        </Alert>
        <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="outlined"
            size="small"
            onClick={onReset}
            color="error"
          >
            Try Again
          </Button>
        </Box>
      </Paper>
    );
  }

  // For any other status, don't render anything
  return null;
};

export default ProgressTracker;
