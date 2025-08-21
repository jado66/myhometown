// TransferDialog.jsx
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Alert,
  CircularProgress,
  ListSubheader,
  FormControlLabel,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

// Helper functions for text preview
const formatTime = (time24) => {
  try {
    const [hours24, minutes] = time24
      .split(":")
      .map((num) => parseInt(num, 10));
    let period = hours24 >= 12 ? "pm" : "am";
    let hours12 = hours24 % 12;
    hours12 = hours12 === 0 ? 12 : hours12;
    return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
  } catch (error) {
    return time24;
  }
};

const formatMeetingTimes = (meetings) => {
  if (!meetings || meetings.length === 0) return "Time not specified";

  if (meetings.length === 1) {
    const meeting = meetings[0];
    return `${meeting.day}s ${formatTime(meeting.startTime)} - ${formatTime(
      meeting.endTime
    )}`;
  }

  return meetings
    .map(
      (meeting) =>
        `${meeting.day}s ${formatTime(meeting.startTime)} - ${formatTime(
          meeting.endTime
        )}`
    )
    .join("\n");
};

const generateTransferText = (firstName, targetClass) => {
  if (!targetClass) return "";

  const startDate = new Date(targetClass.startDate).toLocaleDateString();
  const endDate = targetClass.endDate
    ? new Date(targetClass.endDate).toLocaleDateString()
    : startDate;
  const dateRange =
    startDate === endDate ? startDate : `${startDate} - ${endDate}`;
  const meetingSchedule = formatMeetingTimes(targetClass.meetings);

  return `Hello ${firstName}, You have been enrolled in ${targetClass.title}.

Class Details:
Date: ${dateRange}
Schedule:
${meetingSchedule}
Location: ${targetClass.location}

We look forward to seeing you in your new class!

Best Regards,
myHometown`;
};

const TransferDialog = ({
  open,
  onClose,
  studentToTransfer,
  classData,
  classesForTransfer,
  selectedTargetClass,
  setSelectedTargetClass,
  onConfirm,
  transferLoading,
  loadingClasses,
  cleanedSemesters,
  sendTextNotification = true,
  setSendTextNotification,
}) => {
  // Debug logging
  console.log("TransferDialog - cleanedSemesters:", cleanedSemesters);
  console.log("TransferDialog - classesForTransfer:", classesForTransfer);

  // Get target class data for text preview
  const targetClass = selectedTargetClass
    ? classesForTransfer.find((c) => c.id === selectedTargetClass)
    : null;

  // Generate text preview
  const textPreview =
    targetClass && studentToTransfer
      ? generateTransferText(studentToTransfer.firstName, targetClass)
      : "";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Transfer Student to Another Class</DialogTitle>
      <DialogContent>
        {studentToTransfer && (
          <>
            <Typography sx={{ mb: 2 }}>
              Transfer{" "}
              <strong>
                {studentToTransfer.firstName} {studentToTransfer.lastName}
              </strong>{" "}
              {/* ListSubheader removed, this was a stray text */}
              from <strong>{classData.title}</strong> to:
            </Typography>

            {loadingClasses ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <FormControl fullWidth>
                <InputLabel>Select Target Class</InputLabel>
                <Select
                  value={selectedTargetClass}
                  onChange={(e) => setSelectedTargetClass(e.target.value)}
                  label="Select Target Class"
                >
                  {classesForTransfer.length === 0 ? (
                    <MenuItem disabled>No other classes available</MenuItem>
                  ) : cleanedSemesters && cleanedSemesters.length > 0 ? (
                    // Render organized by semesters and sections
                    cleanedSemesters
                      .map((semester) => [
                        <ListSubheader
                          key={`semester-${semester.id}`}
                          sx={{ fontWeight: "bold", color: "primary.main" }}
                        >
                          {semester.title}
                        </ListSubheader>,
                        ...semester.sections
                          .map((section) => [
                            <ListSubheader
                              key={`section-${section.id}`}
                              sx={{
                                pl: 3,
                                fontSize: "0.9em",
                                color: "text.secondary",
                              }}
                            >
                              {section.title}
                            </ListSubheader>,
                            ...section.classes
                              .map((cls) => {
                                // Find the full class data from classesForTransfer
                                const fullClassData = classesForTransfer.find(
                                  (c) => c.id === cls.id
                                );
                                if (!fullClassData) return null;

                                const enrolled =
                                  fullClassData.signups?.filter(
                                    (s) => !s.isWaitlisted
                                  ).length || 0;
                                const waitlisted =
                                  fullClassData.signups?.filter(
                                    (s) => s.isWaitlisted
                                  ).length || 0;
                                const capacity =
                                  parseInt(fullClassData.capacity) || 0;
                                const waitlistCapacity =
                                  parseInt(fullClassData.waitlistCapacity) || 0;
                                const isFull = enrolled >= capacity;
                                const isWaitlistFull =
                                  fullClassData.isWaitlistEnabled &&
                                  waitlisted >= waitlistCapacity;
                                const isCompletelyFull =
                                  isFull &&
                                  (!fullClassData.isWaitlistEnabled ||
                                    isWaitlistFull);

                                return (
                                  <MenuItem
                                    key={cls.id}
                                    value={cls.id}
                                    disabled={isCompletelyFull}
                                    sx={{ pl: 5 }}
                                  >
                                    <Box
                                      sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        width: "100%",
                                      }}
                                    >
                                      <Typography>{cls.title}</Typography>
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                      >
                                        {enrolled}/{capacity} enrolled
                                        {fullClassData.isWaitlistEnabled &&
                                          ` • ${waitlisted}/${waitlistCapacity} waitlisted`}
                                        {isCompletelyFull && " • FULL"}
                                        {isFull &&
                                          !isCompletelyFull &&
                                          fullClassData.isWaitlistEnabled &&
                                          " • Will be waitlisted"}
                                      </Typography>
                                    </Box>
                                  </MenuItem>
                                );
                              })
                              .filter(Boolean),
                          ])
                          .flat(),
                      ])
                      .flat()
                  ) : (
                    // Fallback to flat list if cleanedSemesters is not available
                    classesForTransfer.map((cls) => {
                      const enrolled =
                        cls.signups?.filter((s) => !s.isWaitlisted).length || 0;
                      const waitlisted =
                        cls.signups?.filter((s) => s.isWaitlisted).length || 0;
                      const capacity = parseInt(cls.capacity) || 0;
                      const waitlistCapacity =
                        parseInt(cls.waitlistCapacity) || 0;
                      const isFull = enrolled >= capacity;
                      const isWaitlistFull =
                        cls.isWaitlistEnabled && waitlisted >= waitlistCapacity;
                      const isCompletelyFull =
                        isFull && (!cls.isWaitlistEnabled || isWaitlistFull);

                      return (
                        <MenuItem
                          key={cls.id}
                          value={cls.id}
                          disabled={isCompletelyFull}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              width: "100%",
                            }}
                          >
                            <Typography>{cls.title}</Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {enrolled}/{capacity} enrolled
                              {cls.isWaitlistEnabled &&
                                ` • ${waitlisted}/${waitlistCapacity} waitlisted`}
                              {isCompletelyFull && " • FULL"}
                              {isFull &&
                                !isCompletelyFull &&
                                cls.isWaitlistEnabled &&
                                " • Will be waitlisted"}
                            </Typography>
                          </Box>
                        </MenuItem>
                      );
                    })
                  )}
                </Select>
              </FormControl>
            )}

            {selectedTargetClass && (
              <>
                <Alert severity="info" sx={{ mt: 2 }}>
                  {(() => {
                    const targetClass = classesForTransfer.find(
                      (c) => c.id === selectedTargetClass
                    );
                    if (!targetClass) return null;

                    const enrolled =
                      targetClass.signups?.filter((s) => !s.isWaitlisted)
                        .length || 0;
                    const capacity = parseInt(targetClass.capacity) || 0;
                    const isFull = enrolled >= capacity;

                    if (isFull && targetClass.isWaitlistEnabled) {
                      return "Note: This student will be added to the waitlist as the class is at capacity.";
                    } else if (!isFull) {
                      return "This student will be enrolled directly into the class.";
                    }
                    return null;
                  })()}
                </Alert>

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={sendTextNotification}
                      onChange={(e) =>
                        setSendTextNotification(e.target.checked)
                      }
                      color="primary"
                    />
                  }
                  label="Send text notification to student"
                  sx={{ mt: 2 }}
                />

                {sendTextNotification && textPreview && (
                  <Accordion sx={{ mt: 2 }}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls="text-preview-content"
                      id="text-preview-header"
                    >
                      <Typography variant="subtitle2">
                        Text Message Preview
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          bgcolor: "grey.50",
                          fontFamily: "monospace",
                          whiteSpace: "pre-line",
                          fontSize: "0.875rem",
                          lineHeight: 1.4,
                        }}
                      >
                        {textPreview}
                      </Paper>
                    </AccordionDetails>
                  </Accordion>
                )}
              </>
            )}

            {selectedTargetClass && !sendTextNotification && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                The student will not receive a text notification about this
                transfer.
              </Alert>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={onConfirm}
          color="primary"
          variant="contained"
          disabled={transferLoading || !selectedTargetClass}
        >
          {transferLoading ? "Transferring..." : "Transfer Student"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TransferDialog;
