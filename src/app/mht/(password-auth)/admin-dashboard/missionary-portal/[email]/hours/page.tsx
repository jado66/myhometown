"use client";
import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  CircularProgress,
  IconButton,
  Container,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import {
  ArrowForward,
  ArrowBack,
  Check,
  Add,
  Delete,
  CheckCircle,
  CalendarMonth,
  CalendarViewWeek,
} from "@mui/icons-material";
import BackButton from "@/components/BackButton";
import moment, { type Moment } from "moment";

const categories = [
  { value: "outreach", label: "Community Outreach" },
  { value: "community_service", label: "Community Service" },
  { value: "administrative", label: "Administrative Work" },
];

const steps = [
  "Choose Method",
  "Select Period",
  "Enter Hours",
  "Activity Details",
  "Review & Submit",
];

interface DetailedActivity {
  id: string;
  category: string;
  description: string;
  hours: string;
}

function TimeEntryFormComponent({ params }: { params: { email: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const email = decodeURIComponent(params.email);

  const [currentStep, setCurrentStep] = useState(0);
  const [entryMethod, setEntryMethod] = useState<"weekly" | "monthly" | "">("");
  const [shouldUpdatePreference, setShouldUpdatePreference] = useState(false);

  const [selectedDate, setSelectedDate] = useState<Moment>(moment());
  const [totalHours, setTotalHours] = useState("");
  const [detailedActivities, setDetailedActivities] = useState<
    DetailedActivity[]
  >([{ id: crypto.randomUUID(), category: "", description: "", hours: "" }]);
  const [location, setLocation] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const initializeForm = async () => {
      setLoading(true);
      if (editId) {
        try {
          const response = await fetch(`/api/missionary/hours/${editId}`);
          if (!response.ok)
            throw new Error("Failed to fetch entry for editing.");
          const entryData = await response.json();
          setEntryMethod(entryData.entry_method);
          setSelectedDate(moment(entryData.period_start_date));
          setTotalHours(String(entryData.total_hours));
          setLocation(entryData.location || "");
          setDetailedActivities(
            entryData.activities.map((act: any) => ({
              ...act,
              id: crypto.randomUUID(),
              hours: String(act.hours),
            }))
          );
          setCurrentStep(1); // Start at step 2 for editing
        } catch (err: any) {
          setError(err.message);
        }
      } else {
        // Fetch preference for new entries
        try {
          const response = await fetch(`/api/missionary/${email}/preference`);
          if (response.ok) {
            const data = await response.json();
            if (data.preference) {
              setEntryMethod(data.preference);
              setCurrentStep(1);
            }
          }
        } catch (err) {
          console.error("Failed to fetch preference", err);
        }
      }
      setLoading(false);
    };
    initializeForm();
  }, [editId, email]);

  const handleNext = () => setCurrentStep((prev) => prev + 1);
  const handleBack = () => setCurrentStep((prev) => prev - 1);

  const resetForm = () => {
    router.push(`${rootUrl}/admin-dashboard/missionary-portal/${email}`);
  };

  const addActivity = () => {
    setDetailedActivities([
      ...detailedActivities,
      { id: crypto.randomUUID(), category: "", description: "", hours: "" },
    ]);
  };

  const removeActivity = (id: string) => {
    setDetailedActivities(detailedActivities.filter((act) => act.id !== id));
  };

  const updateActivity = (
    id: string,
    field: keyof Omit<DetailedActivity, "id">,
    value: string
  ) => {
    setDetailedActivities(
      detailedActivities.map((act) =>
        act.id === id ? { ...act, [field]: value } : act
      )
    );
  };

  const assignedHours = useMemo(
    () =>
      detailedActivities.reduce(
        (sum, act) => sum + (Number.parseFloat(act.hours) || 0),
        0
      ),
    [detailedActivities]
  );

  const remainingHours = useMemo(
    () => (Number.parseFloat(totalHours) || 0) - assignedHours,
    [totalHours, assignedHours]
  );

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Overlap check only for new entries
      if (!editId) {
        const overlapCheck = await fetch(
          `/api/missionary/hours/check-overlap`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email,
              entryMethod,
              date: selectedDate.toISOString(),
            }),
          }
        );
        const overlapResult = await overlapCheck.json();
        if (!overlapCheck.ok)
          throw new Error(
            overlapResult.error || "Failed to check for overlap."
          );
        if (overlapResult.overlap) {
          throw new Error(
            `You have already logged hours for this ${entryMethod}. Please select a different period.`
          );
        }
      }

      const payload = {
        entryMethod,
        period_start_date: selectedDate
          .clone()
          .startOf(entryMethod as "week" | "month")
          .toISOString(),
        total_hours: Number(totalHours),
        activities: detailedActivities.map(({ id, ...rest }) => ({
          ...rest,
          hours: Number(rest.hours),
        })),
        location,
      };

      const url = editId
        ? `/api/missionary/hours/${editId}`
        : "/api/missionary/hours";
      const method = editId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          editId
            ? payload
            : {
                ...payload,
                email: email,
                date: selectedDate.toISOString(),
                updatePreference: shouldUpdatePreference,
              }
        ),
      });

      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Failed to submit hours.");

      setIsSuccess(true);
      setCurrentStep(5);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const rootUrl = process.env.NEXT_PUBLIC_ENVIRONMENT === "dev" ? "/mht" : "";

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const periodStart = selectedDate
    .clone()
    .startOf(entryMethod === "weekly" ? "week" : "month");
  const periodEnd = selectedDate
    .clone()
    .endOf(entryMethod === "weekly" ? "week" : "month");

  return (
    <Box sx={{ position: "relative" }}>
      <LocalizationProvider dateAdapter={AdapterMoment}>
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
          <Box>
            <Box sx={{ p: 3, textAlign: "center" }}>
              <BackButton
                href={`${rootUrl}/admin-dashboard/missionary-portal/${email}`}
                sx={{ mb: 2, position: "absolute", left: 2, top: 2 }}
              />
              <Typography
                variant="h3"
                component="h1"
                fontWeight="bold"
                gutterBottom
              >
                {editId ? "Edit" : "Log"} Your Volunteer Hours
              </Typography>
              <Typography variant="h5" color="text.secondary">
                We'll help you step by step
              </Typography>
            </Box>
            <Box sx={{ mb: 4 }}>
              <Stepper activeStep={currentStep} alternativeLabel>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>
            <Card
              elevation={3}
              sx={{ minHeight: 500, display: "flex", flexDirection: "column" }}
            >
              <CardContent sx={{ p: 4, flexGrow: 1 }}>
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
                    <Typography
                      variant="h6"
                      color="text.secondary"
                      sx={{ mb: 4 }}
                    >
                      Choose your preferred method. We'll remember it for next
                      time.
                    </Typography>
                    <Grid container spacing={2} justifyContent="center">
                      <Grid item xs={12} sm={5}>
                        <Button
                          variant={
                            entryMethod === "weekly" ? "contained" : "outlined"
                          }
                          onClick={() => {
                            setEntryMethod("weekly");
                            setShouldUpdatePreference(true);
                          }}
                          sx={{
                            height: 100,
                            width: "100%",
                            flexDirection: "column",
                          }}
                        >
                          <CalendarViewWeek sx={{ mb: 1 }} />
                          Weekly
                        </Button>
                      </Grid>
                      <Grid item xs={12} sm={5}>
                        <Button
                          variant={
                            entryMethod === "monthly" ? "contained" : "outlined"
                          }
                          onClick={() => {
                            setEntryMethod("monthly");
                            setShouldUpdatePreference(true);
                          }}
                          sx={{
                            height: 100,
                            width: "100%",
                            flexDirection: "column",
                          }}
                        >
                          <CalendarMonth sx={{ mb: 1 }} />
                          Monthly
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                )}
                {currentStep === 1 && (
                  <Box sx={{ textAlign: "center" }}>
                    <Typography
                      variant="h4"
                      component="h2"
                      fontWeight="bold"
                      gutterBottom
                    >
                      Which {entryMethod === "weekly" ? "Week" : "Month"}?
                    </Typography>
                    <Typography
                      variant="h6"
                      color="text.secondary"
                      sx={{ mb: 4 }}
                    >
                      Select any day within the desired period.
                    </Typography>
                    <Box
                      sx={{ display: "flex", justifyContent: "center", mb: 3 }}
                    >
                      {entryMethod === "monthly" ? (
                        <DatePicker
                          label="Select Month"
                          value={selectedDate}
                          onChange={(date) => date && setSelectedDate(date)}
                          views={["year", "month"]}
                        />
                      ) : (
                        <DatePicker
                          label="Select Day in Week"
                          value={selectedDate}
                          onChange={(date) => date && setSelectedDate(date)}
                        />
                      )}
                    </Box>
                    <Paper sx={{ p: 2, bgcolor: "grey.100" }}>
                      <Typography variant="h6">
                        Selected Period: {periodStart.format("MMM D")} -{" "}
                        {periodEnd.format("MMM D, YYYY")}
                      </Typography>
                    </Paper>
                  </Box>
                )}
                {currentStep === 2 && (
                  <Box sx={{ textAlign: "center" }}>
                    <Typography
                      variant="h4"
                      component="h2"
                      fontWeight="bold"
                      gutterBottom
                    >
                      How many hours in total?
                    </Typography>
                    <TextField
                      type="number"
                      label={`Total hours for the ${entryMethod}`}
                      value={totalHours}
                      onChange={(e) => setTotalHours(e.target.value)}
                      inputProps={{ step: "0.25", min: "0" }}
                      sx={{ maxWidth: 300, mx: "auto" }}
                    />
                  </Box>
                )}
                {currentStep === 3 && (
                  <Box>
                    <Typography
                      variant="h4"
                      component="h2"
                      fontWeight="bold"
                      gutterBottom
                      align="center"
                    >
                      What did you do?
                    </Typography>
                    <Typography
                      variant="h6"
                      color="text.secondary"
                      align="center"
                      sx={{ mb: 2 }}
                    >
                      Allocate your {totalHours} hours across your activities.
                    </Typography>
                    <Alert
                      severity={
                        // success warning error
                        remainingHours === 0
                          ? "success"
                          : remainingHours < 0
                          ? "error"
                          : "warning"
                      }
                      sx={{ mb: 2 }}
                    >
                      Total: {totalHours || 0}h
                      {remainingHours > 0 && (
                        <> - Remaining: {remainingHours.toFixed(2)}h</>
                      )}
                      {remainingHours < 0 && (
                        <>
                          - Over-allocated:{" "}
                          {Math.abs(remainingHours).toFixed(2)}h
                        </>
                      )}
                    </Alert>
                    {detailedActivities.map((activity, idx) => {
                      // Get all selected categories except for this activity
                      const selectedCategories = detailedActivities
                        .filter((a, i) => i !== idx)
                        .map((a) => a.category)
                        .filter(Boolean);
                      return (
                        <Paper
                          key={activity.id}
                          sx={{ p: 2, mb: 2, border: "1px solid #ddd" }}
                        >
                          <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={5}>
                              <FormControl fullWidth>
                                <InputLabel>Category</InputLabel>
                                <Select
                                  value={activity.category}
                                  label="Category"
                                  onChange={(e) =>
                                    updateActivity(
                                      activity.id,
                                      "category",
                                      e.target.value
                                    )
                                  }
                                >
                                  {categories.map((cat) => (
                                    <MenuItem
                                      key={cat.value}
                                      value={cat.value}
                                      disabled={selectedCategories.includes(
                                        cat.value
                                      )}
                                    >
                                      {cat.label}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                              <TextField
                                fullWidth
                                type="number"
                                label="Hours"
                                value={activity.hours}
                                onChange={(e) =>
                                  updateActivity(
                                    activity.id,
                                    "hours",
                                    e.target.value
                                  )
                                }
                              />
                            </Grid>
                            <Grid item xs={6} sm={4}>
                              {detailedActivities.length > 1 && (
                                <IconButton
                                  onClick={() => removeActivity(activity.id)}
                                  color="error"
                                >
                                  <Delete />
                                </IconButton>
                              )}
                            </Grid>
                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                multiline
                                rows={2}
                                label="Description"
                                value={activity.description}
                                onChange={(e) =>
                                  updateActivity(
                                    activity.id,
                                    "description",
                                    e.target.value
                                  )
                                }
                              />
                            </Grid>
                          </Grid>
                        </Paper>
                      );
                    })}
                    {
                      // less than three activites
                      detailedActivities.length < 3 && (
                        <Button startIcon={<Add />} onClick={addActivity}>
                          Add Activity
                        </Button>
                      )
                    }
                  </Box>
                )}
                {currentStep === 4 && (
                  <Box>
                    <Typography
                      variant="h4"
                      component="h2"
                      fontWeight="bold"
                      gutterBottom
                      align="center"
                    >
                      Review & Submit
                    </Typography>
                    <Paper sx={{ p: 3, bgcolor: "grey.50" }}>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography fontWeight="bold">Period:</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography>
                            {periodStart.format("MMM D")} -{" "}
                            {periodEnd.format("MMM D, YYYY")}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography fontWeight="bold">
                            Total Hours:
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography>{totalHours} hours</Typography>
                        </Grid>
                      </Grid>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="h6" fontWeight="bold">
                        Activity Breakdown:
                      </Typography>
                      {detailedActivities.map((act) => (
                        <Box
                          key={act.id}
                          sx={{
                            my: 1,
                            p: 1,
                            border: "1px solid #eee",
                            borderRadius: 1,
                          }}
                        >
                          <Typography fontWeight="medium">
                            {
                              categories.find((c) => c.value === act.category)
                                ?.label
                            }{" "}
                            ({act.hours}h)
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {act.description}
                          </Typography>
                        </Box>
                      ))}
                    </Paper>
                    {error && (
                      <Alert severity="error" sx={{ mt: 2 }}>
                        {error}
                      </Alert>
                    )}
                  </Box>
                )}
                {currentStep === 5 && (
                  <Box sx={{ textAlign: "center" }}>
                    <CheckCircle
                      sx={{ fontSize: 80, color: "success.main", mb: 2 }}
                    />
                    <Typography
                      variant="h3"
                      component="h2"
                      fontWeight="bold"
                      color="success.main"
                    >
                      Success!
                    </Typography>
                    <Typography
                      variant="h5"
                      color="text.secondary"
                      sx={{ mb: 4 }}
                    >
                      Your volunteer hours have been{" "}
                      {editId ? "updated" : "recorded"}.
                    </Typography>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={resetForm}
                    >
                      Back to Portal
                    </Button>
                  </Box>
                )}
              </CardContent>
              {currentStep < 5 && (
                <Box
                  sx={{
                    p: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    borderTop: "1px solid #ddd",
                  }}
                >
                  <Button
                    startIcon={<ArrowBack />}
                    onClick={handleBack}
                    disabled={
                      currentStep === 0 ||
                      (currentStep === 1 && !shouldUpdatePreference && !editId)
                    }
                  >
                    Back
                  </Button>
                  {currentStep < 4 ? (
                    <Button
                      variant="contained"
                      endIcon={<ArrowForward />}
                      onClick={handleNext}
                    >
                      Continue
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="success"
                      endIcon={
                        loading ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          <Check />
                        )
                      }
                      onClick={handleSubmit}
                      disabled={loading}
                    >
                      {loading
                        ? "Submitting..."
                        : editId
                        ? "Update Hours"
                        : "Submit Hours"}
                    </Button>
                  )}
                </Box>
              )}
            </Card>
          </Box>
        </Container>
      </LocalizationProvider>
    </Box>
  );
}

export default function LogHoursPage({
  params,
}: {
  params: { email: string };
}) {
  return (
    <Suspense
      fallback={
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <CircularProgress />
        </Box>
      }
    >
      <TimeEntryFormComponent params={params} />
    </Suspense>
  );
}
