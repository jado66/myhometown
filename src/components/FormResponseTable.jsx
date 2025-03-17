import React, { useEffect, useState } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  CircularProgress,
  Button,
} from "@mui/material";
import {
  CalendarMonth,
  Person,
  AccessTime as AccessTimeIcon,
  Visibility as VisibilityIcon,
  People,
  ExpandMore as ExpandMoreIcon,
  FilterList as FilterListIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import JsonViewer from "./util/debug/DebugOutput";
import moment from "moment";

// Reuse the summary card component
const SummaryCard = ({ title, value, color = "textPrimary", icon }) => (
  <Card>
    <CardContent>
      <Box display="flex" alignItems="center" mb={1}>
        {icon && <Box mr={1}>{icon}</Box>}
        <Typography variant="body2" color="textSecondary">
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" color={color}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

export const FormResponseTable = ({
  formId,
  responses,
  formData,
  onViewResponse,
  onDeleteResponse,
  daysOfService,
}) => {
  const [summary, setSummary] = useState({
    total: 0,
    totalPeople: 0,

    uniqueDays: 0,
  });

  const [groupedResponses, setGroupedResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState({});

  useEffect(() => {
    if (!responses || !formData) return;

    setLoading(true);

    // Group responses by day of service
    const groups = {};
    const stats = responses.reduce(
      (acc, response) => {
        const data = response.response_data || response;
        const serviceDay = data.dayOfService || "unspecified";

        // Create group if it doesn't exist
        if (!groups[serviceDay]) {
          groups[serviceDay] = {
            responses: [],
            stats: {
              volunteerCount: 0,
              minorCount: 0,
            },
          };

          // Initialize expanded state for this group
          setExpandedGroups((prev) => ({
            ...prev,
            [serviceDay]: true, // Default to expanded
          }));
        }

        // Add response to group
        groups[serviceDay].responses.push(response);

        // Update group stats
        groups[serviceDay].stats.volunteerCount++;

        // Count minor volunteers
        const minorCount = Array.isArray(data.minorVolunteers)
          ? data.minorVolunteers.length
          : 0;

        groups[serviceDay].stats.minorCount += minorCount;

        // Update overall stats
        acc.totalPeople += 1 + minorCount;

        // Track unique days
        if (serviceDay !== "unspecified" && !acc.daysSet.has(serviceDay)) {
          acc.daysSet.add(serviceDay);
        }

        return acc;
      },
      { totalPeople: 0, daysSet: new Set() }
    );

    // Sort groups by date if possible
    const sortedGroups = {};

    // First try to sort by event date using the options data
    const sortedKeys = Object.keys(groups).sort((a, b) => {
      // If we have date information in the options, use it
      const serviceDayOptions = daysOfService || {};
      if (serviceDayOptions[a] && serviceDayOptions[b]) {
        // Try to extract dates from labels if possible
        const dateA = extractDateFromLabel(serviceDayOptions[a]);
        const dateB = extractDateFromLabel(serviceDayOptions[b]);

        if (dateA && dateB) {
          return dateA - dateB;
        }

        // Fall back to alphabetical sort of labels
        return serviceDayOptions[a].localeCompare(serviceDayOptions[b]);
      }

      // If no date info, just use alphabetical
      return a.localeCompare(b);
    });

    // Create the sorted object
    sortedKeys.forEach((key) => {
      sortedGroups[key] = groups[key];
    });

    // Update state
    setGroupedResponses(sortedGroups);

    setSummary({
      total: responses.length,
      totalPeople: stats.totalPeople,

      uniqueDays: stats.daysSet.size,
    });

    setLoading(false);
  }, [responses, formData, daysOfService]);

  // Helper function to try extracting a date from a service day label
  const extractDateFromLabel = (label) => {
    if (!label) return null;

    // Try to find a date pattern in the label
    const dateMatch = label.match(
      /\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})\b/
    );
    if (dateMatch) {
      const [_, month, day, year] = dateMatch;
      return new Date(`${month}/${day}/${year}`);
    }

    // Also check for month names
    const monthMatch = label.match(
      /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* (\d{1,2})(?:st|nd|rd|th)?,? (\d{4})\b/i
    );
    if (monthMatch) {
      const [_, month, day, year] = monthMatch;
      return new Date(`${month} ${day}, ${year}`);
    }

    return null;
  };

  // Helper function to get key volunteer information
  const getVolunteerInfo = (submission) => {
    const data = submission.response_data || submission;

    // Format name
    const fullName = `${submission.firstName || ""} ${
      submission.lastName || ""
    }`.trim();

    // Format date
    const submittedDate = submission.created_at
      ? moment(submission.created_at).format("MM/DD/YY")
      : "-";

    // Count minor volunteers
    const minorCount = Array.isArray(data.minorVolunteers)
      ? data.minorVolunteers.length
      : 0;

    return {
      fullName,
      submittedDate,
      email: data.email || "-",
      phone: data.phone || "-",
      location: data.addressLine1
        ? `${data.addressLine1}${
            data.addressLine2 ? ", " + data.addressLine2 : ""
          }`
        : "-",
      minorCount,
      submissionId: submission.id,
    };
  };

  const toggleGroupExpansion = (serviceDay) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [serviceDay]: !prev[serviceDay],
    }));
  };

  const expandAllGroups = (expand = true) => {
    const newState = {};
    Object.keys(groupedResponses).forEach((key) => {
      newState[key] = expand;
    });
    setExpandedGroups(newState);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (!responses || !formData) {
    return (
      <Box p={3}>
        <Typography>No data available</Typography>
      </Box>
    );
  }

  let allSubmissions = [];
  if (responses.length > 0) {
    const responseData = responses[0]?.response_data || {};
    if (responseData.submissions && Array.isArray(responseData.submissions)) {
      allSubmissions = responseData.submissions;
    }
  }

  return (
    <Box sx={{ width: "100%", mb: 4 }}>
      {/* Group controls */}
      <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
        <Button
          startIcon={<FilterListIcon />}
          onClick={() => expandAllGroups(true)}
          variant="outlined"
          size="small"
          sx={{ mr: 1 }}
        >
          Expand All
        </Button>
        <Button
          startIcon={<FilterListIcon />}
          onClick={() => expandAllGroups(false)}
          variant="outlined"
          size="small"
        >
          Collapse All
        </Button>
      </Box>

      {/* Grouped Response Sections */}
      {Object.keys(groupedResponses).length > 0 ? (
        Object.entries(groupedResponses).map(([serviceDay, group]) => {
          const dayOfService = daysOfService?.[serviceDay];
          const { responses: groupResponses, stats } = group;

          return (
            <Accordion
              key={serviceDay}
              expanded={expandedGroups[serviceDay]}
              onChange={() => toggleGroupExpansion(serviceDay)}
              sx={{ mb: 2 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                    pr: 2,
                  }}
                >
                  <Typography variant="h6">
                    {dayOfService?.name || "Day of Service"}
                    {dayOfService?.end_date &&
                      ` - ${moment(dayOfService.end_date).format(
                        "ddd, MM/DD/yy"
                      )}`}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Chip
                      label={`${groupResponses.length} volunteer${
                        groupResponses.length !== 1 ? "s" : ""
                      }`}
                      size="small"
                      color="secondary"
                      sx={{ color: "white" }}
                    />
                    {stats.minorCount > 0 && (
                      <Chip
                        icon={<People fontSize="small" />}
                        label={`${stats.minorCount} minor${
                          stats.minorCount !== 1 ? "s" : ""
                        }`}
                        size="small"
                        color="info"
                      />
                    )}
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <JsonViewer data={allSubmissions} />
                <TableContainer component={Paper} elevation={0}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Volunteer</TableCell>
                        <TableCell>Contact</TableCell>
                        <TableCell>Date Submitted</TableCell>
                        <TableCell>Minors</TableCell>

                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {allSubmissions.map((response, index) => {
                        const info = getVolunteerInfo(response);
                        return (
                          <TableRow key={info.submissionId}>
                            <TableCell>{info.fullName}</TableCell>
                            <TableCell>
                              <Tooltip
                                title={`Email: ${info.email}\nPhone: ${info.phone}`}
                              >
                                <Box>
                                  <Typography variant="body2" noWrap>
                                    {info.email}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="textSecondary"
                                    noWrap
                                  >
                                    {info.phone}
                                  </Typography>
                                </Box>
                              </Tooltip>
                            </TableCell>
                            <TableCell>{info.submittedDate}</TableCell>
                            <TableCell>
                              {info.minorCount > 0 ? (
                                <Chip
                                  label={info.minorCount}
                                  size="small"
                                  color="primary"
                                />
                              ) : (
                                "-"
                              )}
                            </TableCell>

                            <TableCell align="right">
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "flex-end",
                                }}
                              >
                                <Tooltip title="View Details">
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      onViewResponse?.(response);
                                    }}
                                  >
                                    <VisibilityIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete Response">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onDeleteResponse?.({
                                        formId,
                                        submissionId: info.submissionId,
                                      });
                                    }}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          );
        })
      ) : (
        <Typography variant="body1" sx={{ p: 2 }}>
          No volunteer responses have been submitted yet.
        </Typography>
      )}
    </Box>
  );
};
