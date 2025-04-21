import { useMemo, useState, useEffect } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";

import {
  Typography,
  Chip,
  Box,
  Paper,
  Tooltip,
  IconButton,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
  Button,
} from "@mui/material";
import {
  Person,
  AccessTime as AccessTimeIcon,
  Visibility as VisibilityIcon,
  People,
  Delete as DeleteIcon,
  FilterList,
  ImportExport,
  ExpandMore as ExpandMoreIcon,
  Event as EventIcon,
  Assignment,
} from "@mui/icons-material";
import moment from "moment";
import JsonViewer from "./util/debug/DebugOutput";

/**
 * Enhanced Volunteer Response Table using MaterialReactTable
 * Modified to group responses by day of service, with each day getting its own table
 */
export const FormResponseTable = ({
  formId,
  responses,
  formData,
  onViewResponse,
  onDeleteResponse,
  daysOfService,
  projectsData,
  isLoading = false,
}) => {
  // State for grouped data
  const [groupedData, setGroupedData] = useState({});
  const [daysOfServiceList, setDaysOfServiceList] = useState([]);
  const [currentDayTab, setCurrentDayTab] = useState(0);
  const [processedData, setProcessedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    total: 0,
    totalPeople: 0,
    uniqueDays: 0,
    dayTotals: {},
  });

  // Local storage helpers
  const getStoredState = (key, defaultValue) => {
    try {
      const savedState = localStorage.getItem(key);
      return savedState ? JSON.parse(savedState) : defaultValue;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      return defaultValue;
    }
  };

  const saveState = (key, state) => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  };

  // Table state
  const [columnSizing, setColumnSizing] = useState(
    getStoredState("volunteerTableColumnSizes", {
      fullName: 180,
      email: 180,
      phone: 140,
      whoAreYouType: 150,
      projectName: 200, // Renamed from projectId
      dayOfServiceFormatted: 200, // Added new column for day of service
      submittedAtFormatted: 140,
      minorCount: 100,
      hasPrepDay: 100,
      actions: 100,
    })
  );

  const [pagination, setPagination] = useState(
    getStoredState("volunteerTablePagination", {
      pageIndex: 0,
      pageSize: 10,
    })
  );

  const [columnVisibility, setColumnVisibility] = useState(
    getStoredState("volunteerTableColumnVisibility", {
      fullName: true,
      email: true,
      phone: true,
      whoAreYouType: true,
      projectName: true, // Renamed from projectId
      dayOfServiceFormatted: true, // Added for day of service column
      submittedAtFormatted: true,
      minorCount: true,
      hasPrepDay: true,
      actions: true,
    })
  );

  const [sorting, setSorting] = useState(
    getStoredState("volunteerTableSorting", [])
  );

  const [density, setDensity] = useState(
    getStoredState("volunteerTableDensity", "comfortable")
  );

  const [columnFilters, setColumnFilters] = useState(
    getStoredState("volunteerTableFilters", [])
  );

  // Process volunteer data and group by day of service
  // Process volunteer data and group by day of service
  useEffect(() => {
    if (!responses || !formData) return;

    setLoading(true);

    try {
      // Process the raw responses
      const processed = responses.map((response) => {
        const data = response.response_data || response;
        const whoAreYou = data.whoAreYou || {};

        // Get day of service name and key
        const serviceDay = data.dayOfService || "removed";

        // Check if daysOfService is an array or an object and handle accordingly
        let serviceDayInfo;
        if (Array.isArray(daysOfService)) {
          // If it's an array, find the matching day by id
          serviceDayInfo = daysOfService.find((day) => day.id === serviceDay);
        } else {
          // If it's an object with keys, use direct lookup
          serviceDayInfo = daysOfService?.[serviceDay];
        }

        const dayOfServiceName = serviceDayInfo?.name || "";
        const dayOfServiceDate =
          serviceDayInfo?.end_date || serviceDayInfo?.date
            ? moment(serviceDayInfo.end_date || serviceDayInfo.date).format(
                "ddd, MM/DD/yy"
              )
            : null;

        const dayOfServiceDisplay = [dayOfServiceName, dayOfServiceDate]
          .filter(Boolean) // Remove any falsy values (undefined, null, empty strings)
          .join(" - ");

        // Get project information using project ID
        const projectId = whoAreYou.projectId || "";
        const projectInfo = projectsData?.[projectId];
        const projectName = projectInfo?.name || "-";

        // Count minor volunteers
        const minorCount = Array.isArray(data.minorVolunteers)
          ? data.minorVolunteers.length
          : 0;

        // Format name
        const fullName = `${response.firstName || ""} ${
          response.lastName || ""
        }`.trim();

        // Format date
        const submittedAtFormatted =
          response.submittedAt || response.created_at
            ? moment(response.submittedAt || response.created_at).format(
                "MM/DD/YY"
              )
            : "-";

        // Format location
        const location = data.addressLine1
          ? `${data.addressLine1}${
              data.addressLine2 ? ", " + data.addressLine2 : ""
            }`
          : "-";

        return {
          ...response,
          ...data,
          fullName,
          location,
          submittedAtFormatted,
          submittedAtRaw: response.submittedAt || response.created_at,
          minorCount,
          dayOfServiceKey: serviceDay,
          dayOfServiceName,
          dayOfServiceDate,
          dayOfServiceFormatted: dayOfServiceDisplay,
          whoAreYouType: whoAreYou.type || "unknown",
          whoAreYouValue: whoAreYou.value || "",
          projectId: whoAreYou.projectId || "",
          projectName, // Add project name from project info
          hasPrepDay: whoAreYou.hasPrepDay || false,
          submissionId: response.submissionId || response.id,
        };
      });

      // Group by day of service
      const grouped = processed.reduce((acc, volunteer) => {
        const key = volunteer.dayOfServiceKey || "unspecified";
        if (!acc[key]) {
          acc[key] = {
            key: key,
            name: volunteer.dayOfServiceFormatted,
            date: volunteer.dayOfServiceDate,
            formatted: volunteer.dayOfServiceFormatted,
            volunteers: [],
          };
        }
        acc[key].volunteers.push(volunteer);
        return acc;
      }, {});

      // Convert to array and sort by date
      const daysList = Object.values(grouped).sort((a, b) => {
        // Sort by date if available
        if (a.date && b.date) {
          return moment(a.date, "ddd, MM/DD/yy").diff(
            moment(b.date, "ddd, MM/DD/yy")
          );
        }
        // Otherwise sort by name
        return a.name.localeCompare(b.name);
      });

      // Calculate summary statistics
      const stats = processed.reduce(
        (acc, response) => {
          // Count people (volunteers + minors)
          acc.totalPeople += 1 + (response.minorCount || 0);

          // Track unique days
          if (
            response.dayOfServiceKey &&
            !acc.daysSet.has(response.dayOfServiceKey)
          ) {
            acc.daysSet.add(response.dayOfServiceKey);
            acc.dayTotals[response.dayOfServiceKey] = {
              volunteers: 0,
              people: 0,
            };
          }

          // Count by day
          const dayKey = response.dayOfServiceKey || "unspecified";
          if (!acc.dayTotals[dayKey]) {
            acc.dayTotals[dayKey] = { volunteers: 0, people: 0 };
          }
          acc.dayTotals[dayKey].volunteers += 1;
          acc.dayTotals[dayKey].people += 1 + (response.minorCount || 0);

          return acc;
        },
        { totalPeople: 0, daysSet: new Set(), dayTotals: {} }
      );

      // Update state with processed data
      setProcessedData(processed);
      setGroupedData(grouped);
      setDaysOfServiceList(daysList);
      setSummary({
        total: processed.length,
        totalPeople: stats.totalPeople,
        uniqueDays: stats.daysSet.size,
        dayTotals: stats.dayTotals,
      });

      // Set default tab if available
      if (daysList.length > 0 && currentDayTab >= daysList.length) {
        setCurrentDayTab(0);
      }
    } catch (error) {
      console.error("Error processing responses:", error);
    } finally {
      setLoading(false);
    }
  }, [responses, formData, daysOfService, projectsData, currentDayTab]); // Include projectsData in dependency array

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setCurrentDayTab(newValue);
  };

  // Export to CSV function for specific day
  const exportToCSV = (dayData) => {
    const visibleColumns = columns.filter(
      (col) =>
        columnVisibility[col.accessorKey] !== false &&
        col.accessorKey !== "actions"
    );

    const headers = visibleColumns.map((col) => col.header).join(",") + "\n";

    const rows = dayData.volunteers
      .map((row) =>
        visibleColumns
          .map((col) => {
            const cellValue = row[col.accessorKey];
            // Handle special formatting for CSV export
            if (col.accessorKey === "hasPrepDay") {
              return `"${cellValue ? "Yes" : "No"}"`;
            } else if (cellValue === null || cellValue === undefined) {
              return `""`;
            } else {
              return `"${String(cellValue).replace(/"/g, '""')}"`;
            }
          })
          .join(",")
      )
      .join("\n");

    const csvContent = headers + rows;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    const fileName = `volunteers_${(dayData.name || "all")
      .replace(/\s+/g, "_")
      .toLowerCase()}.csv`;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Define table columns - removed the dayOfServiceName column since each table is for a specific day
  const columns = useMemo(
    () => [
      {
        accessorKey: "fullName",
        header: "Volunteer",
        size: columnSizing.fullName,
      },
      {
        accessorKey: "email",
        header: "Email",
        size: columnSizing.email,
        Cell: ({ row }) => (
          <Typography variant="body2" noWrap>
            {row.original.email || "-"}
          </Typography>
        ),
      },
      {
        accessorKey: "phone",
        header: "Phone",
        size: columnSizing.phone,
        Cell: ({ row }) => (
          <Typography variant="body2" color="textSecondary" noWrap>
            {row.original.phone || "-"}
          </Typography>
        ),
      },
      {
        accessorKey: "whoAreYouType",
        header: "Type",
        size: columnSizing.whoAreYouType,
        filterFn: "equals",
        Cell: ({ row }) => (
          <Chip
            label={row.original.whoAreYouType || "unknown"}
            color="primary"
            variant="outlined"
            size="small"
            sx={{ textTransform: "capitalize" }}
          />
        ),
      },
      {
        accessorKey: "projectName", // Changed from projectId to projectName
        header: "Project", // Updated header
        size: columnSizing.projectName,
        filterFn: "equals",
        Cell: ({ row }) => (
          <Typography variant="body2" noWrap>
            {row.original.projectName || "-"}
          </Typography>
        ),
      },

      {
        accessorKey: "submittedAtFormatted",
        header: "Submitted",
        size: columnSizing.submittedAtFormatted,
        sortingFn: "datetime",
        sortUndefined: -1,
        Cell: ({ row }) => (
          <Typography variant="body2" display="flex" alignItems="center">
            <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, opacity: 0.6 }} />
            {row.original.submittedAtFormatted}
          </Typography>
        ),
      },
      {
        accessorKey: "minorCount",
        header: "Minors",
        size: columnSizing.minorCount,
        filterFn: "equals",
        Cell: ({ row }) =>
          row.original.minorCount > 0 ? (
            <Chip
              icon={<People fontSize="small" />}
              label={row.original.minorCount}
              size="small"
              color="info"
            />
          ) : (
            <Typography variant="body2">-</Typography>
          ),
      },
      {
        accessorKey: "hasPrepDay",
        header: "Prep Day",
        size: columnSizing.hasPrepDay,
        filterFn: "equals",
        Cell: ({ row }) => (
          <Chip
            label={row.original.hasPrepDay ? "Yes" : "No"}
            size="small"
            color={row.original.hasPrepDay ? "success" : "default"}
            variant="outlined"
          />
        ),
      },
      {
        accessorKey: "actions",
        header: "Actions",
        size: columnSizing.actions,
        enableSorting: false,
        enableColumnFilter: false,
        Cell: ({ row }) => (
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Tooltip title="View Details">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewResponse?.(row.original);
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
                    submissionId: row.original.submissionId,
                  });
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        ),
      },
    ],
    [columnSizing, formId, onViewResponse, onDeleteResponse]
  );

  // Handle state changes
  const handleColumnSizingChange = (updater) => {
    const newColumnSizing =
      typeof updater === "function" ? updater(columnSizing) : updater;
    setColumnSizing(newColumnSizing);
    saveState("volunteerTableColumnSizes", newColumnSizing);
  };

  const handlePaginationChange = (updater) => {
    const newPagination =
      typeof updater === "function" ? updater(pagination) : updater;
    setPagination(newPagination);
    saveState("volunteerTablePagination", newPagination);
  };

  const handleColumnVisibilityChange = (updater) => {
    const newVisibility =
      typeof updater === "function" ? updater(columnVisibility) : updater;
    setColumnVisibility(newVisibility);
    saveState("volunteerTableColumnVisibility", newVisibility);
  };

  const handleSortingChange = (updater) => {
    const newSorting =
      typeof updater === "function" ? updater(sorting) : updater;
    setSorting(newSorting);
    saveState("volunteerTableSorting", newSorting);
  };

  const handleColumnFiltersChange = (updater) => {
    const newFilters =
      typeof updater === "function" ? updater(columnFilters) : updater;
    setColumnFilters(newFilters);
    saveState("volunteerTableFilters", newFilters);
  };

  const handleDensityChange = (newDensity) => {
    setDensity(newDensity);
    saveState("volunteerTableDensity", newDensity);
  };

  // Create a table component for a specific day of service
  const DayTable = ({ dayData }) => {
    // Check if day data is valid
    if (!dayData || !dayData.volunteers || dayData.volunteers.length === 0) {
      return (
        <Box p={3}>
          <Typography>
            No volunteer responses for this day of service.
          </Typography>
        </Box>
      );
    }

    // Get the day's statistics
    const dayStats = summary.dayTotals[dayData.key] || {
      volunteers: 0,
      people: 0,
    };

    // Use the hook at the component level (not in a conditional)
    const table = useMaterialReactTable({
      columns,
      data: dayData.volunteers,
      enableColumnDragging: true,
      enableColumnOrdering: true,
      enableColumnResizing: true,
      enablePagination: true,
      enableColumnVisibility: true,
      enableDensityToggle: true,
      enableColumnFilters: true,
      enableFilters: true,
      enableRowSelection: true,
      manualFiltering: false,
      manualPagination: false,
      manualSorting: false,
      columnResizeMode: "onChange",
      paginationDisplayMode: "pages",
      positionToolbarAlertBanner: "bottom",
      initialState: { showColumnFilters: false },

      // Event handlers
      onColumnSizingChange: handleColumnSizingChange,
      onPaginationChange: handlePaginationChange,
      onColumnVisibilityChange: handleColumnVisibilityChange,
      onSortingChange: handleSortingChange,
      onColumnFiltersChange: handleColumnFiltersChange,
      onDensityChange: handleDensityChange,

      // State
      state: {
        columnSizing,
        pagination,
        columnVisibility,
        sorting,
        columnFilters,
        density,
      },

      // Top toolbar actions
      renderTopToolbarCustomActions: ({ table }) => (
        <Box sx={{ display: "flex", gap: 2, alignItems: "center", p: 1 }}>
          <Tooltip title="Export to CSV">
            <Button color="primary" onClick={() => exportToCSV(dayData)}>
              <Assignment sx={{ mr: 1 }} /> Print
            </Button>
          </Tooltip>
          <Tooltip title="Toggle Filters">
            <IconButton
              color="secondary"
              onClick={() => table.setShowColumnFilters((prev) => !prev)}
            >
              <FilterList />
            </IconButton>
          </Tooltip>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", ml: 1 }}>
            <Tooltip title="Volunteers registered for this day">
              <Chip
                icon={<Person fontSize="small" />}
                label={`${dayStats.volunteers} Volunteers`}
                color="primary"
                size="small"
              />
            </Tooltip>
            {dayStats.people > dayStats.volunteers && (
              <Tooltip title="Total people (volunteers + minors) for this day">
                <Chip
                  icon={<People fontSize="small" />}
                  label={`${dayStats.people} People`}
                  color="info"
                  size="small"
                />
              </Tooltip>
            )}
          </Box>
        </Box>
      ),

      // Row props
      muiTableBodyRowProps: ({ row }) => ({
        onClick: () => onViewResponse?.(row.original),
        sx: {
          cursor: "pointer",
          "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.04)",
          },
        },
      }),

      // Pagination props
      muiPaginationProps: {
        rowsPerPageOptions: [5, 10, 25, 50, 100],
        showFirstButton: true,
        showLastButton: true,
      },

      // Other display options
      positionPagination: "bottom",
      rowNumberDisplayMode: "static",
      muiTableContainerProps: {
        component: Paper,
        elevation: 0,
        sx: { maxHeight: "700px" },
      },
      displayColumnDefOptions: {
        "mrt-row-actions": {
          size: 100,
        },
      },
      enableBottomToolbar: true,
    });

    return <MaterialReactTable table={table} />;
  };

  if (isLoading || loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (!responses || !responses.length || !formData) {
    return (
      <Box p={3}>
        <Typography>No volunteer responses have been submitted yet.</Typography>
      </Box>
    );
  }

  // If there's only one day of service or no days defined, show a single table
  if (daysOfServiceList.length <= 1) {
    return (
      <Box sx={{ width: "100%", mb: 4 }}>
        <Paper sx={{ mb: 2, p: 2 }}>
          <Typography variant="h6">
            {daysOfServiceList.length === 1
              ? daysOfServiceList[0].formatted
              : "All Volunteers"}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Total: {summary.total} volunteers, {summary.totalPeople} people
            including minors
          </Typography>
        </Paper>
        {daysOfServiceList.length === 1 ? (
          <DayTable dayData={daysOfServiceList[0]} />
        ) : (
          <DayTable dayData={{ key: "all", volunteers: processedData }} />
        )}
      </Box>
    );
  }

  // Multiple days of service - use tabs
  return (
    <Box sx={{ width: "100%", mb: 4 }}>
      <JsonViewer data={responses} />

      <Paper sx={{ mb: 2 }}>
        <Tabs
          value={currentDayTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          {daysOfServiceList.map((day, index) => (
            <Tab
              key={day.key}
              label={
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <EventIcon fontSize="small" sx={{ mr: 1 }} />
                  {day.name}
                  <Chip
                    label={summary.dayTotals[day.key]?.volunteers || 0}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Box>
              }
              value={index}
            />
          ))}
        </Tabs>
      </Paper>

      {/* Show the selected day's table */}
      {daysOfServiceList.length > currentDayTab && (
        <DayTable dayData={daysOfServiceList[currentDayTab]} />
      )}
    </Box>
  );
};

export default FormResponseTable;
