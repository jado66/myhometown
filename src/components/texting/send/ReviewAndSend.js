import React, { useState, useCallback, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Send,
  Warning,
  Schedule,
  CalendarMonth,
  AccessTime,
  Check,
} from "@mui/icons-material";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import RecipientsList from "./RecipientsList";
import MediaPreview from "./MediaPreview";
import { useScheduledTexts } from "@/hooks/communications/useScheduledTexts";
import moment from "moment";
import DevEnvGuard from "@/guards/dev-env-guard";

const ReviewAndSend = ({
  selectedRecipients,
  allContacts,
  message,
  mediaFiles,
  onSend,
  hasSent,
  isSending,
  onNewMessage,
  user,
  expandGroups, // Function to expand groups for display purposes
  onScheduled, // New prop to notify parent when message is scheduled
}) => {
  const { scheduleText, loading: schedulingLoading } = useScheduledTexts();
  const [sendOption, setSendOption] = useState("now");
  const [dialogOpen, setDialogOpen] = useState(false);

  // Initialize with moment objects instead of date-fns
  const [scheduleDate, setScheduleDate] = useState(moment().add(1, "days"));
  const [scheduleTime, setScheduleTime] = useState(moment().hour(9).minute(0));
  const [schedulingSuccess, setSchedulingSuccess] = useState(false);

  const handleSendOptionChange = (event) => {
    setSendOption(event.target.value);
  };

  const openScheduleDialog = () => {
    setDialogOpen(true);
  };

  const closeScheduleDialog = () => {
    setDialogOpen(false);
    setSchedulingSuccess(false);
  };

  const isValidSchedule = () => {
    const now = moment();
    // Create a combined date and time moment
    const combinedDateTime = moment(scheduleDate);
    combinedDateTime.hour(scheduleTime.hour());
    combinedDateTime.minute(scheduleTime.minute());
    combinedDateTime.second(0);

    return combinedDateTime.isAfter(now);
  };

  const handleSchedule = async () => {
    if (!isValidSchedule()) {
      console.log("Invalid schedule");
      return;
    }

    // Combine date and time for scheduling using moment
    const scheduledDateTime = moment(scheduleDate);
    scheduledDateTime.hour(scheduleTime.hour());
    scheduledDateTime.minute(scheduleTime.minute());
    scheduledDateTime.second(0);

    const mediaUrls = mediaFiles.map((file) => file.url);

    // Expand groups to get individual recipients for scheduling
    const expandedRecipients = expandGroups
      ? expandGroups(selectedRecipients, allContacts).flatMap(
          (group) => group.contacts
        )
      : selectedRecipients;

    // Remove duplicates by phone number
    const phoneNumberMap = new Map();
    const uniqueRecipients = [];

    expandedRecipients.forEach((recipient) => {
      const phone = recipient.value || recipient.phone;
      if (!phoneNumberMap.has(phone)) {
        phoneNumberMap.set(phone, true);
        uniqueRecipients.push(recipient);
      }
    });

    // Pass both original selectedRecipients (with groups) and expanded recipients
    // Create a combined array where we include group info from selectedRecipients
    // and individual recipient info from uniqueRecipients
    const recipientsForScheduling = [
      // Include original group selections
      ...selectedRecipients.filter(
        (r) => r.value && r.value.startsWith("group:")
      ),
      // Include unique individual recipients
      ...uniqueRecipients,
    ];

    const result = await scheduleText(
      message,
      recipientsForScheduling, // This now includes both groups and individuals
      scheduledDateTime.toDate(), // Convert to JS Date for the API
      mediaUrls,
      user
    );

    if (!result.error) {
      setSchedulingSuccess(true);
      // Notify parent component that the message was successfully scheduled
      if (onScheduled) {
        onScheduled();
      }
    }
  };

  // Calculate the display count for UI (expanded recipients)
  const getDisplayRecipientCount = () => {
    if (expandGroups) {
      const expandedRecipients = expandGroups(
        selectedRecipients,
        allContacts
      ).flatMap((group) => group.contacts);
      const phoneNumberMap = new Map();
      const uniqueCount = expandedRecipients.filter((recipient) => {
        const phone = recipient.value || recipient.phone;
        if (phoneNumberMap.has(phone)) {
          return false;
        }
        phoneNumberMap.set(phone, true);
        return true;
      }).length;
      return uniqueCount;
    }
    return selectedRecipients.length;
  };

  return (
    <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom textAlign="center">
        Review and Send
      </Typography>
      <Typography variant="body1" gutterBottom>
        Selected Recipients:
      </Typography>
      <Paper elevation={1} sx={{ p: 2, mb: 2, backgroundColor: "grey.100" }}>
        <RecipientsList
          selectedRecipients={selectedRecipients}
          contacts={allContacts}
        />
      </Paper>
      <Typography variant="body1" gutterBottom>
        Message:
      </Typography>
      <Paper elevation={1} sx={{ p: 2, mb: 2, backgroundColor: "grey.100" }}>
        <Typography sx={{ display: "flex" }}>
          {message?.trim() || (
            <>
              <Warning sx={{ mr: 2 }} />
              No message provided
            </>
          )}
        </Typography>
      </Paper>
      {mediaFiles.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" gutterBottom>
            Attachments:
          </Typography>
          <MediaPreview files={mediaFiles} showRemove={false} />
        </Box>
      )}

      {!hasSent && (
        <FormControl component="fieldset" sx={{ mt: 2, mb: 2 }}>
          <RadioGroup
            aria-label="send-options"
            name="send-options"
            value={sendOption}
            onChange={handleSendOptionChange}
            row
          >
            <FormControlLabel
              value="now"
              control={<Radio />}
              label="Send Now"
            />

            <FormControlLabel
              value="schedule"
              control={<Radio />}
              label="Schedule for Later"
            />
          </RadioGroup>
        </FormControl>
      )}

      {!hasSent && sendOption === "now" && (
        <Button
          variant="contained"
          color="primary"
          onClick={onSend}
          startIcon={<Send />}
          disabled={isSending}
          sx={{ mt: 1 }}
        >
          {isSending ? "Sending..." : "Send Now"}
        </Button>
      )}

      {!hasSent && sendOption === "schedule" && (
        <Button
          variant="contained"
          color="secondary"
          onClick={openScheduleDialog}
          startIcon={<Schedule />}
          sx={{ mt: 1 }}
        >
          Schedule Message
        </Button>
      )}

      {hasSent && (
        <Button
          variant="outlined"
          color="primary"
          onClick={onNewMessage}
          sx={{ ml: 2 }}
        >
          Send Another Message
        </Button>
      )}

      {/* Schedule Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={closeScheduleDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <Schedule sx={{ mr: 1 }} />
            Schedule Message
          </Box>
        </DialogTitle>
        <DialogContent>
          {schedulingSuccess ? (
            <Box sx={{ py: 2, textAlign: "center" }}>
              <Check
                color="success"
                fontSize="large"
                sx={{ fontSize: 64, mb: 2 }}
              />
              <Typography variant="h6" gutterBottom>
                Message Scheduled Successfully
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Your message has been scheduled for:
              </Typography>
              <Typography variant="body1" fontWeight="bold" sx={{ my: 1 }}>
                {scheduleDate.format("MMMM D, YYYY")} at{" "}
                {scheduleTime.format("h:mm A")}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                You can view and manage your scheduled messages in the
                "Scheduled Messages" section.
              </Typography>
            </Box>
          ) : (
            <LocalizationProvider dateAdapter={AdapterMoment}>
              <Stack spacing={3} sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Select when you want this message to be sent:
                </Typography>

                <DatePicker
                  label="Date"
                  value={scheduleDate}
                  onChange={setScheduleDate}
                  minDate={moment()}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <>
                            <CalendarMonth color="action" sx={{ mr: 1 }} />
                            {params.InputProps.startAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />

                <TimePicker
                  label="Time"
                  value={scheduleTime}
                  onChange={(newTime) => {
                    setScheduleTime(newTime); // Update local state immediately for responsive UI
                  }}
                  style={{ marginBottom: "0px" }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <>
                            <AccessTime color="action" sx={{ mr: 1 }} />
                            {params.InputProps.startAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />

                {!isValidSchedule() && (
                  <Alert severity="warning">
                    The selected time is in the past. Please select a future
                    date and time.
                  </Alert>
                )}

                <Typography variant="body2" color="text.secondary">
                  This message will be sent to {getDisplayRecipientCount()}{" "}
                  recipient(s) at the specified time.
                </Typography>
              </Stack>
            </LocalizationProvider>
          )}
        </DialogContent>
        <DialogActions>
          {schedulingSuccess ? (
            <Button onClick={closeScheduleDialog} color="primary">
              Close
            </Button>
          ) : (
            <>
              <Button onClick={closeScheduleDialog}>Cancel</Button>
              <Button
                onClick={handleSchedule}
                color="primary"
                variant="contained"
                disabled={!isValidSchedule() || schedulingLoading}
                startIcon={
                  schedulingLoading ? (
                    <CircularProgress size={20} />
                  ) : (
                    <Schedule />
                  )
                }
              >
                {schedulingLoading ? "Scheduling..." : "Schedule"}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ReviewAndSend;
