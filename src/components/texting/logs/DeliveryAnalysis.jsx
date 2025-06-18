import React, { useState, useMemo } from "react";
import {
  Box,
  Card,
  Typography,
  Button,
  Divider,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Collapse,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  CheckCircle,
  Cancel,
  Search,
  Download,
  ExpandMore,
  ExpandLess,
  Warning,
  Person,
  Phone,
} from "@mui/icons-material";

export const DeliveryAnalysis = ({ logData, metadata }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFailedDetails, setShowFailedDetails] = useState(false);

  // Parse metadata to get intended recipients
  const intendedRecipients = useMemo(() => {
    try {
      const parsedMetadata =
        typeof metadata === "string" ? JSON.parse(metadata) : metadata;
      return parsedMetadata?.allRecipients || [];
    } catch (error) {
      console.error("Error parsing metadata:", error);
      return [];
    }
  }, [metadata]);

  // Get actual recipients (those who received the message)
  const actualRecipients = useMemo(() => {
    return logData?.recipients || [];
  }, [logData]);

  // Analyze delivery results
  const deliveryAnalysis = useMemo(() => {
    const delivered = [];
    const failed = [];

    // Create a Set of actual recipient phone numbers for fast lookup
    const actualPhones = new Set(actualRecipients);

    // Check each intended recipient
    intendedRecipients.forEach((recipient) => {
      const phone = recipient.phone;
      if (actualPhones.has(phone)) {
        delivered.push(recipient);
      } else {
        failed.push(recipient);
      }
    });

    return {
      intended: intendedRecipients,
      delivered,
      failed,
      deliveryRate:
        intendedRecipients.length > 0
          ? ((delivered.length / intendedRecipients.length) * 100).toFixed(1)
          : 0,
    };
  }, [intendedRecipients, actualRecipients]);

  // Filter recipients based on search term
  const filterRecipients = (recipients) => {
    if (!searchTerm) return recipients;

    return recipients.filter(
      (recipient) =>
        recipient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipient.phone?.includes(searchTerm)
    );
  };

  // Download CSV of failed deliveries
  const downloadFailedRecipients = () => {
    const csvContent = [
      "Name,Phone,Reason",
      ...deliveryAnalysis.failed.map(
        (recipient) =>
          `"${recipient.name || "Unknown"}","${
            recipient.phone
          }","Not delivered"`
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `failed_deliveries_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ width: "100%" }}>
      {/* Summary Stats */}
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Delivery Analysis
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Alert
          severity={deliveryAnalysis.deliveryRate < 100 ? "warning" : "success"}
          sx={{ mb: 2 }}
        >
          <Typography variant="subtitle1">
            Delivery Rate: {deliveryAnalysis.deliveryRate}% (
            {deliveryAnalysis.delivered.length} of{" "}
            {deliveryAnalysis.intended.length} recipients)
          </Typography>
          {deliveryAnalysis.failed.length > 0 && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              {deliveryAnalysis.failed.length} recipients did not receive the
              message
            </Typography>
          )}
        </Alert>

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Chip
            icon={<CheckCircle />}
            label={`${deliveryAnalysis.delivered.length} Delivered`}
            color="success"
            variant="outlined"
          />
          <Chip
            icon={<Cancel />}
            label={`${deliveryAnalysis.failed.length} Failed`}
            color="error"
            variant="outlined"
          />
          {deliveryAnalysis.failed.length > 0 && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<Download />}
              onClick={downloadFailedRecipients}
            >
              Export Failed
            </Button>
          )}
        </Box>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Search */}
      <TextField
        fullWidth
        size="small"
        placeholder="Search by name or phone number..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />

      {/* Tabs */}
      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab
          label={`All (${filterRecipients(deliveryAnalysis.intended).length})`}
        />
        <Tab
          label={`Delivered (${
            filterRecipients(deliveryAnalysis.delivered).length
          })`}
        />
        <Tab
          label={`Failed (${filterRecipients(deliveryAnalysis.failed).length})`}
        />
      </Tabs>

      {/* Recipients List */}
      <Paper sx={{ maxHeight: 400, overflow: "auto" }}>
        <List dense>
          {activeTab === 0 &&
            filterRecipients(deliveryAnalysis.intended).map(
              (recipient, index) => {
                const wasDelivered = actualRecipients.includes(recipient.phone);
                return (
                  <ListItem key={index} divider>
                    <ListItemIcon>
                      {wasDelivered ? (
                        <CheckCircle color="success" />
                      ) : (
                        <Cancel color="error" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Person fontSize="small" />
                          <Typography variant="body2" fontWeight="medium">
                            {recipient.name || "Unknown"}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Phone fontSize="small" />
                          <Typography variant="body2">
                            {recipient.phone}
                          </Typography>
                          <Chip
                            size="small"
                            label={wasDelivered ? "Delivered" : "Failed"}
                            color={wasDelivered ? "success" : "error"}
                            variant="outlined"
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                );
              }
            )}

          {activeTab === 1 &&
            filterRecipients(deliveryAnalysis.delivered).map(
              (recipient, index) => (
                <ListItem key={index} divider>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Person fontSize="small" />
                        <Typography variant="body2" fontWeight="medium">
                          {recipient.name || "Unknown"}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Phone fontSize="small" />
                        <Typography variant="body2">
                          {recipient.phone}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              )
            )}

          {activeTab === 2 &&
            filterRecipients(deliveryAnalysis.failed).map(
              (recipient, index) => (
                <ListItem key={index} divider>
                  <ListItemIcon>
                    <Cancel color="error" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Person fontSize="small" />
                        <Typography variant="body2" fontWeight="medium">
                          {recipient.name || "Unknown"}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Phone fontSize="small" />
                        <Typography variant="body2">
                          {recipient.phone}
                        </Typography>
                        <Typography variant="caption" color="error">
                          Message not delivered
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              )
            )}
        </List>

        {/* Empty state */}
        {((activeTab === 0 &&
          filterRecipients(deliveryAnalysis.intended).length === 0) ||
          (activeTab === 1 &&
            filterRecipients(deliveryAnalysis.delivered).length === 0) ||
          (activeTab === 2 &&
            filterRecipients(deliveryAnalysis.failed).length === 0)) && (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              No recipients found {searchTerm && "matching your search"}
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};
