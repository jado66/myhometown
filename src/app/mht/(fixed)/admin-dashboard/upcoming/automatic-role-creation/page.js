"use client";

import { useState, useCallback } from "react";
import moment from "moment";
import DeleteIcon from "@mui/icons-material/Delete";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import {
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  Typography,
  Container,
  Box,
  Stack,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function RoleCreator() {
  const [className, setClassName] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [students, setStudents] = useState([]);
  const [newStudentName, setNewStudentName] = useState("");
  const [generatedDates, setGeneratedDates] = useState([]);

  const addMeeting = () => {
    const newMeeting = { id: Date.now(), day: "Monday", time: "09:00" };
    setMeetings((prevMeetings) =>
      [...prevMeetings, newMeeting].sort(
        (a, b) => daysOfWeek.indexOf(a.day) - daysOfWeek.indexOf(b.day)
      )
    );
  };

  const updateMeeting = useCallback((id, field, value) => {
    setMeetings((prevMeetings) =>
      prevMeetings
        .map((meeting) =>
          meeting.id === id ? { ...meeting, [field]: value } : meeting
        )
        .sort((a, b) => daysOfWeek.indexOf(a.day) - daysOfWeek.indexOf(b.day))
    );
  }, []);

  const removeMeeting = useCallback((id) => {
    setMeetings((prevMeetings) =>
      prevMeetings.filter((meeting) => meeting.id !== id)
    );
  }, []);

  const addStudent = () => {
    if (newStudentName.trim()) {
      setStudents((prevStudents) => [
        ...prevStudents,
        { id: Date.now(), name: newStudentName.trim() },
      ]);
      setNewStudentName("");
    }
  };

  const removeStudent = useCallback((id) => {
    setStudents((prevStudents) =>
      prevStudents.filter((student) => student.id !== id)
    );
  }, []);

  const generateDates = () => {
    if (!startDate || !endDate || meetings.length === 0) return;

    const dates = [];
    let currentDate = moment(startDate);
    const endMoment = moment(endDate);

    while (currentDate.isSameOrBefore(endMoment)) {
      const dayOfWeek = currentDate.format("dddd");
      const matchingMeetings = meetings.filter(
        (meeting) => meeting.day === dayOfWeek
      );

      if (matchingMeetings.length > 0) {
        dates.push(currentDate.format("YYYY-MM-DD"));
      }

      currentDate = currentDate.clone().add(1, "days");
    }

    alert("Generated dates: " + dates.join(", "));
    setGeneratedDates(dates);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Class Role Creator
        </Typography>
        <Typography variant="subtitle1" gutterBottom sx={{ mb: 3 }}>
          When this tool is fully implemented, the class information will be
          pulled from the database and the role will be generated automatically.
        </Typography>

        <Stack spacing={4}>
          <TextField
            fullWidth
            label="Class Name"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            placeholder="Enter class name"
          />

          <Stack direction="row" spacing={2}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={(newValue) => setStartDate(newValue)}
              sx={{ flex: 1 }}
            />
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={(newValue) => setEndDate(newValue)}
              sx={{ flex: 1 }}
            />
          </Stack>

          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Class Meetings
            </Typography>
            {meetings.map((meeting) => (
              <Box
                key={meeting.id}
                sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center" }}
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
                    {daysOfWeek.map((day) => (
                      <MenuItem key={day} value={day}>
                        {day}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  type="time"
                  value={meeting.time}
                  onChange={(e) =>
                    updateMeeting(meeting.id, "time", e.target.value)
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
              variant="contained"
              onClick={addMeeting}
              startIcon={<CalendarTodayIcon />}
            >
              Add Class Time
            </Button>
          </Box>

          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Students
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <TextField
                fullWidth
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                placeholder="Enter student name"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    addStudent();
                  }
                }}
              />
              <Button variant="contained" onClick={addStudent}>
                Add Student
              </Button>
            </Stack>
            <Stack spacing={1}>
              {students.map((student) => (
                <Box
                  key={student.id}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography>{student.name}</Typography>
                  <IconButton
                    onClick={() => removeStudent(student.id)}
                    aria-label={`Remove ${student.name}`}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
            </Stack>
          </Box>

          <Button variant="contained" onClick={generateDates} fullWidth>
            Generate Role
          </Button>
        </Stack>

        {generatedDates.length > 0 && (
          <TableContainer component={Paper} sx={{ mt: 4 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student</TableCell>
                  {generatedDates.map((date) => (
                    <TableCell key={date}>
                      {moment(date).format("DD/MM/YYYY")}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.name}</TableCell>
                    {generatedDates.map((date) => (
                      <TableCell key={date}>
                        <Checkbox />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
    </LocalizationProvider>
  );
}
