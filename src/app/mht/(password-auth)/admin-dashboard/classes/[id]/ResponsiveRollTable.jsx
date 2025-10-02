"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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

  // Move these refs to the top level of the component
  const leftTableRef = useRef(null);
  const rightTableRef = useRef(null);

  const [saveTimeout, setSaveTimeout] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [localAttendance, setLocalAttendance] = useState({});
  const { markBulkAttendance } = useAttendance();
  const [isDirty, setIsDirty] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [todayDateIndex, setTodayDateIndex] = useState(-1);
  const [lastNameSort, setLastNameSort] = useState("asc");

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
    if (!date) return "";
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

    const handleLeftScroll = (event) => {
      const scrollTop = event.target.scrollTop;
      if (rightTableRef.current) {
        rightTableRef.current.scrollTop = scrollTop;
      }
    };

    const handleRightScroll = (event) => {
      const scrollTop = event.target.scrollTop;
      if (leftTableRef.current) {
        leftTableRef.current.scrollTop = scrollTop;
      }
    };

    const formatDisplayDate = (date) => {
      if (!date) return "";
      const [year, month, day] = date.split("-");
      return `${month}/${day}/${year.slice(-2)}`;
    };

    const namesTableWidth = Math.max(nameFields.length * 150, 300);

    return (
      <Box
        sx={{
          mt: 4,
          display: "flex",
          height: "500px",
          border: "1px solid #e0e0e0",
          borderRadius: 1,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            flexShrink: 0,
            borderRight: "2px solid #e0e0e0",
            width: namesTableWidth,
            backgroundColor: "#fafafa",
          }}
        >
          <TableContainer
            ref={leftTableRef}
            sx={{
              height: "100%",
              overflowY: "auto",
              overflowX: "hidden",
              "&::-webkit-scrollbar": {
                width: "8px",
              },
              "&::-webkit-scrollbar-track": {
                background: "#f1f1f1",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "#c1c1c1",
                borderRadius: "4px",
              },
            }}
            onScroll={handleLeftScroll}
          >
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {["First Name", "Last Name"].map((field) => (
                    <TableCell
                      key={field.key}
                      sx={{
                        minWidth: 140,
                        maxWidth: 180,
                        fontWeight: "bold",
                        bgcolor: "grey.100",
                        borderBottom: "2px solid #e0e0e0",
                        position: "sticky",
                        top: 0,
                        zIndex: 100,
                        height: "60px",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {field.key === "lastName" ? (
                        <TableSortLabel
                          active
                          direction={lastNameSort}
                          onClick={toggleLastNameSort}
                          sx={{ userSelect: "none" }}
                        >
                          {field}
                        </TableSortLabel>
                      ) : (
                        field
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedSignups.map((signup, index) => (
                  <TableRow
                    key={index}
                    sx={{
                      "&:nth-of-type(odd)": {
                        backgroundColor: "#f9f9f9",
                      },
                      "&:hover": {
                        backgroundColor: "#f0f0f0",
                      },
                    }}
                  >
                    {nameFields.map((field) => (
                      <TableCell
                        key={field.key}
                        sx={{
                          minWidth: 140,
                          maxWidth: 180,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          height: "53px",
                          padding: "8px 16px",
                          fontWeight: "500",
                        }}
                      >
                        {signup[field.key] || ""}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
          <TableContainer
            ref={rightTableRef}
            sx={{
              height: "100%",
              overflowY: "auto",
              overflowX: "auto",
              "&::-webkit-scrollbar": {
                width: "8px",
                height: "8px",
              },
              "&::-webkit-scrollbar-track": {
                background: "#f1f1f1",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "#c1c1c1",
                borderRadius: "4px",
              },
              "&::-webkit-scrollbar-corner": {
                background: "#f1f1f1",
              },
            }}
            onScroll={handleRightScroll}
          >
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {dates.map((date) => {
                    const isToday = date === moment().format("YYYY-MM-DD");
                    return (
                      <TableCell
                        key={date}
                        align="center"
                        sx={{
                          minWidth: 100,
                          maxWidth: 120,
                          fontWeight: "bold",
                          bgcolor: isToday
                            ? "rgba(25, 118, 210, 0.15)"
                            : "grey.50",
                          borderBottom: "2px solid #e0e0e0",
                          position: "sticky",
                          top: 0,
                          zIndex: 100,
                          height: "60px",
                          padding: "4px",
                        }}
                      >
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: "bold", fontSize: "0.75rem" }}
                          >
                            {moment(date).format("ddd")}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: isToday ? "primary.main" : "text.primary",
                              fontWeight: isToday ? "bold" : "normal",
                              fontSize: "0.7rem",
                            }}
                          >
                            {formatDisplayDate(date)}
                            {isToday && (
                              <Typography
                                component="div"
                                sx={{
                                  fontSize: "0.6rem",
                                  color: "primary.main",
                                  fontWeight: "bold",
                                  mt: 0.25,
                                }}
                              >
                                Today
                              </Typography>
                            )}
                          </Typography>
                        </Box>
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedSignups.map((signup, index) => (
                  <TableRow
                    key={index}
                    sx={{
                      "&:nth-of-type(odd)": {
                        backgroundColor: "#f9f9f9",
                      },
                      "&:hover": {
                        backgroundColor: "#f0f0f0",
                      },
                    }}
                  >
                    {dates.map((date) => {
                      const isToday = date === moment().format("YYYY-MM-DD");
                      return (
                        <TableCell
                          key={date}
                          align="center"
                          sx={{
                            bgcolor: isToday
                              ? "rgba(25, 118, 210, 0.08)"
                              : "inherit",
                            height: "53px",
                            padding: "4px",
                            minWidth: 100,
                            maxWidth: 120,
                          }}
                        >
                          <Checkbox
                            checked={
                              localAttendance[signup.id]?.[date] || false
                            }
                            onChange={(e) =>
                              handleAttendanceChange(
                                signup.id,
                                date,
                                e.target.checked
                              )
                            }
                            sx={{
                              padding: "4px",
                              "&:hover": {
                                backgroundColor: "rgba(25, 118, 210, 0.1)",
                              },
                            }}
                          />
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
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
