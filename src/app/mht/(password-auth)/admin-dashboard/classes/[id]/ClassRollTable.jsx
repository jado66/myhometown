"use client";

import { useState, useEffect, useCallback } from "react";
import moment from "moment";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Snackbar,
  Alert,
  Checkbox,
  TableSortLabel,
  Dialog,
  DialogTitle,
  IconButton,
  Box,
  Divider,
  Typography,
  Button,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { toast } from "react-toastify";
import Close from "@mui/icons-material/Close";
import ClassPreview from "@/components/class-signups/stepper-components/ClassPreview";
import { useAttendance } from "@/hooks/use-attendance";
import { Download, Today } from "@mui/icons-material";
import JsonViewer from "@/components/util/debug/DebugOutput";

export default function ClassRollTable({ classData, show, onClose }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  const [saveTimeout, setSaveTimeout] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [localAttendance, setLocalAttendance] = useState({});
  const { markBulkAttendance } = useAttendance();
  const [isDirty, setIsDirty] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [todayDateIndex, setTodayDateIndex] = useState(-1);
  const [lastNameSort, setLastNameSort] = useState("asc"); // asc | desc

  // Transform attendance array to lookup object on component mount or when classData changes
  useEffect(() => {
    if (!classData?.attendance) return;

    const attendanceLookup = classData.attendance.reduce((acc, record) => {
      if (!acc[record.studentId]) {
        acc[record.studentId] = {};
      }
      acc[record.studentId][record.date] = record.present;
      return acc;
    }, {});

    setLocalAttendance(attendanceLookup);
  }, [classData]);

  const generateDates = useCallback(() => {
    if (!classData?.startDate || !classData?.endDate) {
      return [];
    }

    // For a single day class, we just need to return that one date
    if (classData.startDate === classData.endDate) {
      return [classData.startDate];
    }

    const dates = [];
    // Start from the day after the start date to align with the expected schedule
    let currentDate = moment.utc(classData.startDate).startOf("day");
    const endDateTime = moment.utc(classData.endDate).endOf("day");

    while (currentDate.isSameOrBefore(endDateTime)) {
      // Get day of week in user's timezone
      const dayOfWeek = currentDate.clone().format("dddd");
      const matchingMeetings = classData.meetings.filter(
        (meeting) => meeting.day === dayOfWeek
      );

      if (matchingMeetings.length > 0) {
        // Store the date in YYYY-MM-DD format while preserving UTC
        dates.push(currentDate.format("YYYY-MM-DD"));
      }

      currentDate = currentDate.add(1, "days");
    }

    return dates;
  }, [classData]);

  const getNameFields = useCallback(() => {
    if (!classData?.signupForm?.formConfig) {
      return [];
    }

    return Object.entries(classData.signupForm.formConfig)
      .filter(([key]) => ["firstName", "middleName", "lastName"].includes(key))
      .map(([key, field]) => ({
        key,
        label: field.label,
        required: field.required || false,
      }));
  }, [classData]);

  const dates = generateDates();
  const nameFields = getNameFields();

  // Find today's date in the dates array and set initial selected date
  useEffect(() => {
    if (dates.length > 0) {
      const today = moment().format("YYYY-MM-DD");
      const index = dates.findIndex((date) => date === today);
      setTodayDateIndex(index);

      // Only set selectedDate if it hasn't been set yet
      if (!selectedDate) {
        // If today is a class day, select it
        if (index !== -1) {
          setSelectedDate(today);
        } else {
          // Otherwise, find the next upcoming class day
          const futureClassIndex = dates.findIndex((date) =>
            moment(date).isSameOrAfter(today)
          );

          if (futureClassIndex !== -1) {
            // If there's a future class, select it
            setSelectedDate(dates[futureClassIndex]);
          } else {
            // If no future classes, select the most recent past class
            setSelectedDate(dates[dates.length - 1]);
          }
        }
      }
    }
  }, [dates, selectedDate]);

  const saveAttendance = useCallback(
    async (isManualSave = false) => {
      setIsSaving(true);
      try {
        await markBulkAttendance(classData.id, localAttendance);
        if (isManualSave) {
          toast.success("Attendance saved successfully");
          setIsDirty(false);
        }
      } catch (error) {
        toast.error("Failed to save attendance");
        console.error("Error saving attendance:", error);
      } finally {
        setIsSaving(false);
      }
    },
    [localAttendance, classData?.id, markBulkAttendance]
  );

  const handleAttendanceChange = (studentId, date, checked) => {
    isDirty || setIsDirty(true);

    setLocalAttendance((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [date]: checked,
      },
    }));

    // Only set up autosave if the dialog is still open
    if (show) {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }

      const timeoutId = setTimeout(() => {
        saveAttendance(false); // Pass false to indicate this is an auto-save
      }, 2500);

      setSaveTimeout(timeoutId);
    }
  };

  useEffect(() => {
    return () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
    };
  }, [saveTimeout]);

  useEffect(() => {
    if (!show) {
      setIsDirty(false);
    }
  }, [show]);

  const handleClose = () => {
    if (!onClose) {
      return;
    }

    // Clear any pending autosave
    if (saveTimeout) {
      clearTimeout(saveTimeout);
      setSaveTimeout(null);
    }

    // Only save if there are unsaved changes
    if (isDirty) {
      saveAttendance(true); // Pass true to indicate this is a manual save
    }

    onClose();
  };

  const handleDateChange = (event, newValue) => {
    setSelectedDate(newValue);
  };

  const formatDisplayDate = (date) => {
    const [year, month, day] = date.split("-");
    return `${month}/${day}/${year.slice(-2)} (${moment(date).format("ddd")})`;
  };

  // Function to check if the selected date is today
  const isSelectedDateToday = () => {
    if (!selectedDate) return false;
    const today = moment().format("YYYY-MM-DD");
    return selectedDate === today;
  };

  // Replace the renderMobileView function with this improved version that includes prev/next buttons
  const renderMobileView = () => {
    if (!selectedDate) return null;

    // Find the current date index to enable/disable prev/next buttons appropriately
    const currentDateIndex = dates.findIndex((date) => date === selectedDate);
    const hasPrevious = currentDateIndex > 0;
    const hasNext = currentDateIndex < dates.length - 1;
    const hasToday = todayDateIndex !== -1;

    const goToPreviousDate = () => {
      if (hasPrevious) {
        setSelectedDate(dates[currentDateIndex - 1]);
      }
    };

    const goToNextDate = () => {
      if (hasNext) {
        setSelectedDate(dates[currentDateIndex + 1]);
      }
    };

    const goToToday = () => {
      if (hasToday) {
        setSelectedDate(dates[todayDateIndex]);
      }
    };

    return (
      <>
        <Box sx={{ mb: 2, mt: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Current Date: {formatDisplayDate(selectedDate)}
            {isSelectedDateToday() && (
              <Typography
                component="span"
                sx={{ ml: 1, color: "primary.main", fontWeight: "bold" }}
              >
                (Today)
              </Typography>
            )}
          </Typography>

          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Button
              variant="outlined"
              onClick={goToPreviousDate}
              disabled={!hasPrevious}
              startIcon={
                <Box component="span" sx={{ fontSize: "1.5rem" }}>
                  ←
                </Box>
              }
              sx={{ minWidth: hasToday ? "30%" : "40%", py: 1 }}
            >
              Prev
            </Button>

            {hasToday && (
              <Button
                variant="contained"
                color="primary"
                onClick={goToToday}
                disabled={isSelectedDateToday()}
                startIcon={<Today />}
                sx={{ minWidth: "30%", py: 1 }}
              >
                Today
              </Button>
            )}

            <Button
              variant="outlined"
              onClick={goToNextDate}
              disabled={!hasNext}
              endIcon={
                <Box component="span" sx={{ fontSize: "1.5rem" }}>
                  →
                </Box>
              }
              sx={{ minWidth: hasToday ? "30%" : "40%", py: 1 }}
            >
              Next
            </Button>
          </Box>
        </Box>

        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Student</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold" }}>
                  Present
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {classData.signups
                .filter((signup) => !signup.isWaitlisted)
                .map((signup, index) => {
                  // Combine name fields for display
                  const studentName = nameFields
                    .map((field) => signup[field.key] || "")
                    .filter(Boolean)
                    .join(" ");

                  return (
                    <TableRow key={index}>
                      <TableCell>{studentName}</TableCell>
                      <TableCell align="center">
                        <Checkbox
                          checked={
                            localAttendance[signup.id]?.[selectedDate] || false
                          }
                          onChange={(e) =>
                            handleAttendanceChange(
                              signup.id,
                              selectedDate,
                              e.target.checked
                            )
                          }
                          sx={{ "& .MuiSvgIcon-root": { fontSize: 28 } }} // Larger checkbox for mobile
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
      </>
    );
  };

  // Also update the renderTabletView function to include the same navigation buttons
  const renderTabletView = () => {
    // Find the current date index to enable/disable prev/next buttons appropriately
    const currentDateIndex = dates.findIndex((date) => date === selectedDate);
    const hasPrevious = currentDateIndex > 0;
    const hasNext = currentDateIndex < dates.length - 1;
    const hasToday = todayDateIndex !== -1;

    const goToPreviousDate = () => {
      if (hasPrevious) {
        setSelectedDate(dates[currentDateIndex - 1]);
      }
    };

    const goToNextDate = () => {
      if (hasNext) {
        setSelectedDate(dates[currentDateIndex + 1]);
      }
    };

    const goToToday = () => {
      if (hasToday) {
        setSelectedDate(dates[todayDateIndex]);
      }
    };

    return (
      <>
        <Box sx={{ mb: 2, mt: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Current Date: {formatDisplayDate(selectedDate)}
            {isSelectedDateToday() && (
              <Typography
                component="span"
                sx={{ ml: 1, color: "primary.main", fontWeight: "bold" }}
              >
                (Today)
              </Typography>
            )}
          </Typography>

          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Button
              variant="outlined"
              onClick={goToPreviousDate}
              disabled={!hasPrevious}
              startIcon={
                <Box component="span" sx={{ fontSize: "1.5rem" }}>
                  ←
                </Box>
              }
              sx={{ minWidth: hasToday ? "30%" : "40%" }}
            >
              Previous Date
            </Button>

            {hasToday && (
              <Button
                variant="contained"
                color="primary"
                onClick={goToToday}
                disabled={isSelectedDateToday()}
                startIcon={<Today />}
                sx={{ minWidth: "30%" }}
              >
                Today
              </Button>
            )}

            <Button
              variant="outlined"
              onClick={goToNextDate}
              disabled={!hasNext}
              endIcon={
                <Box component="span" sx={{ fontSize: "1.5rem" }}>
                  →
                </Box>
              }
              sx={{ minWidth: hasToday ? "30%" : "40%" }}
            >
              Next Date
            </Button>
          </Box>
        </Box>

        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Student</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold" }}>
                  {formatDisplayDate(selectedDate)}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {classData.signups
                .filter((signup) => !signup.isWaitlisted)
                .map((signup, index) => {
                  // Combine name fields for display
                  const studentName = nameFields
                    .map((field) => signup[field.key] || "")
                    .filter(Boolean)
                    .join(" ");

                  return (
                    <TableRow key={index}>
                      <TableCell>{studentName}</TableCell>
                      <TableCell align="center">
                        <Checkbox
                          checked={
                            localAttendance[signup.id]?.[selectedDate] || false
                          }
                          onChange={(e) =>
                            handleAttendanceChange(
                              signup.id,
                              selectedDate,
                              e.target.checked
                            )
                          }
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
      </>
    );
  };

  const renderDesktopView = () => {
    // Prepare a sorted list of signups by lastName (desktop only)
    const sortedSignups = classData.signups
      .filter((signup) => !signup.isWaitlisted)
      .slice() // clone
      .sort((a, b) => {
        const aLast = (a.lastName || "").toLowerCase();
        const bLast = (b.lastName || "").toLowerCase();
        if (aLast < bLast) return lastNameSort === "asc" ? -1 : 1;
        if (aLast > bLast) return lastNameSort === "asc" ? 1 : -1;
        // secondary sort by first name for stability
        const aFirst = (a.firstName || "").toLowerCase();
        const bFirst = (b.firstName || "").toLowerCase();
        if (aFirst < bFirst) return -1;
        if (aFirst > bFirst) return 1;
        return 0;
      });

    const toggleLastNameSort = () => {
      setLastNameSort((prev) => (prev === "asc" ? "desc" : "asc"));
    };

    return (
      <TableContainer
        component={Paper}
        sx={{
          mt: 4,
          overflowX: "auto",
          "& .MuiTableCell-root": {
            whiteSpace: "nowrap",
          },
        }}
      >
        <Table
          sx={{
            minWidth: 650,
            "& .sticky-column": {
              position: "sticky",
              left: 0,
              background: "white",
              zIndex: 1,
              borderRight: "1px solid rgba(224, 224, 224, 1)",
              "&:after": {
                content: '""',
                position: "absolute",
                right: 0,
                top: 0,
                bottom: 0,
                width: 1,
              },
            },
            "& .sticky-column-1": {
              left: 200,
            },
            "& .sticky-column-2": {
              left: 400,
            },
          }}
        >
          <TableHead>
            <TableRow>
              {nameFields.map((field, index) => (
                <TableCell
                  key={field.key}
                  sx={{
                    minWidth: 200,
                  }}
                  className={`sticky-column ${
                    index > 0 ? `sticky-column-${index}` : ""
                  }`}
                ></TableCell>
              ))}
              {dates.map((date) => (
                <TableCell key={date} align="center" sx={{ minWidth: 100 }}>
                  {moment(date).format("dddd")}
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              {nameFields.map((field, index) => (
                <TableCell
                  key={field.key}
                  sx={{
                    minWidth: 200,
                  }}
                  className={`sticky-column ${
                    index > 0 ? `sticky-column-${index}` : ""
                  }`}
                  rowSpan={2}
                >
                  {field.key === "lastName" ? (
                    <TableSortLabel
                      active
                      direction={lastNameSort}
                      onClick={toggleLastNameSort}
                      sx={{ userSelect: "none" }}
                    >
                      {field.label}
                    </TableSortLabel>
                  ) : (
                    field.label
                  )}
                </TableCell>
              ))}
              {dates.map((date) => {
                const [year, month, day] = date.split("-");
                const isToday = date === moment().format("YYYY-MM-DD");
                return (
                  <TableCell
                    key={date}
                    align="center"
                    sx={{
                      minWidth: 100,
                      ...(isToday && {
                        fontWeight: "bold",
                        bgcolor: "rgba(25, 118, 210, 0.08)",
                      }),
                    }}
                  >
                    {`${month}/${day}/${year.slice(-2)}`}
                    {isToday && (
                      <Typography
                        component="span"
                        sx={{
                          ml: 1,
                          fontSize: "0.75rem",
                          color: "primary.main",
                        }}
                      >
                        (Today)
                      </Typography>
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedSignups.map((signup, index) => (
              <TableRow key={index}>
                {nameFields.map((field, fieldIndex) => (
                  <TableCell
                    key={field.key}
                    className={`sticky-column ${
                      fieldIndex > 0 ? `sticky-column-${fieldIndex}` : ""
                    }`}
                  >
                    {signup[field.key] || ""}
                  </TableCell>
                ))}
                {dates.map((date) => (
                  <TableCell
                    key={date}
                    align="center"
                    sx={{
                      ...(date === moment().format("YYYY-MM-DD") && {
                        bgcolor: "rgba(25, 118, 210, 0.08)",
                      }),
                    }}
                  >
                    <Checkbox
                      checked={localAttendance[signup.id]?.[date] || false}
                      onChange={(e) =>
                        handleAttendanceChange(
                          signup.id,
                          date,
                          e.target.checked
                        )
                      }
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderContent = () => {
    if (!classData) {
      return null;
    }

    if (!classData.signups?.length) {
      return (
        <div className="text-center mt-4 text-lg font-medium">
          No signups yet for {classData.title}.
        </div>
      );
    }

    return (
      <Box
        sx={{
          position: "relative",
        }}
      >
        <Typography variant="h6" sx={{ mt: 4 }}>
          Attendance Table
        </Typography>

        <JsonViewer data={localAttendance} />

        <ExportButton
          classData={classData}
          dates={dates}
          nameFields={nameFields}
          localAttendance={localAttendance}
        />

        {isMobile
          ? renderMobileView()
          : isTablet
          ? renderTabletView()
          : renderDesktopView()}
      </Box>
    );
  };

  return (
    <>
      <Dialog
        open={show}
        onClose={handleClose}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: {
            p: isMobile ? 1 : 2,
            m: isMobile ? 1 : "auto",
            width: isMobile ? "calc(100% - 16px)" : undefined,
            maxHeight: isMobile ? "calc(100% - 16px)" : undefined,
          },
        }}
      >
        <DialogTitle sx={{ p: isMobile ? 2 : 3 }}>
          {classData?.title} Class Roll
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: "absolute",
              right: isMobile ? 4 : 8,
              top: isMobile ? 4 : 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <Box p={isMobile ? 1 : 2}>
          {classData && <ClassPreview classData={classData} noBanner />}
          <Divider sx={{ my: 2 }} />
          {renderContent()}
        </Box>
      </Dialog>

      <Snackbar
        open={isSaving}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{ top: "24px !important" }}
      >
        <Alert
          severity="info"
          sx={{
            bgcolor: "primary.main",
            color: "white",
            "& .MuiAlert-icon": {
              color: "white",
            },
          }}
        >
          Saving Attendance...
        </Alert>
      </Snackbar>
    </>
  );
}

const ExportButton = ({ classData, dates, nameFields, localAttendance }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleExport = () => {
    // Generate CSV headers
    const headers = [
      ...nameFields.map((field) => field.label),
      ...dates.map((date) => {
        const [year, month, day] = date.split("-");
        return `${month}/${day}/${year.slice(-2)}`;
      }),
    ];

    // Generate CSV rows
    const rows = classData.signups.map((signup) => {
      const nameValues = nameFields.map((field) => signup[field.key] || "");
      const attendanceValues = dates.map((date) =>
        localAttendance[signup.id]?.[date] ? "X" : ""
      );
      return [...nameValues, ...attendanceValues];
    });

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // Create and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${classData.title}_attendance.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button
      onClick={handleExport}
      variant="outlined"
      size={isMobile ? "small" : "medium"}
      sx={{
        position: "absolute",
        top: -8,
        right: 8,
        fontSize: isMobile ? "0.75rem" : undefined,
      }}
    >
      <Download className={isMobile ? "w-3 h-3 mr-1" : "w-4 h-4 mr-2"} />
      <span>{isMobile ? "Export" : "Export to CSV"}</span>
    </Button>
  );
};
