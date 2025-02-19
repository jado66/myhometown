"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  CircularProgress,
  Alert,
  Menu,
  MenuItem,
} from "@mui/material";
import Editor from "@monaco-editor/react";
import { useSearchParams, useRouter } from "next/navigation";
import { Close, Settings } from "@mui/icons-material";
import JsonViewer from "@/components/util/debug/DebugOutput";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useDaysOfService } from "@/hooks/useDaysOfService";

import availableFields from "./AvailableFields";
import { toast } from "react-toastify";

const API_BASE_URL = "/api/database/project-forms";

const defaultTasks = [
  {
    id: "Find Projects",
    name: "Find and Determine Project",
    fields: ["materials_procured"],
    daysBeforeDue: 42,
  },
  {
    id: "DOS - 6w",
    name: "Project Review & Ready",
    fields: ["called_811"],

    daysBeforeDue: 35,
  },
  {
    id: "DOS - 5w",
    name: "Budget Approval",
    fields: ["budget"],

    daysBeforeDue: 28,
  },
  {
    id: "DOS - 4w",
    name: "Homeowner Ability",
    fields: ["homeowner_ability"],

    daysBeforeDue: 21,
  },
  {
    id: "DOS - 3w",
    name: "Hosts assigned and trained",
    fields: ["preferred_remedies"],

    daysBeforeDue: 14,
  },
  {
    id: "DOS - 2w",
    name: "Meetings with Hosts and Homeowner",
    fields: ["preferred_remedies"],
    daysBeforeDue: 7,
  },
  {
    id: "DOS - 1w",
    name: "Materials, Blue Stake, and Dumpsters ",
    fields: ["is_address_verified"],
  },
];

export default function ConfigurableStatusTable({ communityId, date }) {
  const [dayOfService, setDayOfService] = useState(null);

  const { fetchDayOfService } = useDaysOfService();

  const searchParams = useSearchParams();
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [refresh, setRefresh] = useState(0);
  const [error, setError] = useState(null);
  const [isProjectsloading, setProjectsLoading] = useState(true);
  const [isDaysOfServiceLoading, setDaysOfServiceLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorContent, setEditorContent] = useLocalStorage(
    "editorConfig",
    JSON.stringify(defaultTasks, null, 2)
  );
  const [tasks, setTasks] = useState(null);
  const [displayError, setDisplayError] = useState(null);

  const [stagedEditorContent, setStagedEditorContent] = useState(editorContent);

  const [editorError, setEditorError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  const [showAvailableFields, setShowAvailableFields] = useState(false);
  const [startDate, setStartDate] = useState("2025-01-31");
  const [endDate, setEndDate] = useState("2025-04-11");
  const [columnWidths, setColumnWidths] = useState([]);
  const [maxWidthMap, setMaxWidthMap] = useState([]);
  const [todayPosition, setTodayPosition] = useState(0);

  const tableRef = useRef(null);
  const projectColumnRef = useRef(null);

  useEffect(() => {
    const fetchDays = async () => {
      try {
        const { data, error } = await fetchDayOfService(
          `${communityId}_${date}`
        );

        if (error) throw error;
        setDayOfService(data);

        if (data.start_date) {
          const formattedStartDate = formatDateString(data.start_date);
          if (formattedStartDate) setStartDate(formattedStartDate);
        }

        if (data.end_date) {
          const formattedEndDate = formatDateString(data.end_date);
          if (formattedEndDate) setEndDate(formattedEndDate);
        }

        setDaysOfServiceLoading(false);
      } catch (error) {
        console.error("Error fetching days of service:", error);
      }
    };

    fetchDays();
  }, [communityId, date]);

  // Calculate column widths based on daysBeforeDue
  const getColumnWidths = useCallback(
    (containerWidth, projectColumnWidth) => {
      if (!containerWidth || !projectColumnWidth) {
        console.error("Invalid dimensions:", {
          containerWidth,
          projectColumnWidth,
        });
        return [];
      }

      const availableWidth = containerWidth - projectColumnWidth;
      const startDay = new Date(startDate);
      const endDay = new Date(endDate);
      const totalDays = Math.ceil((endDay - startDay) / (1000 * 60 * 60 * 24));

      const { columnWidths, maxWidthMap } = calculateColumnWidths(
        tasks,
        availableWidth,
        totalDays
      );

      // if any columnWidths is less than 32 show a display error
      if (columnWidths.some((width) => width < 0)) {
        setDisplayError(
          `The configuration is invalid. There are ${totalDays} days to complete the tasks but some tasks are configured to take longer than that.`
        );
      } else if (columnWidths.some((width) => width < 32)) {
        setDisplayError("Some columns are too narrow to display properly");
      } else {
        setDisplayError(null);
      }

      return { columnWidths, maxWidthMap };
    },
    [tasks, startDate, endDate]
  );

  const handleEditorChange = (value) => {
    setStagedEditorContent(value);
    try {
      JSON.parse(value);
      setEditorError(null);
    } catch (err) {
      setEditorError(err.message);
    }
  };

  const handleResetConfig = () => {
    setStagedEditorContent(JSON.stringify(defaultTasks, null, 2));
    setEditorError(null);
  };

  const handleSaveConfig = () => {
    try {
      const newTasks = JSON.parse(editorContent);
      setTasks(newTasks);
      setIsEditorOpen(false);
      saveEditor();
      localStorage.setItem("projectTasks", editorContent);
    } catch (err) {
      setEditorError(err.message);
    }
  };

  useEffect(() => {
    if (editorContent) {
      try {
        setTasks(JSON.parse(editorContent));
      } catch (err) {
        console.error("Error loading saved tasks:", err);
      }
    }
  }, [editorContent]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDay = new Date(startDate);
  startDay.setHours(0, 0, 0, 0);

  const endDay = new Date(endDate);
  endDay.setHours(0, 0, 0, 0);

  const getProjectForm = useCallback(async (formId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${formId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch project form");
      }
      const data = await response.json();
      const { _id, createdAt, updatedAt, ...formData } = data;

      const address = [
        formData.addressStreet1,
        formData.addressStreet2,
        formData.addressCity,
        formData.addressState,
        formData.addressZipCode,
      ]
        .filter(Boolean)
        .join(", ");

      return {
        ...formData,
        id: formId,
        address,
        displayName: formData.propertyOwner || address || formId,
      };
    } catch (err) {
      console.error("Error fetching project form:", err);
      throw err;
    }
  }, []);

  // Calculate today marker position
  const calculateTodayPosition = useCallback(() => {
    if (!tableRef.current || !projectColumnRef.current) return 0;

    const tableWidth = tableRef.current.getBoundingClientRect().width;

    // alert("tableWidth: " + tableWidth);

    const projectColumnWidth =
      projectColumnRef.current.getBoundingClientRect().width;
    const availableWidth = tableWidth - projectColumnWidth;

    const totalDays = (endDay - startDay) / (1000 * 60 * 60 * 24);
    const daysSinceStart = (today - startDay) / (1000 * 60 * 60 * 24);
    const todayPercentage = Math.min(
      Math.max(daysSinceStart / totalDays, 0),
      1
    );

    return projectColumnWidth + availableWidth * todayPercentage;
  }, [startDate, endDate]);

  useEffect(() => {
    const fetchProjects = async () => {
      const projectIds = searchParams.get("projects")?.split(",") || [];
      if (projectIds.length === 0) {
        setProjectsLoading(false);
        setError("No projects selected");
        return;
      }

      try {
        const projectData = await Promise.all(
          projectIds.map((id) => getProjectForm(id))
        );
        setProjects(projectData);
      } catch (err) {
        setError("Failed to fetch project data");
      } finally {
        setProjectsLoading(false);
        const timeout = setTimeout(() => setRefresh((prev) => prev + 1), 1000);
        return () => clearTimeout(timeout);
      }
    };

    fetchProjects();
    // runTests();
  }, [searchParams, getProjectForm]);

  useEffect(() => {
    if (isProjectsloading || isDaysOfServiceLoading) {
      return;
    }

    const updateDimensions = () => {
      if (tableRef.current && projectColumnRef.current) {
        const tableWidth = tableRef.current.getBoundingClientRect().width;
        const projectColumnWidth =
          projectColumnRef.current.getBoundingClientRect().width;
        const { columnWidths } = getColumnWidths(
          tableWidth,
          projectColumnWidth
        );
        setColumnWidths(columnWidths);
        setTodayPosition(calculateTodayPosition());
      }
    };

    updateDimensions();

    return () => window.removeEventListener("resize", updateDimensions);
  }, [
    getColumnWidths,
    calculateTodayPosition,
    isDaysOfServiceLoading,
    isProjectsloading,
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case "done":
        return "#188D4E";
      case "progress":
        return "#febc18";
      default:
        return "#e45620";
    }
  };

  const getCellStatus = (status) => {
    switch (status) {
      case "done":
        return "Completed";
      case "progress":
        return "In Progress";
      default:
        return "Not Started";
    }
  };

  const handleCellClick = (projectIndex, taskId) => {
    const projectId = projects[projectIndex].id;
    router.push(
      process.env.NEXT_PUBLIC_DOMAIN +
        `/days-of-service/projects/${projectId}?task=${taskId}`
    );
  };

  const getProjectStatus = (project) => {
    return tasks.map((task) => {
      const completedFields = task.fields.filter((field) =>
        Boolean(project[field])
      ).length;
      const totalFields = task.fields.length;

      if (completedFields === totalFields) {
        return "done";
      } else if (completedFields > 0) {
        return "progress";
      }
      return "none";
    });
  };

  const resetEditor = () => {
    setIsEditorOpen(false);
    setStagedEditorContent(editorContent);
    setEditorError(null);
  };

  const saveEditor = () => {
    setEditorContent(stagedEditorContent);
    setIsEditorOpen(false);

    // setTimeout and refresh the entire page
    setTimeout(() => {
      setProjectsLoading(true);
      window.location.reload();
    }, 5000);
  };

  const statusesByGroup = projects.map((project) => getProjectStatus(project));

  if (isProjectsloading || isDaysOfServiceLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", p: 4 }}>
      <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
        <TextField
          type="date"
          label="Start Date"
          value={startDate}
          InputLabelProps={{ shrink: true }}
          InputProps={{
            readOnly: true,
          }}
        />
        <TextField
          type="date"
          label="End Date"
          value={endDate}
          InputLabelProps={{ shrink: true }}
          InputProps={{
            readOnly: true,
          }}
        />
        <Box sx={{ flex: 1 }} />
        <Tooltip title="Configure Tasks">
          <IconButton onClick={() => setIsEditorOpen(true)} size="small">
            <Settings />
          </IconButton>
        </Tooltip>
      </Box>

      <JsonViewer
        data={{
          projects,
          tasks,
          statusesByGroup,
          columnWidths,
          todayPosition,
        }}
      />

      {/* Full width box */}
      {displayError && (
        <Box sx={{ width: "100%", mb: 2 }}>
          <Alert severity="error">{displayError}</Alert>
        </Box>
      )}

      <Box sx={{ position: "relative" }} ref={tableRef} id="tableRef">
        {todayPosition > 0 && (
          <Box
            sx={{
              position: "absolute",
              left: `${todayPosition}px`,
              top: 55,
              bottom: 0,
              borderLeft: "2px dashed",
              borderColor: "black",
              zIndex: 1,
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: "-18px",
                left: "-20px",
                width: "40px",
                textAlign: "center",
                fontWeight: "bold",
                fontSize: "0.8rem",
              }}
            >
              Today
            </Box>
          </Box>
        )}

        {/* loop through maxMaps for not null */}
        {/* {maxWidthMap.map((width, index) => {
          const projectColumnWidth =
            projectColumnRef.current.getBoundingClientRect().width;

          if (width !== null) {
            return (
              <Box
                sx={{
                  position: "absolute",
                  left: `${width + projectColumnWidth - 1}px`,
                  top: 50,
                  bottom: 0,
                  zIndex: 1,
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: "5px",
                    bottom: 0,
                    left: "-4px",
                    width: "8px",
                    bgcolor: "grey.500",
                    borderRadius: "8px",
                    border: "1px solid",
                    borderColor: "black",
                    textAlign: "center",
                    fontWeight: "bold",
                    fontSize: "0.8rem",
                  }}
                ></Box>
              </Box>
            );
          }
        })} */}

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell ref={projectColumnRef} sx={{ maxWidth: "200px" }}>
                  Project
                </TableCell>
                {tasks.map((task, index) => (
                  <TableCell
                    key={task.id}
                    align="center"
                    sx={{ maxWidth: "200px" }}
                  >
                    <Tooltip
                      title={`${task.name}${
                        task.daysBeforeDue
                          ? ` (${task.daysBeforeDue} days)`
                          : ""
                      }`}
                      arrow
                    >
                      <span>{task.id}</span>
                    </Tooltip>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {statusesByGroup.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  <TableCell
                    sx={{
                      fontWeight: 500,
                      position: "relative",
                      maxWidth: "200px",
                    }}
                  >
                    <Box sx={{ width: "100%", height: "100%" }}>
                      {projects[rowIndex].displayName}
                      <span
                        style={{
                          marginLeft: 10,
                          fontSize: 12,
                          position: "absolute",
                          right: "10px",
                        }}
                      >
                        {row.filter((status) => status === "done").length} /{" "}
                        {row.length}
                      </span>
                    </Box>
                  </TableCell>
                  {row.map((status, colIndex) => (
                    <TableCell
                      key={colIndex}
                      align="center"
                      sx={{
                        width: columnWidths[colIndex],
                        minWidth: columnWidths[colIndex],
                        px: 0,
                        py: 0.5,
                        maxWidth: "200px",
                      }}
                    >
                      <Tooltip
                        title={`${projects[rowIndex].displayName}, ${
                          tasks[colIndex].name
                        }: ${getCellStatus(status)}`}
                        arrow
                      >
                        <Box
                          onClick={() =>
                            handleCellClick(rowIndex, tasks[colIndex].id)
                          }
                          sx={{
                            height: 32,
                            bgcolor: getStatusColor(status),
                            cursor: "pointer",
                            border: "1px solid black",
                            "&:hover": {
                              opacity: 0.8,
                              boxShadow: "0 0 0 2px rgba(0,0,0,0.2)",
                            },
                          }}
                        />
                      </Tooltip>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mt: 4 }}>
        {[
          { status: "done", label: "Completed", color: "#188D4E" },
          { status: "progress", label: "In Progress", color: "#febc18" },
          { status: "none", label: "Not Yet Started", color: "#e45620" },
        ].map(({ status, label, color }) => (
          <Box
            key={status}
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <Box
              sx={{
                width: 16,
                height: 16,
                bgcolor: color,
                border: 1,
                borderColor: "grey.300",
                borderRadius: 0.5,
              }}
            />
            <span>{label}</span>
          </Box>
        ))}
      </Box>

      <Dialog
        open={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          Configure Tasks
          <IconButton onClick={() => setIsEditorOpen(false)} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2, mt: 1 }}>
            <Menu
              id="fields-menu"
              open={showAvailableFields}
              anchorEl={anchorEl}
              onClose={() => {
                setShowAvailableFields(false);
                setAnchorEl(null);
              }}
              MenuListProps={{
                "aria-labelledby": "fields-button",
              }}
              anchorOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              transformOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
            >
              {availableFields
                .sort((a, b) => a.column_name.localeCompare(b.column_name))
                .map((field) => (
                  <MenuItem
                    key={field.column_name}
                    sx={{ minWidth: "100%" }}
                    onClick={() => {
                      // copy to clipboard
                      navigator.clipboard.writeText(field.column_name);
                      toast.success("Field copied to clipboard");
                      setAnchorEl(null);
                      setShowAvailableFields(false);
                    }}
                  >
                    {field.column_name}
                  </MenuItem>
                ))}
            </Menu>
          </Box>

          <Editor
            height="60vh"
            defaultLanguage="json"
            value={stagedEditorContent}
            onChange={handleEditorChange}
            options={{
              minimap: { enabled: false },
              formatOnPaste: true,
              formatOnType: true,
              automaticLayout: true,
            }}
          />
          {editorError && (
            <Box sx={{ color: "error.main", mt: 2, fontSize: "0.875rem" }}>
              {editorError}
            </Box>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            display: "flex",
            justifyContent: "space-between",
            gap: 1,
            p: 2,
          }}
        >
          <Button onClick={handleResetConfig} variant="outlined">
            Reset Configuration
          </Button>
          <Button
            id="fields-button"
            aria-controls={showAvailableFields ? "fields-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={showAvailableFields ? "true" : undefined}
            onClick={(event) => {
              setAnchorEl(event.currentTarget);
              setShowAvailableFields(true);
            }}
            variant="outlined"
            sx={{
              justifyContent: "flex-start",
              color: "text.primary",
              opacity: 1,
            }}
          >
            Available Fields
          </Button>
          <Box sx={{ flex: 1 }} />
          <Button onClick={resetEditor}>Cancel</Button>
          <Button
            onClick={handleSaveConfig}
            disabled={!!editorError}
            variant="contained"
          >
            Save Configuration
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

/**
 * Calculates column widths for a table based on tasks and available width.
 *
 * @param {Array} tasks - Array of task objects.
 * @param {number} availableWidth - Total available width for the columns.
 * @param {number} totalDays - Total number of days in the timeline.
 * @returns {Array} - Array of column widths.
 */

function calculateColumnWidths(tasks, availableWidth, totalDays) {
  const pixelsPerDay = availableWidth / totalDays;
  const columnWidths = [];

  let totalDaysAccountedFor = 0;

  for (let i = 0; i < tasks.length; i++) {
    const currentTask = tasks[i];
    const nextTask = tasks[i + 1];

    // Calculate the difference in daysBeforeDue
    const daysToAccomplishThisTask =
      totalDays - (currentTask.daysBeforeDue || 0);
    const daysToDisplay = daysToAccomplishThisTask - totalDaysAccountedFor;

    totalDaysAccountedFor += daysToDisplay;

    // Calculate the width for this column
    const width = daysToDisplay * pixelsPerDay;
    columnWidths.push(width);
  }

  return { columnWidths };
}
function runTests() {
  const testCases = [
    {
      name: "Basic Example",
      availableWidth: 800,
      totalDays: 100,
      // pixelsPerDay = 800 / 100 = 8
      tasks: [
        { id: "A", daysBeforeDue: 5 }, // 5*8 = 40
        { id: "B" }, // ?
        { id: "C" }, // ?
        { id: "D", daysBeforeDue: 50 }, // (50 * 8 = 400) - 40 = 360 split between B, C, and D so 120 each
        { id: "E" }, // whatever is left - 800 - 400 = 400
      ],
      expectedInitialPass: [40, null, null, 400, null],
      expectedPixelsPerDay: 8,
      expected: [40, 120, 120, 120, 400],
    },
    {
      name: "All Tasks Have daysBeforeDue",
      tasks: [
        { id: "A", daysBeforeDue: 10 }, // 10 * 20 = 200
        { id: "B", daysBeforeDue: 20 }, // 20 * 20 = 400
        { id: "C" }, // 1000 - 400 = 600
      ],
      availableWidth: 1000,
      totalDays: 50,
      expectedInitialPass: [200, 400, null],
      expectedPixelsPerDay: 20,
      expected: [200, 200, 600],
    },
    {
      name: "No Tasks Have daysBeforeDue",
      tasks: [{ id: "A" }, { id: "B" }, { id: "C" }],
      availableWidth: 900,
      totalDays: 30,
      expectedPixelsPerDay: 30,
      expectedInitialPass: [null, null, null],
      expected: [300, 300, 300],
    },
    {
      name: "Mixed Tasks",
      tasks: [
        { id: "A", daysBeforeDue: 15 }, // 300
        { id: "B" }, // no daysBeforeDue so wait to calculate
        { id: "C", daysBeforeDue: 25 }, // Ends at (25 * 20 = 500) and 500 - 300 = 200. B and C need widths so 200 / 2 = 100 for each
        { id: "D" }, // 1000 - 500 = 500
      ],
      availableWidth: 1000,
      totalDays: 50,
      expectedInitialPass: [300, null, 500, null],
      expectedPixelsPerDay: 20,
      expected: [300, 100, 100, 500],
    },
    {
      name: "Mixed Tasks",
      tasks: [
        {
          id: "Find Projects",
          name: "Find and Determine Project",
          fields: ["materialsProcured"],
          daysBeforeDue: 28,
        },
        {
          id: "DOS - 6w",
          name: "Project Review & Ready",
          fields: ["called811"],

          daysBeforeDue: 35,
        },
        {
          id: "DOS - 5w",
          name: "Budget Approval",
          fields: ["budget"],

          daysBeforeDue: 42,
        },
        {
          id: "DOS - 4w",
          name: "Homeowner Ability",
          fields: ["homeownerAbility"],

          daysBeforeDue: 49,
        },
        {
          id: "DOS - 3w",
          name: "Hosts assigned and trained",
          fields: ["preferredRemedies"],

          daysBeforeDue: 56,
        },
        {
          id: "DOS - 2w",
          name: "Meetings with Hosts and Homeowner",
          fields: ["preferredRemedies"],
          daysBeforeDue: 63,
        },
        {
          id: "DOS - 1w",
          name: "Materials, Blue Stake, and Dumpsters ",
          fields: ["isAddressVerified"],
          daysBeforeDue: 70,
        },
      ],
      availableWidth: 1000,
      totalDays: 100,
      expectedInitialPass: [
        50,
        null,
        null,
        500,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      expected: [50, 150, 150, 150, 83.33, 83.33, 83.33, 83.33, 83.33, 83.33],
    },
  ];

  testCases.forEach(({ name, tasks, availableWidth, totalDays, expected }) => {
    const result = calculateColumnWidths(tasks, availableWidth, totalDays);
    console.log(`Test Case: ${name}`);
    console.log("Expected:", expected);
    console.log("Result:", result);
    console.log("Pass:", JSON.stringify(result) === JSON.stringify(expected));
    console.log("-----------------------------");
  });
}

// runTests();

const formatDateString = (dateStr) => {
  // Remove any quotes from the date string
  const cleanDate = dateStr.replace(/"/g, "");

  // Check if the date is already in the correct format
  const isCorrectFormat = /^\d{4}-\d{2}-\d{2}$/.test(cleanDate);

  if (isCorrectFormat) {
    return cleanDate;
  }

  // If the date is invalid, return null
  const date = new Date(cleanDate);
  if (isNaN(date.getTime())) {
    return null;
  }

  // Format the date as YYYY-MM-DD
  return date.toISOString().split("T")[0];
};
