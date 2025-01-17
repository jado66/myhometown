import React, { useState, useEffect, useCallback } from "react";
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
} from "@mui/material";
import { toast } from "react-toastify";
import Close from "@mui/icons-material/Close";
import ClassPreview from "@/components/class-signups/stepper-components/ClassPreview";
import { useAttendance } from "@/hooks/use-attendance";

export default function ClassRollTable({ classData, show, onClose }) {
  const [saveTimeout, setSaveTimeout] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [localAttendance, setLocalAttendance] = useState({});
  const { markBulkAttendance } = useAttendance();
  const [isDirty, setIsDirty] = useState(false);

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
    if (!classData?.startDate || !classData?.endDate || !classData?.meetings) {
      return [];
    }

    const dates = [];
    let currentDate = new Date(classData.startDate);
    const endDateTime = new Date(classData.endDate);

    while (currentDate <= endDateTime) {
      const dayOfWeek = currentDate.toLocaleDateString("en-US", {
        weekday: "long",
      });
      const matchingMeetings = classData.meetings.filter(
        (meeting) => meeting.day === dayOfWeek
      );

      if (matchingMeetings.length > 0) {
        dates.push(currentDate.toISOString().split("T")[0]);
      }

      currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
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
      <>
        <Typography variant="h6" sx={{ mt: 4 }}>
          Attendance Table
        </Typography>
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
                    {field.label}
                  </TableCell>
                ))}
                {dates.map((date) => (
                  <TableCell key={date} align="center" sx={{ minWidth: 100 }}>
                    {moment(date).format("DD/MM/YY")}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {classData.signups.map((signup, index) => (
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
                    <TableCell key={date} align="center">
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
      </>
    );
  };

  return (
    <>
      <Dialog
        open={show}
        onClose={handleClose}
        maxWidth="xl"
        fullWidth
        PaperProps={{ sx: { p: 2 } }}
      >
        <DialogTitle>
          {classData?.title} Class Roll
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <Box p={2}>
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
