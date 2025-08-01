"use client";
import { useState, useMemo } from "react";
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  Paper,
  Divider,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Chip,
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
  IconButton,
  Collapse,
  Tooltip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Search,
  Refresh as RefreshIcon,
  Group as GroupIcon,
  ExpandMore,
  ExpandLess,
  InfoOutlined,
  Image,
  LocalOffer as TagIcon,
} from "@mui/icons-material";

import BackButton from "@/components/BackButton";
import { useTextLogs } from "@/hooks/useTextLogs";
import { useUser } from "@/hooks/use-user";

// Import our custom components
import ResendTextButton from "./ResendTextButton";
import StatusChip from "./StatusChip";
import RecipientsList from "./RecipientsList";
import MediaPreviews from "./MediaPreviews";

// Utility functions
import { formatDateTime, getStatusSummary } from "./textLogUtils";
import JsonViewer from "@/components/util/debug/DebugOutput";
import DeliveryAnalysis from "./DeliveryAnalysis";

export default function TextLogViewer() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { user } = useUser();

  // Get text logs using our custom hook - now passing isAdmin flag
  const { logs, loading, error, fetchTextLogs } = useTextLogs(
    user?.id,
    user?.communities_details?.map((c) => c.id) || [],
    user?.cities_details?.map((c) => c.id) || [],
    user?.permissions?.administrator || false // Pass admin status here
  );

  // State for filters and pagination
  const [useClientSidePagination, setUseClientSidePagination] = useState(true);

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
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  // For viewing message details
  const [selectedLog, setSelectedLog] = useState(null);

  // Helper function to parse metadata and extract groups
  const parseMetadata = (metadataString) => {
    try {
      return JSON.parse(metadataString);
    } catch (error) {
      console.error("Error parsing metadata:", error);
      return null;
    }
  };

  // Helper function to extract groups from metadata
  const getGroupsFromMetadata = (metadata) => {
    if (!metadata || !metadata.selectedGroups) return [];
    return metadata.selectedGroups;
  };

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

    if (!useClientSidePagination) {
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
    }
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = Number.parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);

    if (!useClientSidePagination) {
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
    }
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

  // Toggle filters visibility
  const toggleFilters = () => {
    setFiltersExpanded(!filtersExpanded);
  };

  const currentLogs = useMemo(() => {
    let allLogs = [];
    const isAdmin = user?.permissions?.administrator || false;

    if (activeTab === 0) {
      // All logs
      if (isAdmin) {
        // For admins, use allUserLogs which contains ALL logs from ALL users
        allLogs = [...(logs.allUserLogs || [])];

        // Also add community and city logs
        Object.values(logs.communityLogs).forEach((communityLogList) => {
          allLogs = [...allLogs, ...communityLogList];
        });

        Object.values(logs.cityLogs).forEach((cityLogList) => {
          allLogs = [...allLogs, ...cityLogList];
        });
      } else {
        // For non-admins, show their own logs plus their associated community/city logs
        allLogs = [...logs.userLogs];

        Object.values(logs.communityLogs).forEach((communityLogList) => {
          allLogs = [...allLogs, ...communityLogList];
        });

        Object.values(logs.cityLogs).forEach((cityLogList) => {
          allLogs = [...allLogs, ...cityLogList];
        });
      }
    } else if (activeTab === 1) {
      // Personal Messages - only user's own logs
      allLogs = logs.userLogs;
    } else if (activeTab === 2) {
      // For admin: Community Messages, For non-admin: City Messages
      if (isAdmin) {
        Object.values(logs.communityLogs).forEach((communityLogList) => {
          allLogs = [...allLogs, ...communityLogList];
        });
      } else {
        Object.values(logs.cityLogs).forEach((cityLogList) => {
          allLogs = [...allLogs, ...cityLogList];
        });
      }
    } else if (activeTab === 3) {
      // City Messages (only for admin)
      if (isAdmin) {
        Object.values(logs.cityLogs).forEach((cityLogList) => {
          allLogs = [...allLogs, ...cityLogList];
        });
      }
    }

    // Add the status summary for mixed statuses
    return allLogs.map((log) => ({
      ...log,
      status: getStatusSummary(log.statuses || [log.status]),
    }));
  }, [logs, activeTab, user?.permissions?.administrator]);

  const tabs = user?.permissions?.administrator
    ? [
        "All Messages",
        "Personal Messages",
        "Community Messages",
        "City Messages",
      ]
    : ["All Messages", "Personal Messages", "City Messages"];

  const getTotalCount = useMemo(() => {
    if (!logs.totalCounts) return 0;
    const isAdmin = user?.permissions?.administrator || false;

    if (activeTab === 0) {
      // All logs
      if (isAdmin) {
        // For admins, start with allUserLogs count
        let total = logs.totalCounts.allUserLogs || 0;

        Object.values(logs.totalCounts.communityLogs || {}).forEach((count) => {
          total += count;
        });

        Object.values(logs.totalCounts.cityLogs || {}).forEach((count) => {
          total += count;
        });

        return total;
      } else {
        // For non-admins, count their own logs plus associated community/city logs
        let total = logs.totalCounts.userLogs || 0;

        Object.values(logs.totalCounts.communityLogs || {}).forEach((count) => {
          total += count;
        });

        Object.values(logs.totalCounts.cityLogs || {}).forEach((count) => {
          total += count;
        });

        return total;
      }
    } else if (activeTab === 1) {
      // Personal messages
      return logs.totalCounts.userLogs || 0;
    } else if (activeTab === 2) {
      // For admin: Community Messages, For non-admin: City Messages
      if (isAdmin) {
        return Object.values(logs.totalCounts.communityLogs || {}).reduce(
          (sum, count) => sum + count,
          0
        );
      } else {
        return Object.values(logs.totalCounts.cityLogs || {}).reduce(
          (sum, count) => sum + count,
          0
        );
      }
    } else if (activeTab === 3) {
      // City Messages (only for admin)
      if (isAdmin) {
        return Object.values(logs.totalCounts.cityLogs || {}).reduce(
          (sum, count) => sum + count,
          0
        );
      }
    }

    return 0;
  }, [logs.totalCounts, activeTab, user?.permissions?.administrator]);
  return (
    <>
      <BackButton
        top="0px"
        text={selectedLog ? "Back to Logs" : "Back to Admin Dashboard"}
        onClick={() => {
          if (selectedLog) {
            setSelectedLog(null);
          } else {
            window.history.back();
          }
        }}
        sx={{
          position: "absolute",
          left: 0,
          marginLeft: 6,
          marginTop: 2,
        }}
      />

      <JsonViewer
        data={{
          logs,
          currentLogs,
          searchTerm,
          phoneFilter,
          statusFilter,
          startDate,
          endDate,
          activeTab,
          page,
          rowsPerPage,
          sortBy,
          sortDirection,
        }}
        title="Text Log Viewer State"
      />

      <Card
        sx={{
          width: "100%",
          mx: { xs: 1, sm: 2, md: 3 },
          mt: 8,
          p: { xs: 2, sm: 3 },
          display: "flex",
          flexDirection: "column",
          boxShadow: 3,
          borderRadius: 2,
          overflow: "visible", // Changed from "hidden" to "visible"
        }}
      >
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          {selectedLog ? "Message Details" : "Text Message Logs"}
        </Typography>

        {selectedLog ? (
          // Message details view - extracted to DetailView component
          <DetailView log={selectedLog} onClose={handleCloseDetails} />
        ) : (
          // Main logs view
          <>
            {/* Tab navigation */}
            <Paper
              elevation={1}
              sx={{
                mb: 3,
                borderRadius: 2,
                overflow: "visible", // Changed from "hidden" to "visible" to prevent content cutoff
              }}
            >
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                indicatorColor="primary"
                textColor="primary"
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  borderBottom: 1,
                  borderColor: "divider",
                  "& .MuiTab-root": {
                    minHeight: 48,
                    py: 1,
                  },
                }}
              >
                {tabs.map((tab, index) => (
                  <Tab
                    key={index}
                    label={tab}
                    sx={{
                      textTransform: "none",
                      fontWeight: activeTab === index ? "bold" : "normal",
                    }}
                  />
                ))}
              </Tabs>
              {/* Filter section - collapsible on mobile */}
              <Box sx={{ p: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography variant="h6">Search & Filters</Typography>
                  <IconButton
                    onClick={toggleFilters}
                    size="small"
                    sx={{ display: { md: "none" } }}
                  >
                    <Tooltip
                      title={filtersExpanded ? "Hide filters" : "Show filters"}
                    >
                      {filtersExpanded ? <ExpandLess /> : <ExpandMore />}
                    </Tooltip>
                  </IconButton>
                </Box>

                {/* Update the Collapse component to fix overflow issues */}
                <Collapse
                  in={filtersExpanded || !isMobile}
                  sx={{ width: "100%", overflow: "visible" }}
                >
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        fullWidth
                        label="Search in message content"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        margin="normal"
                        size="small"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        fullWidth
                        label="Recipient Phone Number"
                        value={phoneFilter}
                        onChange={(e) => setPhoneFilter(e.target.value)}
                        margin="normal"
                        size="small"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                      <FormControl fullWidth margin="normal" size="small">
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
                        size="small"
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
                        size="small"
                      />
                    </Grid>

                    <Grid
                      item
                      xs={12}
                      sm={12}
                      md={4}
                      sx={{ display: "flex", alignItems: "center" }}
                    >
                      <Box
                        sx={{
                          mt: 2,
                          display: "flex",
                          gap: 1,
                          flexWrap: "wrap",
                        }}
                      >
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleSearch}
                          startIcon={<Search />}
                          size="small"
                        >
                          Search
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={clearFilters}
                          size="small"
                        >
                          Clear
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<RefreshIcon />}
                          onClick={() => fetchTextLogs()}
                          size="small"
                        >
                          Refresh
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </Collapse>
              </Box>
            </Paper>

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
                <Alert
                  severity="info"
                  sx={{
                    mb: 2,
                    borderRadius: 1,
                  }}
                  icon={<GroupIcon />}
                >
                  Showing {currentLogs.length} bulk message(s) grouped by
                  message ID
                </Alert>

                <LogsTable
                  logs={currentLogs}
                  sortBy={sortBy}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  onViewDetails={handleViewDetails}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onChangePage={handleChangePage}
                  onChangeRowsPerPage={handleChangeRowsPerPage}
                  totalCount={getTotalCount}
                />
              </>
            )}
          </>
        )}
      </Card>
    </>
  );
}

/**
 * DetailView component to display message details
 */
const DetailView = ({ log, onClose }) => {
  const parseMetadata = (metadataString) => {
    try {
      return JSON.parse(metadataString);
    } catch (error) {
      console.error("Error parsing metadata:", error);
      return null;
    }
  };

  const metadata = parseMetadata(log.metadata);
  const groups = metadata?.selectedGroups || [];

  const downloadMetadata = (metadata) => {
    // Function to convert metadata to CSV format with just recipients
    const convertToCSV = (metadata) => {
      // Start with headers
      let csvContent = "Name,Phone Number\n";

      // Add recipient information
      if (metadata.allRecipients && metadata.allRecipients.length > 0) {
        metadata.allRecipients.forEach((recipient) => {
          let name = "";
          let phone = "";

          // Extract name and phone from recipient object
          if (typeof recipient === "string") {
            // If recipient is just a string, assume it's the phone number
            phone = recipient;
            name = "N/A";
          } else if (typeof recipient === "object") {
            // Extract name and phone using the exact property names
            name = recipient.name || "N/A";
            phone = recipient.phone || "";
          }

          // Escape quotes in CSV values
          name = name.replace(/"/g, '""');
          phone = phone.replace(/"/g, '""');

          // Add row to CSV
          csvContent += `"${name}","${phone}"\n`;
        });
      }

      return csvContent;
    };

    const csvData = convertToCSV(metadata);
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `recipients_${log.message_id || new Date().getTime()}.csv`;
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Box
      sx={{
        mb: 3,
        borderRadius: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 2,
          flexDirection: { xs: "column", sm: "row" },
          gap: { xs: 2, sm: 0 },
        }}
      ></Box>

      <Divider sx={{ mb: 2 }} />

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="text.secondary">
            Message ID
          </Typography>
          <Typography variant="body1" fontWeight="medium">
            {log.message_id}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="text.secondary">
            Status
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <StatusChip status={log.status} />
            {log.recipientCount > 1 &&
              log.statuses.some((s) => s !== log.status) && (
                <Typography variant="caption">Mixed statuses</Typography>
              )}
          </Box>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="text.secondary">
            Sent At
          </Typography>
          <Typography variant="body1">
            {formatDateTime(log.created_at)}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="text.secondary">
            Delivered At
          </Typography>
          <Typography variant="body1">
            {log.delivered_at ? formatDateTime(log.delivered_at) : "Pending"}
          </Typography>
        </Grid>

        {/* Display Groups if any */}
        {groups.length > 0 && (
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">
              Groups Used ({groups.length})
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
              {groups.map((group, index) => (
                <Chip
                  key={index}
                  icon={<TagIcon />}
                  label={group.originalValue || group.label}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              ))}
            </Box>
          </Grid>
        )}

        {log.error_message && (
          <Grid item xs={12}>
            <Alert severity="error" sx={{ mt: 1 }}>
              {log.error_message}
            </Alert>
          </Grid>
        )}

        <Grid item xs={12}>
          <Typography variant="subtitle2" color="text.secondary">
            Message Content
          </Typography>
          <Paper
            elevation={1}
            sx={{
              p: 2,
              backgroundColor: "grey.50",
              mt: 1,
              borderRadius: 1,
            }}
          >
            <Typography>{log.message_content}</Typography>
          </Paper>
        </Grid>

        {log.media_urls && (
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">
              Media Attachments
            </Typography>
            <MediaPreviews mediaUrls={log.media_urls} />
          </Grid>
        )}

        <Grid item xs={12}>
          <ResendTextButton
            logData={log}
            variant="contained"
            color="secondary"
            text="Resend Message"
          />
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          {/* Pass metadata to the RecipientsList component */}

          <JsonViewer
            data={{
              log,
              metadata,
            }}
          />

          <DeliveryAnalysis logData={log} metadata={metadata} />
        </Grid>

        {/* Display additional metadata information if available */}
        {metadata && (
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">
              Additional Information
            </Typography>

            {/* Button to download metadata */}
            {/* <Button
              variant="outlined"
              color="primary"
              onClick={() => downloadMetadata(metadata)}
            >
              Download Metadata
            </Button> */}

            <Paper
              elevation={1}
              sx={{
                p: 2,
                backgroundColor: "grey.50",
                mt: 1,
                borderRadius: 1,
              }}
            >
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Message Type:</strong>{" "}
                {metadata.messageType?.toUpperCase() || "SMS"}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Recipient Count:</strong>{" "}
                {metadata.recipientCount || log.recipientCount}
              </Typography>
              {metadata.groupCount > 0 && (
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Groups Used:</strong> {metadata.groupCount}
                </Typography>
              )}
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Sender:</strong> {metadata.sender?.name || "Unknown"}
              </Typography>
              {metadata.sentAt && (
                <Typography variant="body2">
                  <strong>Processing Time:</strong>{" "}
                  {formatDateTime(metadata.sentAt)}
                </Typography>
              )}
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

/**
 * LogsTable component to display the logs table
 */
const LogsTable = ({
  logs,
  sortBy,
  sortDirection,
  onSort,
  onViewDetails,
  page,
  rowsPerPage,
  onChangePage,
  onChangeRowsPerPage,
  totalCount,
}) => {
  return (
    <Paper
      elevation={3}
      sx={{
        mb: 3,
        borderRadius: 2,
        overflow: "hidden",
        width: "100%",
      }}
    >
      <TableContainer
        sx={{
          maxWidth: "100%",
          overflowX: "auto",
          "&::-webkit-scrollbar": {
            height: 8,
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(0,0,0,0.2)",
            borderRadius: 4,
          },
        }}
      >
        <Table sx={{ minWidth: 650 }} size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: "grey.100" }}>
              <TableCell sx={{ fontWeight: "bold" }}>ID</TableCell>
              <TableCell
                onClick={() => onSort("created_at")}
                sx={{
                  cursor: "pointer",
                  fontWeight: "bold",
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                }}
              >
                Date/Time{" "}
                {sortBy === "created_at" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Groups</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Recipients</TableCell>
              <TableCell sx={{ fontWeight: "bold", minWidth: 200 }}>
                Message
              </TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Media</TableCell>
              <TableCell
                onClick={() => onSort("status")}
                sx={{
                  cursor: "pointer",
                  fontWeight: "bold",
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                }}
              >
                Status{" "}
                {sortBy === "status" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log, index) => (
              <TableRow
                key={log.message_id}
                hover
                sx={{
                  backgroundColor:
                    index % 2 === 0 ? "background.default" : "background.paper",
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                }}
              >
                <TableCell>
                  <Tooltip title={log.message_id}>
                    <InfoOutlined fontSize="small" color="primary" />
                  </Tooltip>
                </TableCell>
                <TableCell>{formatDateTime(log.created_at)}</TableCell>
                <TableCell>
                  {log.groups && log.groups.length > 0 ? (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {log.groups.slice(0, 2).map((group, idx) => (
                        <Chip
                          key={idx}
                          icon={<TagIcon />}
                          label={group.originalValue || group.label}
                          color="secondary"
                          variant="outlined"
                          size="small"
                        />
                      ))}
                      {log.groups.length > 2 && (
                        <Tooltip
                          title={`+${log.groups.length - 2} more groups`}
                        >
                          <Chip
                            label={`+${log.groups.length - 2}`}
                            color="secondary"
                            variant="outlined"
                            size="small"
                          />
                        </Tooltip>
                      )}
                    </Box>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      No groups
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {log.recipientCount > 1 ? (
                    <Tooltip title={`${log.recipientCount} recipients`}>
                      <Chip
                        icon={<GroupIcon />}
                        label={`${log.recipientCount} recipients`}
                        color="primary"
                        size="small"
                        sx={{ "&:hover": { boxShadow: 1 } }}
                      />
                    </Tooltip>
                  ) : (
                    log.recipient_phone
                  )}
                </TableCell>
                <TableCell>
                  <Tooltip title={log.message_content}>
                    <Typography noWrap sx={{ maxWidth: 300 }}>
                      {log.message_content}
                    </Typography>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  {log.media_urls && (
                    <Chip
                      size="small"
                      icon={<Image />}
                      label="Media"
                      variant="outlined"
                      color="secondary"
                    />
                  )}
                </TableCell>
                <TableCell>
                  <StatusChip status={log.status} />
                  {log.recipientCount > 1 &&
                    log.statuses.some((s) => s !== log.status) && (
                      <Typography
                        variant="caption"
                        sx={{ display: "block", mt: 0.5 }}
                      >
                        Mixed statuses
                      </Typography>
                    )}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      size="small"
                      onClick={() => onViewDetails(log)}
                      variant="contained"
                      color="primary"
                    >
                      View
                    </Button>
                    <ResendTextButton
                      logData={log}
                      size="small"
                      variant="outlined"
                      color="secondary"
                    />
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50, 100]}
        component="div"
        count={totalCount} // Now using the actual total count
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={onChangePage}
        onRowsPerPageChange={onChangeRowsPerPage}
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} of ${count !== -1 ? count : "many"} grouped messages`
        }
        sx={{
          borderTop: 1,
          borderColor: "divider",
          ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows":
            {
              m: 1,
            },
        }}
      />
    </Paper>
  );
};
