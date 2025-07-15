"use client";

import { useState } from "react";
import moment from "moment";
import { DataGrid } from "@mui/x-data-grid";
import {
  Checkbox,
  Typography,
  Box,
  Paper,
  IconButton,
  Card,
  CardContent,
} from "@mui/material";

import { ChevronLeft, ChevronRight, Today } from "@mui/icons-material";

export function MobileRollTable({
  classData,
  dates,
  nameFields,
  localAttendance,
  handleAttendanceChange,
}) {
  const [selectedDateIndex, setSelectedDateIndex] = useState(() => {
    const today = moment().format("YYYY-MM-DD");
    const todayIndex = dates.findIndex((date) => date === today);
    return todayIndex !== -1 ? todayIndex : 0;
  });

  const selectedDate = dates[selectedDateIndex];
  const enrolledStudents = classData.signups.filter(
    (signup) => !signup.isWaitlisted
  );

  const handleDateChange = (newIndex) => {
    if (newIndex >= 0 && newIndex < dates.length) {
      setSelectedDateIndex(newIndex);
    }
  };

  const formatDateDisplay = (date) => {
    const momentDate = moment(date);
    const isToday = date === moment().format("YYYY-MM-DD");
    return {
      dayOfWeek: momentDate.format("dddd"),
      shortDate: momentDate.format("MM/DD/YY"),
      isToday,
    };
  };

  const dateInfo = formatDateDisplay(selectedDate);
  const presentCount = enrolledStudents.filter(
    (s) => localAttendance[s.id]?.[selectedDate]
  ).length;

  return (
    <Box sx={{ mt: 2 }}>
      {/* Date Navigation Header */}
      <Paper
        elevation={2}
        sx={{ p: 2, mb: 2, position: "sticky", top: 0, zIndex: 1 }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <IconButton
            onClick={() => handleDateChange(selectedDateIndex - 1)}
            disabled={selectedDateIndex === 0}
            size="small"
          >
            <ChevronLeft />
          </IconButton>

          <Box sx={{ textAlign: "center", flex: 1 }}>
            <Typography variant="h6">{dateInfo.dayOfWeek}</Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                {dateInfo.shortDate}
              </Typography>
              {dateInfo.isToday && (
                <Chip
                  label="Today"
                  size="small"
                  color="primary"
                  icon={<Today />}
                  sx={{ height: 20 }}
                />
              )}
            </Box>
          </Box>

          <IconButton
            onClick={() => handleDateChange(selectedDateIndex + 1)}
            disabled={selectedDateIndex === dates.length - 1}
            size="small"
          >
            <ChevronRight />
          </IconButton>
        </Box>

        {/* Date indicator dots */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mt: 2,
            gap: 0.5,
            overflowX: "auto",
            pb: 0.5,
            "&::-webkit-scrollbar": { height: 4 },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "rgba(0,0,0,0.2)",
              borderRadius: 2,
            },
          }}
        >
          {dates.map((date, index) => (
            <Box
              key={date}
              sx={{
                minWidth: 8,
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor:
                  index === selectedDateIndex ? "primary.main" : "grey.300",
                cursor: "pointer",
                transition: "all 0.2s",
                "&:hover": {
                  transform: "scale(1.2)",
                  bgcolor:
                    index === selectedDateIndex ? "primary.dark" : "grey.400",
                },
              }}
              onClick={() => setSelectedDateIndex(index)}
            />
          ))}
        </Box>

        {/* Attendance Summary */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: "center", mt: 1 }}
        >
          Present: {presentCount} / {enrolledStudents.length}
        </Typography>
      </Paper>

      {/* Student List */}
      <Box sx={{ px: 1 }}>
        {enrolledStudents.map((student, index) => {
          const studentName = nameFields
            .map((field) => student[field.key])
            .filter(Boolean)
            .join(" ");

          return (
            <Card
              key={student.id}
              variant="outlined"
              sx={{
                mb: 1,
                bgcolor: index % 2 === 0 ? "grey.50" : "background.paper",
              }}
            >
              <CardContent
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 2,
                  "&:last-child": { pb: 2 },
                }}
              >
                <Typography variant="body1" sx={{ flex: 1, pr: 2 }}>
                  {studentName}
                </Typography>
                <Checkbox
                  checked={localAttendance[student.id]?.[selectedDate] || false}
                  onChange={(e) =>
                    handleAttendanceChange(
                      student.id,
                      selectedDate,
                      e.target.checked
                    )
                  }
                  color="primary"
                  sx={{ p: 0.5 }}
                />
              </CardContent>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
}

// Tablet View Component - Shows a scrollable table with limited columns
function RenderTabletView({
  classData,
  dates,
  nameFields,
  localAttendance,
  handleAttendanceChange,
}) {
  const enrolledStudents = classData.signups.filter(
    (signup) => !signup.isWaitlisted
  );
  const today = moment().format("YYYY-MM-DD");

  // Group dates by week for better tablet display
  const [weekOffset, setWeekOffset] = useState(0);
  const datesPerWeek = 5; // Show 5 days at a time

  const startIndex = weekOffset * datesPerWeek;
  const endIndex = Math.min(startIndex + datesPerWeek, dates.length);
  const visibleDates = dates.slice(startIndex, endIndex);

  const canGoBack = weekOffset > 0;
  const canGoForward = endIndex < dates.length;

  return (
    <Box sx={{ mt: 3 }}>
      {/* Week Navigation */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Button
          startIcon={<ChevronLeft />}
          onClick={() => setWeekOffset(weekOffset - 1)}
          disabled={!canGoBack}
          size="small"
        >
          Previous
        </Button>

        <Typography variant="body2" color="text.secondary">
          Showing {startIndex + 1}-{endIndex} of {dates.length} days
        </Typography>

        <Button
          endIcon={<ChevronRight />}
          onClick={() => setWeekOffset(weekOffset + 1)}
          disabled={!canGoForward}
          size="small"
        >
          Next
        </Button>
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          maxHeight: 600,
          "& .MuiTable-root": {
            minWidth: 600,
          },
        }}
      >
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  position: "sticky",
                  left: 0,
                  bgcolor: "background.paper",
                  zIndex: 3,
                  minWidth: 180,
                  borderRight: "2px solid",
                  borderColor: "divider",
                  fontWeight: "bold",
                }}
              >
                Student Name
              </TableCell>
              {visibleDates.map((date) => {
                const isToday = date === today;
                const dayOfWeek = moment(date).format("ddd");
                const shortDate = moment(date).format("M/D");

                return (
                  <TableCell
                    key={date}
                    align="center"
                    sx={{
                      minWidth: 80,
                      bgcolor: isToday ? "primary.light" : "background.paper",
                      color: isToday ? "primary.contrastText" : "text.primary",
                      borderRight: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: isToday ? "bold" : "medium",
                        lineHeight: 1.2,
                      }}
                    >
                      {dayOfWeek}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        fontSize: "0.7rem",
                      }}
                    >
                      {shortDate}
                    </Typography>
                    {isToday && (
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: "0.65rem",
                          display: "block",
                          fontWeight: "bold",
                        }}
                      >
                        TODAY
                      </Typography>
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {enrolledStudents.map((student, index) => {
              const studentName = nameFields
                .map((field) => student[field.key])
                .filter(Boolean)
                .join(" ");

              const isEvenRow = index % 2 === 0;

              return (
                <TableRow
                  key={student.id}
                  sx={{
                    "&:hover": {
                      bgcolor: "action.hover",
                      "& .sticky-cell": {
                        bgcolor: "action.hover",
                      },
                    },
                  }}
                >
                  <TableCell
                    className="sticky-cell"
                    sx={{
                      position: "sticky",
                      left: 0,
                      bgcolor: isEvenRow ? "grey.50" : "background.paper",
                      borderRight: "2px solid",
                      borderColor: "divider",
                      zIndex: 2,
                      transition: "background-color 0.2s",
                    }}
                  >
                    <Typography variant="body2" noWrap>
                      {studentName}
                    </Typography>
                  </TableCell>
                  {visibleDates.map((date) => {
                    const isToday = date === today;
                    return (
                      <TableCell
                        key={date}
                        align="center"
                        padding="checkbox"
                        sx={{
                          bgcolor: isEvenRow ? "grey.50" : "background.paper",
                          borderRight: "1px solid",
                          borderColor: "divider",
                          ...(isToday && {
                            bgcolor: isEvenRow
                              ? "primary.light"
                              : "primary.lighter",
                          }),
                        }}
                      >
                        <Checkbox
                          checked={localAttendance[student.id]?.[date] || false}
                          onChange={(e) =>
                            handleAttendanceChange(
                              student.id,
                              date,
                              e.target.checked
                            )
                          }
                          size="small"
                          sx={{
                            padding: 0.5,
                            ...(isToday && {
                              color: "primary.dark",
                            }),
                          }}
                        />
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Summary Statistics */}
      <Paper elevation={1} sx={{ p: 2, mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Attendance Summary for Visible Dates:
        </Typography>
        <Box sx={{ display: "flex", gap: 2, mt: 1, flexWrap: "wrap" }}>
          {visibleDates.map((date) => {
            const presentCount = enrolledStudents.filter(
              (s) => localAttendance[s.id]?.[date]
            ).length;
            const percentage = Math.round(
              (presentCount / enrolledStudents.length) * 100
            );
            return (
              <Chip
                key={date}
                label={`${moment(date).format("M/D")}: ${percentage}%`}
                size="small"
                color={
                  percentage >= 80
                    ? "success"
                    : percentage >= 60
                    ? "warning"
                    : "default"
                }
              />
            );
          })}
        </Box>
      </Paper>
    </Box>
  );
}
