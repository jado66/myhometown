"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Grid,
} from "@mui/material";
import {
  Search,
  Refresh as RefreshIcon,
  CheckCircle,
  Error as ErrorIcon,
  Schedule,
  Image,
} from "@mui/icons-material";

import BackButton from "@/components/BackButton";
import { useTextLogs } from "@/hooks/useTextLogs";
import { useUser } from "@/hooks/use-user";

// Component to display media previews
const MediaPreviews = ({ mediaUrls }) => {
  if (!mediaUrls || mediaUrls.length === 0) return null;

  let urls = [];
  try {
    urls = typeof mediaUrls === "string" ? JSON.parse(mediaUrls) : mediaUrls;
  } catch (error) {
    console.error("Error parsing media URLs:", error);
    return <Typography color="error">Error loading media</Typography>;
  }

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
      {urls.map((url, index) => (
        <Box key={index} sx={{ position: "relative" }}>
          <a href={url} target="_blank" rel="noopener noreferrer">
            <Chip
              icon={<Image />}
              label={`Media ${index + 1}`}
              clickable
              color="primary"
              variant="outlined"
            />
          </a>
        </Box>
      ))}
    </Box>
  );
};

// Format timestamp in a user-friendly way
const formatDateTime = (timestamp) => {
  if (!timestamp) return "N/A";

  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return "Invalid date";

    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Error";
  }
};

// Status chip component
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

export default function TextLogViewer() {
  const { user } = useUser();

  // Get text logs using our custom hook
  const { logs, loading, error, fetchTextLogs } = useTextLogs(
    user?.id,
    user?.communities_details?.map((c) => c.id) || [],
    user?.cities_details?.map((c) => c.id) || []
  );

  // State for filters and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [phoneFilter, setPhoneFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");

  // For viewing message details
  const [selectedLog, setSelectedLog] = useState(null);

  // Handle search
  const handleSearch = () => {
    fetchTextLogs({
      page: page + 1, // API pagination is 1-based
      limit: rowsPerPage,
      startDate: startDate ? new Date(startDate).toISOString() : null,
      endDate: endDate ? new Date(endDate).toISOString() : null,
      status: statusFilter || null,
      searchTerm: searchTerm || null,
      recipientPhone: phoneFilter || null,
      sortBy,
      sortDirection,
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setPhoneFilter("");
    setStatusFilter("");
    setStartDate(null);
    setEndDate(null);
    setPage(0);

    // Refetch with cleared filters
    fetchTextLogs({
      page: 1,
      limit: rowsPerPage,
      sortBy,
      sortDirection,
    });
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    fetchTextLogs({
      page: newPage + 1,
      limit: rowsPerPage,
      startDate: startDate ? new Date(startDate).toISOString() : null,
      endDate: endDate ? new Date(endDate).toISOString() : null,
      status: statusFilter || null,
      searchTerm: searchTerm || null,
      recipientPhone: phoneFilter || null,
      sortBy,
      sortDirection,
    });
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    fetchTextLogs({
      page: 1,
      limit: newRowsPerPage,
      startDate: startDate ? new Date(startDate).toISOString() : null,
      endDate: endDate ? new Date(endDate).toISOString() : null,
      status: statusFilter || null,
      searchTerm: searchTerm || null,
      recipientPhone: phoneFilter || null,
      sortBy,
      sortDirection,
    });
  };

  // Handle sorting
  const handleSort = (column) => {
    const isAsc = sortBy === column && sortDirection === "asc";
    const newDirection = isAsc ? "desc" : "asc";
    setSortBy(column);
    setSortDirection(newDirection);

    // Refetch with new sort
    fetchTextLogs({
      page: page + 1,
      limit: rowsPerPage,
      startDate: startDate ? new Date(startDate).toISOString() : null,
      endDate: endDate ? new Date(endDate).toISOString() : null,
      status: statusFilter || null,
      searchTerm: searchTerm || null,
      recipientPhone: phoneFilter || null,
      sortBy: column,
      sortDirection: newDirection,
    });
  };

  // View log details
  const handleViewDetails = (log) => {
    setSelectedLog(log);
  };

  // Close details view
  const handleCloseDetails = () => {
    setSelectedLog(null);
  };

  // Merge all logs into a single array for the current tab
  const currentLogs = useMemo(() => {
    if (activeTab === 0) {
      // All logs
      let allLogs = [...logs.userLogs];

      // Add community logs
      Object.values(logs.communityLogs).forEach((communityLogList) => {
        allLogs = [...allLogs, ...communityLogList];
      });

      // Add city logs
      Object.values(logs.cityLogs).forEach((cityLogList) => {
        allLogs = [...allLogs, ...cityLogList];
      });

      return allLogs;
    } else if (activeTab === 1) {
      // User logs only
      return logs.userLogs;
    } else if (activeTab === 2) {
      // Community logs
      let communityLogs = [];
      Object.values(logs.communityLogs).forEach((communityLogList) => {
        communityLogs = [...communityLogs, ...communityLogList];
      });
      return communityLogs;
    } else if (activeTab === 3) {
      // City logs
      let cityLogs = [];
      Object.values(logs.cityLogs).forEach((cityLogList) => {
        cityLogs = [...cityLogs, ...cityLogList];
      });
      return cityLogs;
    }

    return [];
  }, [logs, activeTab]);

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
        <Typography variant="h5" gutterBottom>
          Text Message Logs
        </Typography>

        {selectedLog ? (
          // Message details view
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
            >
              <Typography variant="h6">Message Details</Typography>
              <Button variant="outlined" onClick={handleCloseDetails}>
                Back to Logs
              </Button>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Recipient</Typography>
                <Typography>{selectedLog.recipient_phone}</Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Status</Typography>
                <StatusChip status={selectedLog.status} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Sent At</Typography>
                <Typography>
                  {formatDateTime(selectedLog.created_at)}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Delivered At</Typography>
                <Typography>
                  {selectedLog.delivered_at
                    ? formatDateTime(selectedLog.delivered_at)
                    : "Pending"}
                </Typography>
              </Grid>

              {selectedLog.error_message && (
                <Grid item xs={12}>
                  <Alert severity="error" sx={{ mt: 1 }}>
                    {selectedLog.error_message}
                  </Alert>
                </Grid>
              )}

              <Grid item xs={12}>
                <Typography variant="subtitle2">Message Content</Typography>
                <Paper
                  elevation={1}
                  sx={{ p: 2, backgroundColor: "grey.100", mt: 1 }}
                >
                  <Typography>{selectedLog.message_content}</Typography>
                </Paper>
              </Grid>

              {selectedLog.media_urls && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Media Attachments</Typography>
                  <MediaPreviews mediaUrls={selectedLog.media_urls} />
                </Grid>
              )}

              {selectedLog.metadata && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2">
                    Additional Information
                  </Typography>
                  <Paper
                    elevation={1}
                    sx={{ p: 2, backgroundColor: "grey.100", mt: 1 }}
                  >
                    <Typography component="pre" sx={{ whiteSpace: "pre-wrap" }}>
                      {typeof selectedLog.metadata === "string"
                        ? selectedLog.metadata
                        : JSON.stringify(selectedLog.metadata, null, 2)}
                    </Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Paper>
        ) : (
          // Main logs view
          <>
            {/* Filter section */}
            <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Search & Filters
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Search in message content"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    margin="normal"
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Recipient Phone Number"
                    value={phoneFilter}
                    onChange={(e) => setPhoneFilter(e.target.value)}
                    margin="normal"
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      label="Status"
                    >
                      <MenuItem value="">All Statuses</MenuItem>
                      <MenuItem value="sent">Sent</MenuItem>
                      <MenuItem value="delivered">Delivered</MenuItem>
                      <MenuItem value="failed">Failed</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Start Date"
                    type="date"
                    value={startDate || ""}
                    onChange={(e) => setStartDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    margin="normal"
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="End Date"
                    type="date"
                    value={endDate || ""}
                    onChange={(e) => setEndDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    margin="normal"
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={12}
                  md={4}
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSearch}
                      startIcon={<Search />}
                    >
                      Search
                    </Button>
                    <Button variant="outlined" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<RefreshIcon />}
                      onClick={() => fetchTextLogs()}
                    >
                      Refresh
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Tab navigation */}
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="scrollable"
              scrollButtons="auto"
              sx={{ mb: 2 }}
            >
              <Tab label="All Messages" />
              <Tab label="Personal Messages" />
              <Tab label="Community Messages" />
              <Tab label="City Messages" />
            </Tabs>

            {/* Main content - logs table */}
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                Error loading text logs: {error}
              </Alert>
            ) : currentLogs.length === 0 ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                No text messages found with the current filters.
              </Alert>
            ) : (
              <>
                <TableContainer component={Paper}>
                  <Table sx={{ minWidth: 650 }} size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell
                          onClick={() => handleSort("created_at")}
                          sx={{ cursor: "pointer", fontWeight: "bold" }}
                        >
                          Date/Time{" "}
                          {sortBy === "created_at" &&
                            (sortDirection === "asc" ? "↑" : "↓")}
                        </TableCell>
                        <TableCell>Recipient</TableCell>
                        <TableCell>Message</TableCell>
                        <TableCell>Media</TableCell>
                        <TableCell
                          onClick={() => handleSort("status")}
                          sx={{ cursor: "pointer", fontWeight: "bold" }}
                        >
                          Status{" "}
                          {sortBy === "status" &&
                            (sortDirection === "asc" ? "↑" : "↓")}
                        </TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {currentLogs.map((log) => (
                        <TableRow key={log.id} hover>
                          <TableCell>
                            {formatDateTime(log.created_at)}
                          </TableCell>
                          <TableCell>{log.recipient_phone}</TableCell>
                          <TableCell>
                            {log.message_content.length > 50
                              ? `${log.message_content.substring(0, 50)}...`
                              : log.message_content}
                          </TableCell>
                          <TableCell>
                            {log.media_urls && (
                              <Chip
                                size="small"
                                icon={<Image />}
                                label="Media"
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            <StatusChip status={log.status} />
                          </TableCell>
                          <TableCell>
                            <Button
                              size="small"
                              onClick={() => handleViewDetails(log)}
                              variant="outlined"
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  component="div"
                  count={-1} // We don't know the total count, so we use -1 to hide the count display
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  labelDisplayedRows={({ from, to }) => `${from}-${to}`}
                />
              </>
            )}
          </>
        )}
      </Card>
    </>
  );
}
