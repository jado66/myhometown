import React, { useEffect, useState, useCallback } from "react";
import moment from "moment";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Button,
  Divider,
  TextField,
  Checkbox,
  FormControlLabel,
  Grid,
  Typography,
  Card,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { DatePicker, DateTimePicker, TimePicker } from "@mui/x-date-pickers";

const parseRecurrenceRule = (rruleString) => {
  if (!rruleString) {
    return {
      pattern: RECURRENCE_PATTERNS.NONE,
      endDate: null,
      occurrences: null,
      weekdays: [],
      monthlyType: "dayOfMonth",
    };
  }

  try {
    const parts = rruleString.split(";").reduce((acc, part) => {
      const [key, value] = part.split("=");
      acc[key] = value;
      return acc;
    }, {});

    const pattern = parts.FREQ?.toLowerCase() || RECURRENCE_PATTERNS.NONE;
    let endDate = null;
    let occurrences = null;
    let weekdays = [];
    let monthlyType = "dayOfMonth";

    // Parse UNTIL date if present
    if (parts.UNTIL) {
      const untilStr = parts.UNTIL.replace("Z", "");
      endDate = moment(untilStr, "YYYYMMDDTHHmmss");
    }

    // Parse COUNT if present
    if (parts.COUNT) {
      occurrences = parseInt(parts.COUNT);
    }

    // Parse BYDAY for weekly/monthly recurrence
    if (parts.BYDAY) {
      if (pattern === RECURRENCE_PATTERNS.WEEKLY) {
        weekdays = parts.BYDAY.split(",");
      } else if (pattern === RECURRENCE_PATTERNS.MONTHLY) {
        monthlyType = "dayOfWeek";
      }
    }

    return {
      pattern,
      endDate,
      occurrences,
      weekdays,
      monthlyType,
    };
  } catch (error) {
    console.error("Error parsing recurrence rule:", error);
    return {
      pattern: RECURRENCE_PATTERNS.NONE,
      endDate: null,
      occurrences: null,
      weekdays: [],
      monthlyType: "dayOfMonth",
    };
  }
};

const RECURRENCE_PATTERNS = {
  NONE: "none",
  DAILY: "daily",
  WEEKLY: "weekly",
  MONTHLY: "monthly",
  YEARLY: "yearly",
};

const WEEKDAYS = [
  { value: "MO", label: "Monday" },
  { value: "TU", label: "Tuesday" },
  { value: "WE", label: "Wednesday" },
  { value: "TH", label: "Thursday" },
  { value: "FR", label: "Friday" },
  { value: "SA", label: "Saturday" },
  { value: "SU", label: "Sunday" },
];

export const EventDialog_NewEdit = ({
  onClose,
  show,
  event = {},
  onSave,
  isEdit,
  communityId,
  onDelete,
}) => {
  const [currentEvent, setCurrentEvent] = useState(event);
  const [errors, setErrors] = useState({});
  const [recurrencePattern, setRecurrencePattern] = useState(
    RECURRENCE_PATTERNS.NONE
  );
  const [recurrenceEndDate, setRecurrenceEndDate] = useState(null);
  const [selectedWeekdays, setSelectedWeekdays] = useState([]);
  const [monthlyType, setMonthlyType] = useState("dayOfMonth");
  const [occurrences, setOccurrences] = useState(null);

  const validateEvent = useCallback(() => {
    const newErrors = {};

    if (!currentEvent?.start) {
      newErrors.start = "Start date is required";
    }

    if (!currentEvent?.end) {
      newErrors.end = "End date is required";
    }

    if (currentEvent?.isMultiDay && currentEvent?.start && currentEvent?.end) {
      if (currentEvent.start.isSame(currentEvent.end, "day")) {
        newErrors.dateOrder = "Multi-day events must span multiple days";
      }
    } else if (
      !currentEvent?.isMultiDay &&
      currentEvent?.start &&
      currentEvent?.end
    ) {
      if (!currentEvent?.start?.isSame(currentEvent.end, "day")) {
        newErrors.dateOrder =
          "Single-day events must start and end on the same day";
      }
    }

    if (!currentEvent?.title?.trim()) {
      newErrors.title = "Title is required";
    }

    if (!currentEvent?.description?.trim()) {
      newErrors.description = "Description is required";
    }

    const now = moment();
    if (currentEvent?.start && currentEvent?.start.isBefore(now, "day")) {
      newErrors.start = "Event can't be created in the past";
    }

    if (
      currentEvent?.start &&
      currentEvent?.end &&
      currentEvent?.end.isBefore(currentEvent.start)
    ) {
      newErrors.dateOrder = "End date/time can't be before start date/time";
    }

    if (
      recurrencePattern === RECURRENCE_PATTERNS.WEEKLY &&
      selectedWeekdays.length === 0
    ) {
      newErrors.recurrence = "Select at least one day for weekly recurrence";
    }

    if (
      recurrencePattern !== RECURRENCE_PATTERNS.NONE &&
      !occurrences &&
      !recurrenceEndDate
    ) {
      newErrors.recurrenceEnd =
        "Select either number of occurrences or end date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [
    currentEvent,
    recurrencePattern,
    selectedWeekdays,
    occurrences,
    recurrenceEndDate,
  ]);

  useEffect(() => {
    setCurrentEvent({
      ...event,
      start: event?.start_time ? moment(event.start_time) : null,
      end: event?.end_time ? moment(event.end_time) : null,
      // Preserve all other fields
      title: event?.title || "",
      description: event?.description || "",
      location: event?.location || "",
      eventType: event?.event_type || "",
      isAllDay: event?.is_all_day || false,
      isMultiDay: event?.is_multi_day || false,
      hideOnCalendar: event?.hide_on_calendar || false,
      hideOnUpcomingEvents: event?.hide_on_upcoming_events || false,
      recurrenceRule: event?.recurrence_rule || null,
    });

    const { pattern, endDate, occurrences, weekdays, monthlyType } =
      parseRecurrenceRule(event?.recurrence_rule);

    // Update all recurrence-related state
    setRecurrencePattern(pattern);
    setRecurrenceEndDate(endDate);
    setOccurrences(occurrences);
    setSelectedWeekdays(weekdays);
    setMonthlyType(monthlyType);
  }, [event]);

  useEffect(() => {
    validateEvent();
  }, [currentEvent, validateEvent]);

  const generateRRule = () => {
    if (recurrencePattern === RECURRENCE_PATTERNS.NONE) return null;

    let rule = `FREQ=${recurrencePattern.toUpperCase()};`;

    if (
      recurrencePattern === RECURRENCE_PATTERNS.WEEKLY &&
      selectedWeekdays.length > 0
    ) {
      rule += `BYDAY=${selectedWeekdays.join(",")};`;
    }

    if (
      recurrencePattern === RECURRENCE_PATTERNS.MONTHLY &&
      monthlyType === "dayOfWeek"
    ) {
      const start = moment(currentEvent.start);
      const weekNum = Math.ceil(start.date() / 7);
      const dayOfWeek = start.format("dd").toUpperCase();
      rule += `BYDAY=${weekNum}${dayOfWeek};`;
    }

    if (recurrenceEndDate) {
      rule += `UNTIL=${moment(recurrenceEndDate).format("YYYYMMDD")}T235959Z;`;
    } else if (occurrences) {
      rule += `COUNT=${occurrences};`;
    }

    return rule;
  };

  const toggleIsMultiDay = () => {
    setCurrentEvent((prev) => {
      const newEvent = { ...prev, isMultiDay: !prev.isMultiDay };
      if (newEvent.isMultiDay) {
        newEvent.end = moment(newEvent.start).add(1, "day");
      } else {
        newEvent.end = moment(newEvent.start).set({
          hour: newEvent.end.hour(),
          minute: newEvent.end.minute(),
          second: newEvent.end.second(),
        });
      }
      return newEvent;
    });
  };

  const toggleShowOnCalendar = () => {
    setCurrentEvent((prev) => ({
      ...prev,
      hideOnUpcomingEvents: prev ? !prev.hideOnUpcomingEvents : true,
    }));
  };

  const toggleAllDay = () => {
    setCurrentEvent((prev) => {
      const newEvent = { ...prev, isAllDay: !prev.isAllDay };
      if (newEvent.isAllDay) {
        newEvent.start = moment(newEvent.start).startOf("day");
        newEvent.end = moment(
          newEvent.isMultiDay ? newEvent.end : newEvent.start
        ).endOf("day");
      } else {
        newEvent.start = moment();
        newEvent.end = moment(newEvent.start).add(1, "hour");
        if (!newEvent.isMultiDay) {
          newEvent.end = moment(newEvent.start).set({
            hour: newEvent.end.hour(),
            minute: newEvent.end.minute(),
            second: newEvent.end.second(),
          });
        }
      }
      return newEvent;
    });
  };

  const handleChange = (field) => (e) => {
    setCurrentEvent({
      ...currentEvent,
      [field]: e.target.value,
    });
  };

  const handleDateChange = (field) => (date) => {
    setCurrentEvent((prev) => {
      const newEvent = { ...prev, [field]: date };

      if (field === "start" && !prev.isMultiDay && !prev.isAllDay) {
        newEvent.end = moment(date).set({
          hour: prev.end ? prev.end.hour() : date.hour(),
          minute: prev.end ? prev.end.minute() : date.minute(),
          second: prev.end ? prev.end.second() : date.second(),
        });
      } else if (prev.isAllDay) {
        if (field === "start") {
          newEvent.start = moment(date).startOf("day");
          if (!prev.isMultiDay) {
            newEvent.end = moment(date).endOf("day");
          }
        } else if (field === "end" && prev.isMultiDay) {
          newEvent.end = moment(date).endOf("day");
        }
      }

      return newEvent;
    });
  };

  const handleSave = () => {
    if (validateEvent()) {
      const rrule = generateRRule();
      const savedEvent = {
        community_id: communityId,
        title: currentEvent.title,
        description: currentEvent.description,
        location: currentEvent.location,
        event_type: currentEvent.eventType,
        start_time: currentEvent.start
          ? currentEvent.start.toISOString()
          : null,
        end_time: currentEvent.end ? currentEvent.end.toISOString() : null,
        is_all_day: currentEvent.isAllDay || false,
        is_multi_day: currentEvent.isMultiDay || false,
        hide_on_calendar: currentEvent.hideOnCalendar || false,
        hide_on_upcoming_events: currentEvent.hideOnUpcomingEvents || false,
        recurrence_rule: rrule,
      };
      onSave(savedEvent);
    }
  };

  const handleDelete = () => {
    onDelete(currentEvent.id);
    onClose();
  };

  const selectType = (type) => {
    setCurrentEvent({
      ...currentEvent,
      eventType: type,
    });
  };

  const RecurrenceSection = () => (
    <Grid container direction="column" spacing={2} sx={{ mt: 2 }}>
      <Grid item>
        <FormControl fullWidth>
          <InputLabel>Recurrence Pattern</InputLabel>
          <Select
            value={recurrencePattern}
            onChange={(e) => setRecurrencePattern(e.target.value)}
            label="Recurrence Pattern"
          >
            <MenuItem value={RECURRENCE_PATTERNS.NONE}>
              Does not repeat
            </MenuItem>
            <MenuItem value={RECURRENCE_PATTERNS.DAILY}>Daily</MenuItem>
            <MenuItem value={RECURRENCE_PATTERNS.WEEKLY}>Weekly</MenuItem>
            <MenuItem value={RECURRENCE_PATTERNS.MONTHLY}>Monthly</MenuItem>
            <MenuItem value={RECURRENCE_PATTERNS.YEARLY}>Yearly</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      {recurrencePattern === RECURRENCE_PATTERNS.WEEKLY && (
        <Grid item container spacing={1}>
          {WEEKDAYS.map((day) => (
            <Grid item key={day.value}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedWeekdays.includes(day.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedWeekdays([...selectedWeekdays, day.value]);
                      } else {
                        setSelectedWeekdays(
                          selectedWeekdays.filter((d) => d !== day.value)
                        );
                      }
                    }}
                  />
                }
                label={day.label}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {recurrencePattern === RECURRENCE_PATTERNS.MONTHLY && (
        <Grid item>
          <FormControl fullWidth>
            <InputLabel>Repeat by</InputLabel>
            <Select
              value={monthlyType}
              onChange={(e) => setMonthlyType(e.target.value)}
              label="Repeat by"
            >
              <MenuItem value="dayOfMonth">Day of month</MenuItem>
              <MenuItem value="dayOfWeek">Day of week</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      )}

      {recurrencePattern !== RECURRENCE_PATTERNS.NONE && (
        <Grid item container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="subtitle2">End Recurrence</Typography>
          </Grid>
          <Grid item>
            <TextField
              type="number"
              label="Number of occurrences"
              value={occurrences || ""}
              onChange={(e) => {
                setOccurrences(
                  e.target.value ? parseInt(e.target.value) : null
                );
                setRecurrenceEndDate(null);
              }}
              inputProps={{ min: 1 }}
              error={
                !occurrences && !recurrenceEndDate && !!errors.recurrenceEnd
              }
              helperText={
                !occurrences && !recurrenceEndDate ? errors.recurrenceEnd : ""
              }
            />
          </Grid>
          <Grid item>
            <Typography variant="subtitle2">OR</Typography>
          </Grid>
          <Grid item>
            <DatePicker
              label="End Date"
              value={recurrenceEndDate}
              onChange={(date) => {
                setRecurrenceEndDate(date);
                setOccurrences(null);
              }}
              minDate={moment(currentEvent.start)}
            />
          </Grid>
        </Grid>
      )}
    </Grid>
  );

  const isFormValid = Object.keys(errors).length === 0;

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <Dialog
        open={show}
        onClose={onClose}
        scroll={"paper"}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          justifyContent="space-between"
          sx={{ width: "100%" }}
          display="flex"
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            {isEdit ? "Edit Event" : "Create New Event"}
            {currentEvent?.eventType && (
              <>
                {" - "}
                <Button
                  onClick={() => selectType(null)}
                  variant="text"
                  sx={{
                    textTransform: "capitalize",
                    p: 0,
                    minWidth: "0px",
                    ml: 0.5,
                    color: "#686868",
                    fontSize: "20px",
                  }}
                >
                  {currentEvent.eventType}
                </Button>
              </>
            )}
          </div>
          {isEdit && (
            <IconButton onClick={handleDelete}>
              <Delete />
            </IconButton>
          )}
        </DialogTitle>
        <Divider />

        <DialogContent>
          {!currentEvent?.eventType ? (
            <Grid container direction="row" spacing={2} display="flex">
              <Grid item xs={4}>
                <Card
                  onClick={() => selectType("Days of Service")}
                  sx={{
                    minHeight: "200px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    "&:hover": {
                      backgroundColor: "#f0f0f0",
                      transform: "scale(1.05)",
                      cursor: "pointer",
                    },
                  }}
                >
                  Days of Service
                </Card>
              </Grid>

              <Grid item xs={4}>
                <Card
                  onClick={() => selectType("Community Resource Center")}
                  sx={{
                    minHeight: "200px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    "&:hover": {
                      backgroundColor: "#f0f0f0",
                      transform: "scale(1.05)",
                      cursor: "pointer",
                    },
                  }}
                >
                  Community Resource Center
                </Card>
              </Grid>
              <Grid item xs={4}>
                <Card
                  onClick={() => selectType("Other Events")}
                  sx={{
                    minHeight: "200px",
                    display: "flex",

                    justifyContent: "center",
                    alignItems: "center",
                    "&:hover": {
                      backgroundColor: "#f0f0f0",
                      transform: "scale(1.05)",
                      cursor: "pointer",
                    },
                  }}
                >
                  Other Events
                </Card>
              </Grid>
            </Grid>
          ) : (
            <Grid container direction="column" spacing={2}>
              <Grid item>
                <TextField
                  label="Title"
                  value={currentEvent?.title || ""}
                  onChange={handleChange("title")}
                  fullWidth
                  error={!!errors.title}
                  helperText={errors.title}
                />
              </Grid>
              <Grid item>
                <TextField
                  label="Location"
                  value={currentEvent?.location || ""}
                  onChange={handleChange("location")}
                  fullWidth
                />
              </Grid>
              <Grid item>
                <TextField
                  label="Description"
                  value={currentEvent?.description || ""}
                  onChange={handleChange("description")}
                  fullWidth
                  multiline
                  rows={4}
                  error={!!errors.description}
                  helperText={errors.description}
                />
              </Grid>

              <Grid container item direction="row">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={currentEvent?.isAllDay || false}
                      onChange={toggleAllDay}
                    />
                  }
                  label="All Day"
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={currentEvent?.isMultiDay}
                      onChange={toggleIsMultiDay}
                    />
                  }
                  label="Is Multi-Day Event"
                />
              </Grid>

              <Grid container item direction="row" spacing={2}>
                {currentEvent?.isMultiDay ? (
                  <>
                    <Grid item>
                      {currentEvent?.isAllDay ? (
                        <DatePicker
                          label="Start Date"
                          value={currentEvent?.start || null}
                          onChange={handleDateChange("start")}
                          slotProps={{
                            textField: {
                              error: !!errors.start,
                              helperText: errors.start,
                            },
                          }}
                        />
                      ) : (
                        <DateTimePicker
                          label="Start Date & Time"
                          value={currentEvent?.start || null}
                          onChange={handleDateChange("start")}
                          slotProps={{
                            textField: {
                              error: !!errors.start,
                              helperText: errors.start,
                            },
                          }}
                        />
                      )}
                    </Grid>
                    <Grid item>
                      {currentEvent?.isAllDay ? (
                        <DatePicker
                          label="End Date"
                          value={currentEvent?.end || null}
                          onChange={handleDateChange("end")}
                          slotProps={{
                            textField: {
                              error: !!errors.end,
                              helperText: errors.end,
                            },
                          }}
                        />
                      ) : (
                        <DateTimePicker
                          label="End Date & Time"
                          value={currentEvent?.end || null}
                          onChange={handleDateChange("end")}
                          slotProps={{
                            textField: {
                              error: !!errors.end,
                              helperText: errors.end,
                            },
                          }}
                        />
                      )}
                    </Grid>
                  </>
                ) : (
                  <>
                    <Grid item>
                      <DatePicker
                        label="Event Date"
                        value={currentEvent?.start || null}
                        onChange={handleDateChange("start")}
                        slotProps={{
                          textField: {
                            error: !!errors.start,
                            helperText: errors.start,
                          },
                        }}
                      />
                    </Grid>
                    {!currentEvent?.isAllDay && (
                      <>
                        <Grid item>
                          <TimePicker
                            label="Start Time"
                            value={currentEvent?.start || null}
                            onChange={handleDateChange("start")}
                          />
                        </Grid>
                        <Grid item>
                          <TimePicker
                            label="End Time"
                            value={currentEvent?.end || null}
                            onChange={handleDateChange("end")}
                          />
                        </Grid>
                      </>
                    )}
                  </>
                )}
              </Grid>

              {errors.dateOrder && (
                <Grid item>
                  <Typography color="error">{errors.dateOrder}</Typography>
                </Grid>
              )}

              {/* Add RecurrenceSection here */}
              <RecurrenceSection />

              <Grid container item direction="row" sx={{ mt: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={!(currentEvent?.hideOnUpcomingEvents || false)}
                      onChange={toggleShowOnCalendar}
                    />
                  }
                  label="Show in Upcoming Events"
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleSave} disabled={!isFormValid}>
            Save
          </Button>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default EventDialog_NewEdit;
