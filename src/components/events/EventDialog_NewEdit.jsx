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
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { DatePicker, DateTimePicker, TimePicker } from "@mui/x-date-pickers";

export const EventDialog_NewEdit = ({
  onClose,
  show,
  event = {},
  onSave,
  isEdit,
  onDelete,
}) => {
  const [currentEvent, setCurrentEvent] = useState(event);
  const [errors, setErrors] = useState({});

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [currentEvent]);

  useEffect(() => {
    setCurrentEvent({
      ...event,
      start: event?.start ? moment(event.start) : null,
      end: event?.end ? moment(event.end) : null,
    });
  }, [event]);

  useEffect(() => {
    validateEvent();
  }, [currentEvent, validateEvent]);

  const toggleIsMultiDay = () => {
    setCurrentEvent((prev) => {
      const newEvent = { ...prev, isMultiDay: !prev.isMultiDay };
      if (newEvent.isMultiDay) {
        // Set end to one day after start
        newEvent.end = moment(newEvent.start).add(1, "day");
      } else {
        // Set end to same day as start, keeping the time
        newEvent.end = moment(newEvent.start).set({
          hour: newEvent.end.hour(),
          minute: newEvent.end.minute(),
          second: newEvent.end.second(),
        });
      }
      return newEvent;
    });
  };

  const toggleAllDay = () => {
    setCurrentEvent((prev) => {
      const newEvent = { ...prev, isAllDay: !prev.isAllDay };
      if (newEvent.isAllDay) {
        // Start at beginning of day, end at end of day
        newEvent.start = moment(newEvent.start).startOf("day");
        newEvent.end = moment(
          newEvent.isMultiDay ? newEvent.end : newEvent.start
        ).endOf("day");
      } else {
        // Start now, end one hour later on the same day
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
        // Adjust end date for single-day events
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
      const savedEvent = {
        ...currentEvent,
        start: currentEvent.start ? currentEvent.start.toISOString() : null,
        end: currentEvent.end ? currentEvent.end.toISOString() : null,
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
                              error: !!errors.start,
                              helperText: errors.start,
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

              {/* <Grid item>
                <TextField
                  label="Resource"
                  value={currentEvent?.resource || ""}
                  onChange={handleChange("resource")}
                  fullWidth
                />
              </Grid> */}
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
