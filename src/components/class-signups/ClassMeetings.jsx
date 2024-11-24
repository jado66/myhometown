import React, { useState, useCallback } from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  IconButton,
  Button,
  Stack,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export function ClassMeetings({ meetings, onChange }) {
  const getNextDay = (currentDay) => {
    const currentIndex = DAYS_OF_WEEK.indexOf(currentDay);
    if (meetings.length === 0) {
      return "Monday";
    }
    if (currentIndex === -1 || currentIndex === DAYS_OF_WEEK.length - 1) {
      return "Sunday";
    }
    return DAYS_OF_WEEK[currentIndex + 1];
  };

  const addMeeting = () => {
    const lastDay =
      meetings.length > 0
        ? meetings.reduce(
            (latest, meeting) =>
              DAYS_OF_WEEK.indexOf(meeting.day) > DAYS_OF_WEEK.indexOf(latest)
                ? meeting.day
                : latest,
            meetings[0].day
          )
        : "Sunday";

    const newMeeting = {
      id: Date.now(),
      day: getNextDay(lastDay),
      startTime: "09:00",
      endTime: "10:00",
    };

    const updatedMeetings = [...meetings, newMeeting].sort(
      (a, b) => DAYS_OF_WEEK.indexOf(a.day) - DAYS_OF_WEEK.indexOf(b.day)
    );
    onChange(updatedMeetings);
  };

  const updateMeeting = useCallback(
    (id, field, value) => {
      const updatedMeetings = meetings
        .map((meeting) =>
          meeting.id === id ? { ...meeting, [field]: value } : meeting
        )
        .sort(
          (a, b) => DAYS_OF_WEEK.indexOf(a.day) - DAYS_OF_WEEK.indexOf(b.day)
        );
      onChange(updatedMeetings);
    },
    [meetings, onChange]
  );

  const removeMeeting = useCallback(
    (id) => {
      const updatedMeetings = meetings.filter((meeting) => meeting.id !== id);
      onChange(updatedMeetings);
    },
    [meetings, onChange]
  );

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom>
        Class Meetings
      </Typography>
      <Stack spacing={2}>
        {meetings.map((meeting) => (
          <Box
            key={meeting.id}
            sx={{
              display: "flex",
              gap: 2,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel>Day</InputLabel>
              <Select
                value={meeting.day}
                onChange={(e) =>
                  updateMeeting(meeting.id, "day", e.target.value)
                }
                label="Day"
              >
                {DAYS_OF_WEEK.map((day) => (
                  <MenuItem key={day} value={day}>
                    {day}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Start Time"
              type="time"
              value={meeting.startTime}
              onChange={(e) =>
                updateMeeting(meeting.id, "startTime", e.target.value)
              }
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="End Time"
              type="time"
              value={meeting.endTime}
              onChange={(e) =>
                updateMeeting(meeting.id, "endTime", e.target.value)
              }
              InputLabelProps={{ shrink: true }}
            />

            <IconButton
              onClick={() => removeMeeting(meeting.id)}
              aria-label="Remove meeting"
              size="small"
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        ))}

        <Button
          variant="outlined"
          onClick={addMeeting}
          startIcon={<CalendarTodayIcon />}
          sx={{ alignSelf: "flex-start" }}
        >
          Add Class Time
        </Button>
      </Stack>
    </Box>
  );
}
