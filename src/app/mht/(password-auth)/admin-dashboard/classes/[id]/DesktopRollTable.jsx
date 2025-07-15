"use client";

import { useMemo } from "react";
import moment from "moment";
import { DataGrid } from "@mui/x-data-grid";
import { Checkbox, Typography, Box, Paper } from "@mui/material";

export function DesktopRollTable({
  classData,
  dates,
  nameFields,
  localAttendance,
  handleAttendanceChange,
}) {
  // Create a single consolidated name column
  const nameColumn = useMemo(
    () => ({
      field: "studentInfo",
      headerName: "Student Information",
      width: 300,
      pinned: "left",
      renderCell: (params) => (
        <Box sx={{ display: "flex", flexDirection: "row", py: 1 }}>
          {nameFields.map((field) => (
            <Typography key={field.key} variant="body2" sx={{ mb: 0.5, mr: 1 }}>
              {params.row[field.key] || ""}
            </Typography>
          ))}
        </Box>
      ),
      valueGetter: (params) => {
        // This helps with sorting if needed
        return nameFields.map((field) => params.row[field.key]).join(" ");
      },
    }),
    [nameFields]
  );

  // Create columns for dates
  const dateColumns = useMemo(() => {
    return dates.map((date) => {
      const [year, month, day] = date.split("-");
      const isToday = date === moment().format("YYYY-MM-DD");
      const dayOfWeek = moment(date).format("dddd");

      return {
        field: date,
        headerName: dayOfWeek,
        width: 120,
        renderHeader: (params) => (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography variant="body2">{dayOfWeek}</Typography>
            <Typography
              variant="body2"
              sx={{
                ...(isToday && {
                  fontWeight: "bold",
                  color: "primary.main",
                }),
              }}
            >
              {`${month}/${day}/${year.slice(-2)}`}
              {isToday && (
                <Typography
                  component="span"
                  sx={{
                    ml: 0.5,
                    fontSize: "0.75rem",
                    color: "primary.main",
                  }}
                >
                  (Today)
                </Typography>
              )}
            </Typography>
          </Box>
        ),
        renderCell: (params) => (
          <Box
            sx={{ display: "flex", justifyContent: "center", width: "100%" }}
          >
            <Checkbox
              checked={localAttendance[params.row.id]?.[date] || false}
              onChange={(e) =>
                handleAttendanceChange(params.row.id, date, e.target.checked)
              }
            />
          </Box>
        ),
        valueGetter: (params) =>
          localAttendance[params.row.id]?.[date] || false,
        sortable: false,
        align: "center",
        headerAlign: "center",
      };
    });
  }, [dates, localAttendance, handleAttendanceChange]);

  // Combine name and date columns
  const columns = useMemo(
    () => [nameColumn, ...dateColumns],
    [nameColumn, dateColumns]
  );

  // Filter out waitlisted students and prepare rows
  const rows = useMemo(() => {
    return classData.signups
      .filter((signup) => !signup.isWaitlisted)
      .map((signup) => {
        // Create a row with all the properties from signup
        return { ...signup };
      });
  }, [classData.signups]);

  return (
    <Paper elevation={2} sx={{ mt: 4, overflow: "hidden" }}>
      <Box
        sx={{
          height: 500,
          width: "100%",
          "& .MuiDataGrid-root": {
            border: "none",
          },
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row.id}
          disableRowSelectionOnClick
          getRowClassName={(params) =>
            params.indexRelativeToCurrentPage % 2 === 0 ? "even-row" : "odd-row"
          }
          sx={{
            "& .even-row": {
              backgroundColor: "rgb(232, 235, 245)",
            },
            "& .odd-row": {
              backgroundColor: "white",
            },
            "& .MuiDataGrid-columnHeader, & .MuiDataGrid-cell": {
              borderRight: "1px solid rgba(224, 224, 224, 1)",
            },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "white",
              borderBottom: "2px solid rgba(224, 224, 224, 1)",
            },
            "& .MuiDataGrid-virtualScroller": {
              backgroundColor: "white",
            },
            "& .MuiDataGrid-footerContainer": {
              borderTop: "none",
              backgroundColor: "white",
            },
            "& .MuiCheckbox-root": {
              padding: 0,
            },
            "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within": {
              outline: "none",
            },
            "& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within":
              {
                outline: "none",
              },
            // Enhanced styling for pinned columns
            "& .MuiDataGrid-cell--pinned": {
              backgroundColor: "inherit",
              boxShadow: "2px 0 5px -2px rgba(0,0,0,0.1)",
            },
            "& .MuiDataGrid-columnHeader--pinned": {
              backgroundColor: "white",
              boxShadow: "2px 0 5px -2px rgba(0,0,0,0.1)",
            },
          }}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 100, page: 0 },
            },
            columns: {
              pinnedColumns: { left: ["studentInfo"], right: [] },
            },
          }}
          pageSizeOptions={[25, 50, 100]}
        />
      </Box>
    </Paper>
  );
}
