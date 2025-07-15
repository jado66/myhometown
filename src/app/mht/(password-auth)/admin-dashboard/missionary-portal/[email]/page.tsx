"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Grid,
  AppBar,
  Toolbar,
  Container,
  Paper,
  List,
  ListItem,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { Add, Person, Edit, Delete, ExpandMore } from "@mui/icons-material";
import moment from "moment";

interface DetailedActivity {
  category: string;
  description: string;
  hours: number;
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
    thisWeekHours: 0,
    thisMonthHours: 0,
  });
  const [error, setError] = useState<string | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);

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

    const thisWeekHours = hoursData
      .filter((h) => moment(h.period_start_date).isSame(now, "week"))
      .reduce((sum, h) => sum + Number(h.total_hours), 0);

    const thisMonthHours = hoursData
      .filter((h) => moment(h.period_start_date).isSame(now, "month"))
      .reduce((sum, h) => sum + Number(h.total_hours), 0);

    setStats({ totalHours, thisWeekHours, thisMonthHours });
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
      // Refresh data after delete
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
              Missionary Portal
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Welcome back, {email}!
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => router.push(`./${email}/hours`)}
            size="large"
          >
            Log New Hours
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Total Hours */}
          <Grid item xs={12} sm={4}>
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
          {/* This Week */}
          <Grid item xs={12} sm={4}>
            <Card elevation={2}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  This Week
                </Typography>
                <Typography
                  variant="h3"
                  component="div"
                  fontWeight="bold"
                  color="success.main"
                >
                  {stats.thisWeekHours}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          {/* This Month */}
          <Grid item xs={12} sm={4}>
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

        {/* Main Content */}
        <Paper elevation={2}>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
            <Typography variant="h5" fontWeight="bold">
              Recent Hour Logs
            </Typography>
          </Box>
          <Box sx={{ p: 2 }}>
            {hours.length === 0 ? (
              <Alert severity="info" sx={{ m: 2 }}>
                No hours logged yet.
              </Alert>
            ) : (
              <List sx={{ p: 0 }}>
                {hours.map((entry) => (
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
                          <Grid item xs={12} sm={5}>
                            <Typography variant="h6">
                              {entry.entry_method === "weekly"
                                ? "Week of "
                                : "Month of "}
                              {moment(entry.period_start_date).format(
                                "MMMM D, YYYY"
                              )}
                            </Typography>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Chip
                              label={`${entry.total_hours} hours`}
                              color="primary"
                            />
                          </Grid>
                          <Grid item xs={6} sm={4} sx={{ textAlign: "right" }}>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(
                                  `./${email}/hours?edit=${entry.id}`
                                );
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
                        {entry.activities.map((act, index) => (
                          <Paper
                            key={index}
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
                                {act.hours}h
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              {act.description}
                            </Typography>
                          </Paper>
                        ))}
                      </AccordionDetails>
                    </Accordion>
                    <Divider />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </Paper>
      </Container>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Hour Log?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to permanently delete this hour log? This
            action cannot be undone.
          </DialogContentText>
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
