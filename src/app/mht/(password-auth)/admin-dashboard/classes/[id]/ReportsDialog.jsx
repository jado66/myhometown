import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Paper,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Radio,
  RadioGroup,
  FormControlLabel,
  Divider,
  Tooltip,
} from "@mui/material";
import {
  Close,
  FileDownload,
  PeopleAlt,
  EventNote,
  Timeline,
  Info,
  Group,
  School,
  AssignmentInd,
} from "@mui/icons-material";

import {
  downloadCSV,
  generateDetailedCSV,
  generateCapacityReportCSV,
  generateStudentAttendanceReportCSV,
} from "@/util/reports/classes/report-helper-functions";

const handleGenerateAttendanceReport = (semester) => {
  // Generate safe filename from semester title
  const safeTitle = semester.title.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  const fileName = `${safeTitle}_attendance_report_${
    new Date().toISOString().split("T")[0]
  }.csv`;

  // Generate and download the CSV with detailed attendance statistics
  const csvContent = generateDetailedCSV(semester);
  downloadCSV(csvContent, fileName);
};

const handleGenerateCapacityReport = (semester) => {
  const csvContent = generateCapacityReportCSV(semester);
  const today = new Date();
  const dateStr = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  downloadCSV(csvContent, `capacity-report-${dateStr}.csv`);
};

const handleGenerateStudentAttendanceReport = (semester) => {
  // Generate safe filename from semester title
  const safeTitle = semester.title.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  const fileName = `${safeTitle}_student_attendance_${
    new Date().toISOString().split("T")[0]
  }.csv`;

  // Generate and download the CSV with student attendance data
  const csvContent = generateStudentAttendanceReportCSV(semester);
  downloadCSV(csvContent, fileName);
};

/**
 * A dialog component that offers different types of reports to download
 * @param {boolean} open - Controls dialog visibility
 * @param {function} onClose - Function to call when dialog is closed
 * @param {Object} semester - The semester data to generate reports from
 */
export const ReportsDialog = ({ open, onClose, semester }) => {
  const [selectedReport, setSelectedReport] = useState("attendance");

  const handleReportChange = (event) => {
    setSelectedReport(event.target.value);
  };

  const handleGenerateReport = (e) => {
    e.stopPropagation(); // Prevent accordion from toggling

    switch (selectedReport) {
      case "attendance":
        handleGenerateAttendanceReport(semester);
        break;
      case "capacity":
        handleGenerateCapacityReport(semester);
        break;
      case "studentAttendance":
        handleGenerateStudentAttendanceReport(semester);
        break;
      case "schedule":
        handleGenerateAttendanceReport(semester);
        break;
      default:
        // Default to attendance report
        handleGenerateAttendanceReport(semester);
    }
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: "primary.main",
          color: "primary.contrastText",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          py: 2,
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <FileDownload />
          <Typography variant="h6">
            Generate Reports for {semester?.title || "Semester"}
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{ color: "primary.contrastText" }}
          size="small"
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ py: 3 }}>
        <Typography variant="body1" paragraph sx={{ mt: 2 }}>
          Select the type of report you want to generate. The report will be
          downloaded as a CSV file that can be opened in Excel or other
          spreadsheet applications.
        </Typography>

        <RadioGroup value={selectedReport} onChange={handleReportChange}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Attendance Report Option */}
            <Grid item xs={12}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  border: selectedReport === "attendance" ? 2 : 1,
                  borderColor:
                    selectedReport === "attendance"
                      ? "primary.main"
                      : "divider",
                  transition: "all 0.2s",
                  "&:hover": {
                    borderColor: "primary.main",
                    boxShadow: 1,
                  },
                }}
              >
                <FormControlLabel
                  value="attendance"
                  control={<Radio color="primary" />}
                  label={
                    <Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <School color="primary" />
                        <Typography variant="h6" color="primary">
                          Attendance Report
                        </Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                      >
                        Generates a comprehensive report showing attendance
                        statistics for each class. Includes total students
                        enrolled, students who attended at least once, total
                        class days, and overall attendance percentages.
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          component="span"
                        >
                          Ideal for:
                        </Typography>
                        <Typography
                          variant="body2"
                          component="span"
                          sx={{ ml: 1 }}
                        >
                          Analyzing class engagement and attendance patterns
                        </Typography>
                      </Box>
                    </Box>
                  }
                  sx={{ alignItems: "flex-start", m: 0 }}
                />
              </Paper>
            </Grid>

            {/* Student Attendance Report Option */}
            <Grid item xs={12}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  border: selectedReport === "studentAttendance" ? 2 : 1,
                  borderColor:
                    selectedReport === "studentAttendance"
                      ? "primary.main"
                      : "divider",
                  transition: "all 0.2s",
                  "&:hover": {
                    borderColor: "primary.main",
                    boxShadow: 1,
                  },
                }}
              >
                <FormControlLabel
                  value="studentAttendance"
                  control={<Radio color="primary" />}
                  label={
                    <Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <AssignmentInd color="primary" />
                        <Typography variant="h6" color="primary">
                          Student Attendance Report
                        </Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                      >
                        Provides a detailed list of all students with their
                        individual attendance records for each class session.
                        Shows which students attended which classes, with
                        contact information and attendance percentages for each
                        student.
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          component="span"
                        >
                          Ideal for:
                        </Typography>
                        <Typography
                          variant="body2"
                          component="span"
                          sx={{ ml: 1 }}
                        >
                          Tracking individual student participation and
                          following up with absent students
                        </Typography>
                      </Box>
                    </Box>
                  }
                  sx={{ alignItems: "flex-start", m: 0 }}
                />
              </Paper>
            </Grid>

            {/* Capacity Report Option */}
            <Grid item xs={12}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  border: selectedReport === "capacity" ? 2 : 1,
                  borderColor:
                    selectedReport === "capacity" ? "primary.main" : "divider",
                  transition: "all 0.2s",
                  "&:hover": {
                    borderColor: "primary.main",
                    boxShadow: 1,
                  },
                }}
              >
                <FormControlLabel
                  value="capacity"
                  control={<Radio color="primary" />}
                  label={
                    <Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Group color="primary" />
                        <Typography variant="h6" color="primary">
                          CRC Capacity Report
                        </Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                      >
                        Generates a comprehensive report showing daily
                        attendance across all classes. Includes a breakdown of
                        student counts by class for each day, day of the week,
                        and overall totals to resource center capacity.
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          component="span"
                        >
                          Ideal for:
                        </Typography>
                        <Typography
                          variant="body2"
                          component="span"
                          sx={{ ml: 1 }}
                        >
                          Planning staffing needs and managing resource center
                          capacity limits
                        </Typography>
                      </Box>
                    </Box>
                  }
                  sx={{ alignItems: "flex-start", m: 0 }}
                />
              </Paper>
            </Grid>
          </Grid>
        </RadioGroup>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={handleGenerateReport}
          variant="contained"
          color="primary"
          startIcon={<FileDownload />}
        >
          Download Report
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReportsDialog;
