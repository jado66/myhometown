"use client";
import React from "react";
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
} from "@mui/material";

export default function StatusTable() {
  const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

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

  return (
    <Box sx={{ width: "100%", p: 4 }}>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Project</TableCell>
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
                <TableCell sx={{ fontWeight: 500 }}>
                  Project {rowIndex + 1}
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
