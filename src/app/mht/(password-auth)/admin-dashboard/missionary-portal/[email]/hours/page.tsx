"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Grid,
  Paper,
  Divider,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import {
  ArrowForward,
  ArrowBack,
  Check,
  Schedule,
  CalendarToday,
  DateRange,
  CheckCircle,
} from "@mui/icons-material";
import moment, { type Moment } from "moment";

interface TimeEntry {
  date: Moment;
  hours: number;
  missionary_email?: string; // Optional, can be set later
  activity_description: string;
  category: string;
  location: string;
}

const categories = [
  { value: "general", label: "General Activities" },
  { value: "outreach", label: "Community Outreach" },
  { value: "administration", label: "Office Work" },
  { value: "training", label: "Training & Learning" },
  { value: "community_service", label: "Community Service" },
  { value: "other", label: "Other Activities" },
];

const steps = [
  "Choose Method",
  "Select Date",
  "Enter Hours",
  "Activity Details",
  "Review & Submit",
];

export default function SimpleTimeEntry({
  params,
}: {
  params: Promise<{ email: string }>;
}) {
  const [email, setEmail] = useState<string>("");
  const [paramsLoaded, setParamsLoaded] = useState(false);

  // Resolve params asynchronously
  useEffect(() => {
    const resolveParams = async () => {
      try {
        const resolvedParams = await params;
        setEmail(resolvedParams.email.replace(/%40/g, "@")); // Decode email
        setParamsLoaded(true);
      } catch (error) {
        console.error("Error resolving params:", error);
        setParamsLoaded(true);
      }
    };

    resolveParams();
  }, [params]);

  const [currentStep, setCurrentStep] = useState(0);
  const [entryMethod, setEntryMethod] = useState<
    "single" | "week" | "month" | ""
  >("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  // Form data
  const [selectedDate, setSelectedDate] = useState<Moment>(moment());
  const [selectedWeek, setSelectedWeek] = useState<Moment>(moment());
  const [selectedMonth, setSelectedMonth] = useState<Moment>(moment());
  const [hours, setHours] = useState("");
  const [activity, setActivity] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");

  const resetForm = () => {
    setCurrentStep(0);
    setEntryMethod("");
    setSelectedDate(moment());
    setSelectedWeek(moment());
    setSelectedMonth(moment());
    setHours("");
    setActivity("");
    setCategory("");
    setLocation("");
    setMessage("");
    setSuccess(false);
  };

  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const generateDaysInRange = (
    startDate: Moment,
    endDate: Moment
  ): Moment[] => {
    const days: Moment[] = [];
    const current = startDate.clone();

    while (current.isSameOrBefore(endDate, "day")) {
      days.push(current.clone());
      current.add(1, "day");
    }

    return days;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setMessage(""); // Clear any previous messages
    setSuccess(false); // Reset success state

    try {
      let entries: TimeEntry[] = [];

      if (entryMethod === "single") {
        entries = [
          {
            date: selectedDate,
            hours: Number.parseFloat(hours),
            activity_description: activity,
            category,
            location,
          },
        ];
      } else if (entryMethod === "week") {
        const weekStart = selectedWeek.clone().startOf("week");
        const weekEnd = selectedWeek.clone().endOf("week");
        const weekDays = generateDaysInRange(weekStart, weekEnd);
        const weekdays = weekDays.filter(
          (day) => day.day() !== 0 && day.day() !== 6
        ); // 0 = Sunday, 6 = Saturday
        const hoursPerDay = Number.parseFloat(hours) / weekdays.length;

        entries = weekdays.map((date) => ({
          date,
          hours: Math.round(hoursPerDay * 100) / 100,
          activity_description: activity,
          category,
          location,
        }));
      } else if (entryMethod === "month") {
        const monthStart = selectedMonth.clone().startOf("month");
        const monthEnd = selectedMonth.clone().endOf("month");
        const monthDays = generateDaysInRange(monthStart, monthEnd);
        const weekdays = monthDays.filter(
          (day) => day.day() !== 0 && day.day() !== 6
        );
        const hoursPerDay = Number.parseFloat(hours) / weekdays.length;

        entries = weekdays.map((date) => ({
          date,
          hours: Math.round(hoursPerDay * 100) / 100,
          activity_description: activity,
          category,
          location,
        }));
      }

      // Submit entries
      const promises = entries.map(async (entry) => {
        const response = await fetch("/api/missionary/hours", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email,
            date: entry.date.format("YYYY-MM-DD"),
            hours: entry.hours,
            activity_description: entry.activity_description,
            category: entry.category,
            location: entry.location,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Failed to save entry for ${entry.date.format("YYYY-MM-DD")}: ${
              response.status
            } ${response.statusText}${errorText ? ` - ${errorText}` : ""}`
          );
        }

        return response;
      });

      await Promise.all(promises);

      setSuccess(true);
      setMessage(
        `Successfully logged ${entries.length} day(s) of volunteer hours!`
      );
      setCurrentStep(5); // Go to success step
    } catch (error) {
      setSuccess(false);
      console.error("Error submitting hours:", error);

      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage("There was a problem saving your hours. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography
            variant="h3"
            component="h1"
            fontWeight="bold"
            gutterBottom
          >
            Log Your Volunteer Hours
          </Typography>
          <Typography variant="h5" color="text.secondary">
            We'll help you step by step
          </Typography>
        </Box>

        {/* Progress Stepper */}
        <Box sx={{ mb: 4 }}>
          <Stepper activeStep={currentStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>
                  <Typography variant="body1" fontWeight="medium">
                    {label}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        <Card elevation={3} sx={{ minHeight: 500 }}>
          <CardContent sx={{ p: 4 }}>
            {/* Step 1: Choose how to enter time */}
            {currentStep === 0 && (
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="h4"
                  component="h2"
                  fontWeight="bold"
                  gutterBottom
                >
                  How would you like to enter your time?
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
                  Choose the option that works best for you
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    maxWidth: 600,
                    mx: "auto",
                  }}
                >
                  <Button
                    variant={
                      entryMethod === "single" ? "contained" : "outlined"
                    }
                    onClick={() => setEntryMethod("single")}
                    sx={{
                      height: 80,
                      fontSize: "1.2rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                    }}
                    startIcon={<Schedule sx={{ fontSize: "2rem" }} />}
                  >
                    <Box>One Day at a Time</Box>
                    <Typography variant="body2" sx={{ opacity: 0.7 }}>
                      Enter hours for a single day
                    </Typography>
                  </Button>

                  <Button
                    variant={entryMethod === "week" ? "contained" : "outlined"}
                    onClick={() => setEntryMethod("week")}
                    sx={{
                      height: 80,
                      fontSize: "1.2rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                    }}
                    startIcon={<CalendarToday sx={{ fontSize: "2rem" }} />}
                  >
                    <Box>Whole Week</Box>
                    <Typography variant="body2" sx={{ opacity: 0.7 }}>
                      Enter total hours for a week
                    </Typography>
                  </Button>

                  <Button
                    variant={entryMethod === "month" ? "contained" : "outlined"}
                    onClick={() => setEntryMethod("month")}
                    sx={{
                      height: 80,
                      fontSize: "1.2rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                    }}
                    startIcon={<DateRange sx={{ fontSize: "2rem" }} />}
                  >
                    <Box>Whole Month</Box>
                    <Typography variant="body2" sx={{ opacity: 0.7 }}>
                      Enter total hours for a month
                    </Typography>
                  </Button>
                </Box>

                <Box sx={{ mt: 4 }}>
                  <Button
                    onClick={handleNext}
                    disabled={!entryMethod}
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForward />}
                    sx={{ fontSize: "1.2rem", px: 4, py: 2 }}
                  >
                    Continue
                  </Button>
                </Box>
              </Box>
            )}

            {/* Step 2: Choose date/period */}
            {currentStep === 1 && (
              <Box>
                <Box sx={{ textAlign: "center", mb: 4 }}>
                  <Typography
                    variant="h4"
                    component="h2"
                    fontWeight="bold"
                    gutterBottom
                  >
                    {entryMethod === "single" && "Which day?"}
                    {entryMethod === "week" && "Which week?"}
                    {entryMethod === "month" && "Which month?"}
                  </Typography>
                  <Typography variant="h6" color="text.secondary">
                    {entryMethod === "single" &&
                      "Select the day you want to log hours for"}
                    {entryMethod === "week" &&
                      "Select any day in the week you want to log hours for"}
                    {entryMethod === "month" &&
                      "Select any day in the month you want to log hours for"}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
                  <DatePicker
                    value={
                      entryMethod === "single"
                        ? selectedDate
                        : entryMethod === "week"
                        ? selectedWeek
                        : selectedMonth
                    }
                    onChange={(date) => {
                      if (date) {
                        if (entryMethod === "single") setSelectedDate(date);
                        else if (entryMethod === "week") setSelectedWeek(date);
                        else if (entryMethod === "month")
                          setSelectedMonth(date);
                      }
                    }}
                    slotProps={{
                      textField: {
                        size: "medium",
                        sx: { fontSize: "1.2rem" },
                      },
                    }}
                  />
                </Box>

                {entryMethod === "week" && (
                  <Paper
                    sx={{
                      p: 3,
                      mb: 4,
                      bgcolor: "primary.50",
                      textAlign: "center",
                    }}
                  >
                    <Typography variant="h6">
                      Week of{" "}
                      {selectedWeek.clone().startOf("week").format("MMMM D")} -{" "}
                      {selectedWeek
                        .clone()
                        .endOf("week")
                        .format("MMMM D, YYYY")}
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      Hours will be spread across weekdays (Monday-Friday)
                    </Typography>
                  </Paper>
                )}

                {entryMethod === "month" && (
                  <Paper
                    sx={{
                      p: 3,
                      mb: 4,
                      bgcolor: "primary.50",
                      textAlign: "center",
                    }}
                  >
                    <Typography variant="h6">
                      {selectedMonth.format("MMMM YYYY")}
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      Hours will be spread across weekdays in this month
                    </Typography>
                  </Paper>
                )}

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mt: 4,
                  }}
                >
                  <Button
                    onClick={handleBack}
                    variant="outlined"
                    size="large"
                    startIcon={<ArrowBack />}
                    sx={{ fontSize: "1.2rem", px: 4, py: 2 }}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleNext}
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForward />}
                    sx={{ fontSize: "1.2rem", px: 4, py: 2 }}
                  >
                    Continue
                  </Button>
                </Box>
              </Box>
            )}

            {/* Step 3: Enter hours */}
            {currentStep === 2 && (
              <Box>
                <Box sx={{ textAlign: "center", mb: 4 }}>
                  <Typography
                    variant="h4"
                    component="h2"
                    fontWeight="bold"
                    gutterBottom
                  >
                    How many hours?
                  </Typography>
                  <Typography variant="h6" color="text.secondary">
                    {entryMethod === "single" &&
                      "Enter the number of hours you volunteered on this day"}
                    {entryMethod === "week" &&
                      "Enter the total number of hours you volunteered this week"}
                    {entryMethod === "month" &&
                      "Enter the total number of hours you volunteered this month"}
                  </Typography>
                </Box>

                <Box sx={{ maxWidth: 400, mx: "auto", mb: 4 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label={
                      entryMethod === "single"
                        ? "Hours for this day"
                        : entryMethod === "week"
                        ? "Total hours for the week"
                        : "Total hours for the month"
                    }
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    inputProps={{
                      step: "0.25",
                      min: "0",
                      max:
                        entryMethod === "single"
                          ? "24"
                          : entryMethod === "week"
                          ? "168"
                          : "744",
                      style: { fontSize: "2rem", textAlign: "center" },
                    }}
                    InputLabelProps={{
                      style: { fontSize: "1.2rem" },
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: "80px",
                      },
                    }}
                    placeholder="0"
                  />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1, textAlign: "center" }}
                  >
                    You can use decimals like 2.5 for 2 hours and 30 minutes
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mt: 4,
                  }}
                >
                  <Button
                    onClick={handleBack}
                    variant="outlined"
                    size="large"
                    startIcon={<ArrowBack />}
                    sx={{ fontSize: "1.2rem", px: 4, py: 2 }}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={!hours || Number.parseFloat(hours) <= 0}
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForward />}
                    sx={{ fontSize: "1.2rem", px: 4, py: 2 }}
                  >
                    Continue
                  </Button>
                </Box>
              </Box>
            )}

            {/* Step 4: Activity details */}
            {currentStep === 3 && (
              <Box>
                <Box sx={{ textAlign: "center", mb: 4 }}>
                  <Typography
                    variant="h4"
                    component="h2"
                    fontWeight="bold"
                    gutterBottom
                  >
                    What did you do?
                  </Typography>
                  <Typography variant="h6" color="text.secondary">
                    Tell us about your volunteer activities
                  </Typography>
                </Box>

                <Box sx={{ maxWidth: 600, mx: "auto" }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel sx={{ fontSize: "1.2rem" }}>
                          Type of Activity
                        </InputLabel>
                        <Select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          label="Type of Activity"
                          sx={{
                            fontSize: "1.1rem",
                            height: "60px",
                          }}
                        >
                          {categories.map((cat) => (
                            <MenuItem
                              key={cat.value}
                              value={cat.value}
                              sx={{ fontSize: "1.1rem", py: 2 }}
                            >
                              {cat.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Describe Your Activities"
                        value={activity}
                        onChange={(e) => setActivity(e.target.value)}
                        placeholder="Tell us what you did during your volunteer time..."
                        InputLabelProps={{
                          style: { fontSize: "1.2rem" },
                        }}
                        inputProps={{
                          style: { fontSize: "1.1rem" },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Where? (Optional)"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Where did you volunteer?"
                        InputLabelProps={{
                          style: { fontSize: "1.2rem" },
                        }}
                        inputProps={{
                          style: { fontSize: "1.1rem" },
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            height: "60px",
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mt: 4,
                  }}
                >
                  <Button
                    onClick={handleBack}
                    variant="outlined"
                    size="large"
                    startIcon={<ArrowBack />}
                    sx={{ fontSize: "1.2rem", px: 4, py: 2 }}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={!category || !activity.trim()}
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForward />}
                    sx={{ fontSize: "1.2rem", px: 4, py: 2 }}
                  >
                    Continue
                  </Button>
                </Box>
              </Box>
            )}

            {/* Step 5: Review and submit */}
            {currentStep === 4 && (
              <Box>
                <Box sx={{ textAlign: "center", mb: 4 }}>
                  <Typography
                    variant="h4"
                    component="h2"
                    fontWeight="bold"
                    gutterBottom
                  >
                    Review Your Information
                  </Typography>
                  <Typography variant="h6" color="text.secondary">
                    Please check that everything looks correct
                  </Typography>
                </Box>

                <Paper sx={{ p: 4, mb: 4, bgcolor: "grey.50" }}>
                  <Grid container spacing={3}>
                    <Grid item xs={6}>
                      <Typography variant="h6" fontWeight="bold">
                        Time Period:
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="h6">
                        {entryMethod === "single" &&
                          selectedDate.format("MMMM D, YYYY")}
                        {entryMethod === "week" &&
                          `Week of ${selectedWeek
                            .clone()
                            .startOf("week")
                            .format("MMM D")} - ${selectedWeek
                            .clone()
                            .endOf("week")
                            .format("MMM D, YYYY")}`}
                        {entryMethod === "month" &&
                          selectedMonth.format("MMMM YYYY")}
                      </Typography>
                    </Grid>

                    <Grid item xs={6}>
                      <Typography variant="h6" fontWeight="bold">
                        Hours:
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="h6">{hours} hours</Typography>
                    </Grid>

                    <Grid item xs={6}>
                      <Typography variant="h6" fontWeight="bold">
                        Activity Type:
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="h6">
                        {categories.find((c) => c.value === category)?.label}
                      </Typography>
                    </Grid>

                    <Grid item xs={6}>
                      <Typography variant="h6" fontWeight="bold">
                        Location:
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="h6">
                        {location || "Not specified"}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 3 }} />

                  <Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      What You Did:
                    </Typography>
                    <Typography variant="h6">{activity}</Typography>
                  </Box>

                  {(entryMethod === "week" || entryMethod === "month") && (
                    <>
                      <Divider sx={{ my: 3 }} />
                      <Paper sx={{ p: 3, bgcolor: "primary.50" }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                          How Your Hours Will Be Recorded:
                        </Typography>
                        <Typography variant="body1">
                          Your {hours} hours will be automatically divided
                          across the weekdays in this {entryMethod}. Each
                          weekday will show the same activity description and
                          details.
                        </Typography>
                      </Paper>
                    </>
                  )}
                </Paper>

                {message && (
                  <Alert
                    severity={success ? "success" : "error"}
                    sx={{ mb: 3, fontSize: "1.1rem" }}
                  >
                    {message}
                  </Alert>
                )}

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Button
                    onClick={handleBack}
                    variant="outlined"
                    size="large"
                    startIcon={<ArrowBack />}
                    sx={{ fontSize: "1.2rem", px: 4, py: 2 }}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    variant="contained"
                    size="large"
                    endIcon={<Check />}
                    sx={{
                      fontSize: "1.2rem",
                      px: 4,
                      py: 2,
                      bgcolor: "success.main",
                      "&:hover": { bgcolor: "success.dark" },
                    }}
                  >
                    {loading ? "Saving..." : "Submit Hours"}
                  </Button>
                </Box>
              </Box>
            )}

            {/* Step 6: Success */}
            {currentStep === 5 && (
              <Box sx={{ textAlign: "center" }}>
                <Box
                  sx={{
                    width: 100,
                    height: 100,
                    bgcolor: "success.main",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 4,
                  }}
                >
                  <CheckCircle sx={{ fontSize: "4rem", color: "white" }} />
                </Box>

                <Typography
                  variant="h3"
                  component="h2"
                  fontWeight="bold"
                  color="success.main"
                  gutterBottom
                >
                  Success!
                </Typography>
                <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
                  Your volunteer hours have been recorded
                </Typography>

                {message && (
                  <Alert severity="success" sx={{ mb: 4, fontSize: "1.1rem" }}>
                    {message}
                  </Alert>
                )}

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    maxWidth: 400,
                    mx: "auto",
                  }}
                >
                  <Button
                    onClick={resetForm}
                    variant="contained"
                    size="large"
                    sx={{ fontSize: "1.2rem", py: 2 }}
                  >
                    Log More Hours
                  </Button>

                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => (window.location.href = "/dashboard")}
                    sx={{ fontSize: "1.2rem", py: 2 }}
                  >
                    Go to Dashboard
                  </Button>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </LocalizationProvider>
  );
}
