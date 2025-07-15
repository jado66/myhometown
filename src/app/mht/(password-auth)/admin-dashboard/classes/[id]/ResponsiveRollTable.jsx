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
import { ExportButton } from "./ExportButton";
import { DesktopRollTable } from "./DesktopRollTable";
import { MobileRollTable } from "./MobileRollTable";

export default function ResponsiveRollTable({ classData, show, onClose }) {
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
            maxHeight: "90vh", // Limit dialog height
            height: "auto",
            display: "flex",
            flexDirection: "column",
            overflow: "auto", // Prevent dialog from scrolling
          },
        }}
      >
        <DialogTitle sx={{ p: isMobile ? 2 : 3, flexShrink: 0 }}>
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
        <Box p={isMobile ? 1 : 2} sx={{ overflow: "auto", flexGrow: 1 }}>
          {classData && <ClassPreview classData={classData} noBanner />}
          <Divider sx={{ my: 2 }} />

          {!classData || !classData.signups?.length ? (
            <Typography variant="body1" sx={{ mt: 2 }} color="text.secondary">
              No students signed up for this class.
            </Typography>
          ) : (
            <Box
              sx={{
                position: "relative",
              }}
            >
              <Typography variant="h6" sx={{ mt: 4 }}>
                Attendance Table
              </Typography>

              <ExportButton
                isMobile={isMobile}
                theme={theme}
                classData={classData}
                dates={dates}
                nameFields={nameFields}
                localAttendance={localAttendance}
              />

              {isMobile ? (
                <MobileRollTable
                  classData={classData}
                  dates={dates}
                  nameFields={nameFields}
                  localAttendance={localAttendance}
                  handleAttendanceChange={handleAttendanceChange}
                />
              ) : (
                <DesktopRollTable
                  classData={classData}
                  dates={dates}
                  nameFields={nameFields}
                  localAttendance={localAttendance}
                  handleAttendanceChange={handleAttendanceChange}
                />
              )}
            </Box>
          )}
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
