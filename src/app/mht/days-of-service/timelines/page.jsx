"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Tooltip,
  TextField,
  CircularProgress,
  Alert,
} from "@mui/material";
import JsonViewer from "@/components/util/debug/DebugOutput";
import { useSearchParams } from "next/navigation";

const API_BASE_URL = "/api/database/project-forms";

export default function StatusTable() {
  const searchParams = useSearchParams();
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
  const [startDate, setStartDate] = useState("2025-01-23");
  const [endDate, setEndDate] = useState("2025-01-25");
  const [todayLeftPosition, setTodayLeftPosition] = useState(0);
  const [todayTopPosition, setTodayTopPosition] = useState(0);

  const tableRef = useRef(null);
  const projectColumnRef = useRef(null);

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

  useEffect(() => {
    if (tableRef.current && projectColumnRef.current) {
      const tableWidth = tableRef.current.getBoundingClientRect().width;
      const projectColumnWidth =
        projectColumnRef.current.getBoundingClientRect().width;

      const projectRowHeight =
        projectColumnRef.current.getBoundingClientRect().height;
      const today = new Date().toISOString().split("T")[0];
      const startDateTime = new Date(startDate).getTime();
      const endDateTime = new Date(endDate).getTime();
      const todayDateTime = new Date(today).getTime();
      const todayPercentage =
        (todayDateTime - startDateTime) / (endDateTime - startDateTime);

      const availableWidth = tableWidth - projectColumnWidth;
      const position = projectColumnWidth + availableWidth * todayPercentage;
      setTodayLeftPosition(position);
      setTodayTopPosition(projectRowHeight);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    const fetchProjects = async () => {
      const projectIds = searchParams.get("projects")?.split(",") || [];
      if (projectIds.length === 0) {
        setLoading(false);
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
        setLoading(false);
      }
    };

    fetchProjects();
  }, [searchParams, getProjectForm]);

  const statusesByGroup = [
    [
      "done",
      "progress",
      "progress",
      "progress",
      "progress",
      "none",
      "none",
      "none",
      "none",
      "none",
    ],
    [
      "done",
      "done",
      "done",
      "progress",
      "progress",
      "progress",
      "none",
      "none",
      "none",
      "none",
    ],
    [
      "progress",
      "progress",
      "progress",
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
    ],
    [
      "progress",
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
    ],
    [
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
    ],
    [
      "done",
      "done",
      "done",
      "done",
      "done",
      "done",
      "progress",
      "progress",
      "none",
      "none",
    ],
    [
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
    ],
    [
      "done",
      "done",
      "progress",
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
    ],
    [
      "progress",
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
    ],
    [
      "done",
      "progress",
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
    ],
  ];

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

  const handleCellClick = (projectIndex, columnIndex) => {
    alert(
      `Clicked Project ${projectIndex + 1}, Column ${letters[columnIndex]}`
    );
  };

  const today = new Date().toISOString().split("T")[0];
  const startDateTime = new Date(startDate).getTime();
  const endDateTime = new Date(endDate).getTime();
  const todayDateTime = new Date(today).getTime();
  const todayPosition =
    ((todayDateTime - startDateTime) / (endDateTime - startDateTime)) * 100;

  if (loading) {
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
      <JsonViewer data={projects} />

      <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
        <TextField
          type="date"
          label="Start Date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          type="date"
          label="End Date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
      </Box>

      <Box sx={{ position: "relative" }} id="table-ref" ref={tableRef}>
        {todayLeftPosition > 0 && (
          <Box
            style={{
              left: `${todayLeftPosition}px`,
              position: "absolute",
              top: `${todayTopPosition + 5}px`,
              bottom: 0,
              borderLeft: "3px dashed",
              borderColor: "grey.500",
              zIndex: 1,
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: "-30px",
                left: "-20px",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontWeight: "bold",
                fontSize: "0.8rem",
              }}
            >
              Today
            </Box>
          </Box>
        )}

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell ref={projectColumnRef} className="font-bold">
                  Project
                </TableCell>
                {letters.map((letter) => (
                  <TableCell
                    key={letter}
                    align="center"
                    sx={{ fontWeight: "bold" }}
                  >
                    {letter}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {statusesByGroup.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  <TableCell sx={{ fontWeight: 500, position: "relative" }}>
                    <Box
                      sx={{
                        width: "100%",
                        height: "100%",
                        "&:hover": {
                          opacity: 0.8,
                          boxShadow: "0 0 0 2px rgba(0,0,0,0.2)",
                        },
                      }}
                    >
                      Project {rowIndex + 1}
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
                      sx={{ px: 0, py: 0.5 }}
                    >
                      <Tooltip
                        title={`Project ${rowIndex + 1}, Task ${
                          letters[colIndex]
                        }: ${getCellStatus(status)}`}
                        arrow
                      >
                        <Box
                          onClick={() => handleCellClick(rowIndex, colIndex)}
                          sx={{
                            border: "1px solid black",
                            borderLeft:
                              colIndex === 0 ? "1px solid black" : "none",
                            height: 32,
                            bgcolor: getStatusColor(status),
                            mx: 0,
                            cursor: "pointer",
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
          { status: "done", label: "Completed", color: "#22c55e" },
          { status: "progress", label: "In Progress", color: "#facc15" },
          { status: "none", label: "Not Yet Started", color: "#fdba74" },
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
    </Box>
  );
}
