"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Alert,
  Grid,
  Card,
  CardContent,
  Paper,
  List,
  ListItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  ExpandMore,
  Person,
  Close,
  CalendarViewWeek,
  CalendarMonth,
} from "@mui/icons-material";
import MissionaryLogHoursDialog from "@/components/MissionaryLogHoursDialog";
import moment, { type Moment } from "moment";

interface DetailedActivity {
  id: string;
  category: string;
  description: string;
  hours: string;
}

interface MissionaryHourEntry {
  id: string;
  period_start_date: string;
  entry_method: "weekly" | "monthly";
  total_hours: number;
  location: string | null;
  activities: DetailedActivity[];
  created_at: string;
}

const categoryDisplay: { [key: string]: { label: string; color: any } } = {
  outreach: { label: "Community Outreach", color: "primary" },
  community_service: { label: "Community Service", color: "warning" },
  administrative: { label: "Administrative Work", color: "secondary" },
};

export default function MissionaryDashboard({
  params,
}: {
  params: { email: string };
}) {
  const router = useRouter();
  const email = decodeURIComponent(params.email);
  const [hours, setHours] = useState<MissionaryHourEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalHours: 0,

    thisMonthHours: 0,
  });
  const [error, setError] = useState<string | null>(null);

  // Show More state for recent hours
  const [visibleHoursCount, setVisibleHoursCount] = useState(3);

  // Dialog states
  const [methodDialogOpen, setMethodDialogOpen] = useState(false);
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);

  // Form states
  const [entryMethod, setEntryMethod] = useState<"weekly" | "monthly" | "">("");
  const [selectedDate, setSelectedDate] = useState<Moment>(moment());
  const [totalHours, setTotalHours] = useState("");
  const [activities, setActivities] = useState<DetailedActivity[]>([
    { id: crypto.randomUUID(), category: "", description: "", hours: "" },
  ]);
  const [location, setLocation] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const hoursResponse = await fetch(`/api/missionary/${email}/hours`);
      if (!hoursResponse.ok) {
        throw new Error("Failed to fetch data.");
      }
      const { hours: hoursData } = await hoursResponse.json();
      setHours(hoursData);
      calculateStats(hoursData);
    } catch (err: any) {
      setError(err.message);
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (email) {
      fetchDashboardData();
    }
  }, [email]);

  const calculateStats = (hoursData: MissionaryHourEntry[]) => {
    const now = moment();
    const totalHours = hoursData.reduce(
      (sum, h) => sum + Number(h.total_hours),
      0
    );

    const thisMonthHours = hoursData
      .filter((h) => moment(h.period_start_date).isSame(now, "month"))
      .reduce((sum, h) => sum + Number(h.total_hours), 0);

    setStats({ totalHours, thisMonthHours });
  };

  const resetForm = () => {
    setEntryMethod("");
    setSelectedDate(moment());
    setTotalHours("");
    setActivities([
      { id: crypto.randomUUID(), category: "", description: "", hours: "" },
    ]);
    setLocation("");
    setEditingId(null);
  };

  const handleLogHours = async () => {
    // Check if user has a preference

    setLogDialogOpen(true);
  };

  const handleMethodSelect = (method: "weekly" | "monthly") => {
    setEntryMethod(method);
    setMethodDialogOpen(false);
    setLogDialogOpen(true);
  };

  const handleEdit = async (id: string) => {
    try {
      const response = await fetch(`/api/missionary/hours/${id}`);
      if (!response.ok) throw new Error("Failed to fetch entry for editing.");

      const entryData = await response.json();
      setEditingId(id);
      setEntryMethod(entryData.entry_method);
      setSelectedDate(moment(entryData.period_start_date));
      setTotalHours(String(entryData.total_hours));
      setLocation(entryData.location || "");
      setActivities(
        entryData.activities.map((act: any) => ({
          ...act,
          id: crypto.randomUUID(),
          hours: String(act.hours),
        }))
      );
      setLogDialogOpen(true);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      // Calculate total hours from activities
      const totalActivityHours = activities.reduce(
        (sum, act) => sum + (Number(act.hours) || 0),
        0
      );

      // Validation
      if (totalActivityHours < 0) {
        throw new Error("Please enter valid hours.");
      }

      // Calculate period start date consistently
      const momentUnit = entryMethod === "weekly" ? "week" : "month";
      const periodStartDate = selectedDate.clone().startOf(momentUnit);

      const payload = {
        entryMethod,
        period_start_date: periodStartDate.format("YYYY-MM-DD"), // Use consistent format
        total_hours: totalActivityHours, // Use calculated total from activities
        activities: activities.map(({ id, ...rest }) => ({
          ...rest,
          hours: Number(rest.hours),
        })),
        location,
      };

      const url = editingId
        ? `/api/missionary/hours/${editingId}`
        : "/api/missionary/hours";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          editingId
            ? payload
            : {
                ...payload,
                email: email,
                date: selectedDate.toISOString(),
                updatePreference: !editingId, // Update preference for new entries
              }
        ),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to submit hours.");
      }

      // Success - close dialog and refresh data
      setLogDialogOpen(false);
      resetForm();
      fetchDashboardData();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const removeActivity = (id: string) => {
    setActivities((prev) => prev.filter((act) => act.id !== id));
  };

  const updateActivity = (
    id: string,
    field: keyof Omit<DetailedActivity, "id">,
    value: string
  ) => {
    setActivities((prev) =>
      prev.map((act) => (act.id === id ? { ...act, [field]: value } : act))
    );
  };

  const handleOpenDeleteDialog = (id: string) => {
    setEntryToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setEntryToDelete(null);
    setDeleteDialogOpen(false);
  };

  const handleDeleteEntry = async () => {
    if (!entryToDelete) return;

    try {
      const response = await fetch(`/api/missionary/hours/${entryToDelete}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete entry.");

      fetchDashboardData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      handleCloseDeleteDialog();
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Person sx={{ mr: 2, color: "primary.main" }} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h5" component="h1" fontWeight="bold">
              Missionary Hours
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Welcome back, {email}!
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 4 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleLogHours}
            sx={{ height: 120, fontSize: "2.25rem", px: 4 }}
            fullWidth
          >
            <Add sx={{ mr: 1, fontSize: "2.25rem" }} />
            Log New Hours
          </Button>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6}>
            <Card elevation={2}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Hours
                </Typography>
                <Typography
                  variant="h3"
                  component="div"
                  fontWeight="bold"
                  color="primary.main"
                >
                  {stats.totalHours}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Card elevation={2}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  This Month
                </Typography>
                <Typography
                  variant="h3"
                  component="div"
                  fontWeight="bold"
                  color="secondary.main"
                >
                  {stats.thisMonthHours}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {hours.length === 0 ? (
          <Paper elevation={2}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
              <Alert severity="info" sx={{ m: 2 }}>
                No hours logged yet.
              </Alert>
            </Box>
          </Paper>
        ) : (
          <>
            <Paper elevation={2}>
              <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
                <Typography variant="h5" fontWeight="bold">
                  Recent Hour Logs
                </Typography>
              </Box>
              {/* Column Headers */}
              <Box
                sx={{
                  px: 2,
                  py: 1,

                  borderBottom: 1,
                  borderColor: "divider",
                }}
              >
                <Grid container alignItems="center">
                  <Grid item xs={12} sm={3}>
                    <Typography variant="h6" fontWeight="bold">
                      Month
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={2}>
                    <Typography variant="h6" fontWeight="bold">
                      Total Hours
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="h6" fontWeight="bold">
                      Date Logged
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4} sx={{ textAlign: "right" }}>
                    <Typography variant="h6" fontWeight="bold">
                      Actions
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
              <Box sx={{ p: 2 }}>
                <List sx={{ p: 0 }}>
                  {hours
                    .slice()
                    .sort(
                      (a, b) =>
                        new Date(b.period_start_date).getTime() -
                        new Date(a.period_start_date).getTime()
                    )
                    .slice(0, visibleHoursCount)
                    .map((entry, index, arr) => (
                      <ListItem
                        key={entry.id}
                        sx={{
                          flexDirection: "column",
                          alignItems: "stretch",
                          p: 0,
                        }}
                      >
                        <Accordion
                          sx={{
                            width: "100%",
                            boxShadow: "none",
                            "&:before": { display: "none" },
                          }}
                        >
                          <AccordionSummary expandIcon={<ExpandMore />}>
                            <Grid container alignItems="center" spacing={2}>
                              <Grid item xs={12} sm={3}>
                                <Typography variant="h6">
                                  {moment(entry.period_start_date).format(
                                    "MMMM"
                                  )}
                                </Typography>
                              </Grid>
                              <Grid item xs={6} sm={2}>
                                <Chip
                                  label={`${entry.total_hours} hours`}
                                  color="primary"
                                />
                              </Grid>
                              <Grid item xs={6} sm={3}>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {moment(entry.created_at).format(
                                    "YYYY-MM-DD"
                                  )}
                                </Typography>
                              </Grid>
                              <Grid
                                item
                                xs={4}
                                sm={4}
                                sx={{ textAlign: "right" }}
                              >
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(entry.id);
                                  }}
                                >
                                  <Edit />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenDeleteDialog(entry.id);
                                  }}
                                >
                                  <Delete />
                                </IconButton>
                              </Grid>
                            </Grid>
                          </AccordionSummary>
                          <AccordionDetails sx={{ bgcolor: "grey.50" }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Activity Breakdown:
                            </Typography>
                            {entry.activities.map((act, actIdx) => (
                              <Paper
                                key={actIdx}
                                variant="outlined"
                                sx={{ p: 1.5, mb: 1 }}
                              >
                                <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  <Chip
                                    label={
                                      categoryDisplay[act.category]?.label ||
                                      act.category
                                    }
                                    color={
                                      categoryDisplay[act.category]?.color ||
                                      "default"
                                    }
                                    size="small"
                                  />
                                  <Typography fontWeight="bold">
                                    {act.hours}
                                  </Typography>
                                  <Grid item xs={6} sm={3}></Grid>
                                </Box>
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                  {act.description}
                                </Typography>
                              </Paper>
                            ))}
                          </AccordionDetails>
                        </Accordion>
                        {index !== arr.length - 1 && <Divider />}
                      </ListItem>
                    ))}
                  {/* Show More button logic */}
                  {hours.length > visibleHoursCount && (
                    <Box
                      sx={{ display: "flex", justifyContent: "center", mt: 2 }}
                    >
                      <Button
                        variant="outlined"
                        onClick={() => setVisibleHoursCount((prev) => prev + 5)}
                      >
                        Show More
                      </Button>
                    </Box>
                  )}
                </List>
              </Box>
            </Paper>
          </>
        )}

        {/* Recent Hour Logs */}
      </Container>

      {/* Method selection dialog removed. Only monthly entry method is allowed. */}

      {/* Log Hours Dialog */}
      <MissionaryLogHoursDialog
        open={logDialogOpen}
        onClose={() => {
          setLogDialogOpen(false);

          resetForm();
        }}
        entryMethod={"monthly"}
        setEntryMethod={() => {}}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        totalHours={totalHours}
        setTotalHours={setTotalHours}
        activities={activities}
        setActivities={setActivities}
        addActivity={() =>
          setActivities((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              category: "",
              description: "",
              hours: "",
            },
          ])
        }
        removeActivity={removeActivity}
        updateActivity={updateActivity}
        location={location}
        setLocation={setLocation}
        error={error}
        submitting={submitting}
        handleSubmit={handleSubmit}
        editingId={editingId}
        resetForm={resetForm}
        isVolunteer={false}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Hour Log?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to permanently delete this hour log? This
            action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteEntry} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
