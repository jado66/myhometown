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
  Button,
} from "@mui/material";
import { toast } from "react-toastify";
import Close from "@mui/icons-material/Close";
import ClassPreview from "@/components/class-signups/stepper-components/ClassPreview";
import { useAttendance } from "@/hooks/use-attendance";
import JsonViewer from "@/components/util/debug/DebugOutput";
import { Download } from "@mui/icons-material";

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
      <Box sx={{ position: "relative" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexDirection: { xs: "column", sm: "row" },
            mb: 2,
          }}
        >
          <Typography variant="h6" sx={{ mt: 4 }}>
            Attendance Table
          </Typography>
          <ExportButton
            classData={classData}
            dates={dates}
            nameFields={nameFields}
            localAttendance={localAttendance}
          />
        </Box>

        <TableContainer
          component={Paper}
          sx={{
            mt: 2,
            maxHeight: { xs: "70vh", sm: "80vh" },
            overflowX: "auto",
            overflowY: "auto",
            "& .MuiTableCell-root": {
              whiteSpace: "nowrap",
              padding: { xs: "4px", sm: "8px" },
              borderRight: "1px solid rgba(224, 224, 224, 1)",
            },
          }}
        >
          <Table
            sx={{
              minWidth: { xs: "auto", sm: 650 },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    minWidth: { xs: 120, sm: 200 },
                    fontSize: { xs: "0.8rem", sm: "1rem" },
                    position: "sticky",
                    left: 0,
                    background: "white",
                    zIndex: 2,
                  }}
                >
                  Name
                </TableCell>
                {dates.map((date, index) => (
                  <TableCell
                    key={date}
                    align="center"
                    sx={{
                      minWidth: { xs: 60, sm: 80 },
                      fontSize: { xs: "0.7rem", sm: "1rem" },
                      position: "sticky",
                      right: {
                        xs: (dates.length - index - 1) * 60,
                        sm: (dates.length - index - 1) * 80,
                      },
                      background: "white",
                      zIndex: 1,
                    }}
                  >
                    {moment(date).format("ddd")}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell
                  sx={{
                    minWidth: { xs: 120, sm: 200 },
                    fontSize: { xs: "0.8rem", sm: "1rem" },
                    position: "sticky",
                    left: 0,
                    background: "white",
                    zIndex: 2,
                  }}
                >
                  {/* Empty cell for alignment */}
                </TableCell>
                {dates.map((date, index) => {
                  const [year, month, day] = date.split("-");
                  return (
                    <TableCell
                      key={date}
                      align="center"
                      sx={{
                        minWidth: { xs: 60, sm: 80 },
                        fontSize: { xs: "0.7rem", sm: "1rem" },
                        position: "sticky",
                        right: {
                          xs: (dates.length - index - 1) * 60,
                          sm: (dates.length - index - 1) * 80,
                        },
                        background: "white",
                        zIndex: 1,
                      }}
                    >
                      {`${month}/${day}`}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>
            <TableBody>
              {classData.signups.map((signup, index) => (
                <TableRow key={index}>
                  <TableCell
                    sx={{
                      fontSize: { xs: "0.8rem", sm: "1rem" },
                      position: "sticky",
                      left: 0,
                      background: "white",
                      zIndex: 2,
                    }}
                  >
                    {`${signup.firstName || ""} ${
                      signup.lastName || ""
                    }`.trim()}
                  </TableCell>
                  {dates.map((date, dateIndex) => (
                    <TableCell
                      key={date}
                      align="center"
                      sx={{
                        minWidth: { xs: 60, sm: 80 },
                        position: "sticky",
                        right: {
                          xs: (dates.length - dateIndex - 1) * 60,
                          sm: (dates.length - dateIndex - 1) * 80,
                        },
                        background: "white",
                        zIndex: 1,
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
                        size="small"
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  return (
    <>
      return (
      <Dialog
        open={show}
        onClose={handleClose}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: {
            p: { xs: 1, sm: 2 }, // Reduced padding on mobile
            m: { xs: 0, sm: "auto" }, // Remove margins on mobile
            width: { xs: "100%", sm: "auto" }, // Full width on mobile
            height: { xs: "100%", sm: "auto" }, // Full height on mobile
          },
        }}
      >
        <DialogTitle sx={{ p: { xs: 1, sm: 2 } }}>
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
        <Box p={{ xs: 1, sm: 2 }}>
          {classData && <ClassPreview classData={classData} noBanner />}
          <Divider sx={{ my: { xs: 1, sm: 2 } }} />
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
      sx={{
        position: "absolute",
        top: -8,
        right: 8,
      }}
    >
      <Download className="w-4 h-4" />
      <span>Export to CSV</span>
    </Button>
  );
};
