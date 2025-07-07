"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Tabs,
  Tab,
  Grid,
  AppBar,
  Toolbar,
  Container,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  AccessTime,
  Add,
  CalendarToday,
  TrendingUp,
  Person,
  ExitToApp,
  Schedule,
} from "@mui/icons-material";

interface MissionaryHour {
  id: string;
  date: string;
  hours: number;
  activity_description: string;
  category: string;
  location: string;
  approval_status: "pending" | "approved" | "rejected";
  created_at: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function MissionaryDashboard({
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
  const router = useRouter();
  const [hours, setHours] = useState<MissionaryHour[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState({
    totalHours: 0,
    thisWeekHours: 0,
    thisMonthHours: 0,
    pendingHours: 0,
  });

  useEffect(() => {
    if (paramsLoaded && email) {
      fetchDashboardData();
    }
  }, [paramsLoaded, email]);

  const fetchDashboardData = async () => {
    try {
      const hoursResponse = await fetch("/api/missionary/hours");
      if (hoursResponse.ok) {
        const { hours: hoursData } = await hoursResponse.json();
        setHours(hoursData);
        calculateStats(hoursData);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (hoursData: MissionaryHour[]) => {
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalHours = hoursData.reduce((sum, h) => sum + h.hours, 0);
    const thisWeekHours = hoursData
      .filter((h) => new Date(h.date) >= weekStart)
      .reduce((sum, h) => sum + h.hours, 0);
    const thisMonthHours = hoursData
      .filter((h) => new Date(h.date) >= monthStart)
      .reduce((sum, h) => sum + h.hours, 0);
    const pendingHours = hoursData
      .filter((h) => h.approval_status === "pending")
      .reduce((sum, h) => sum + h.hours, 0);

    setStats({ totalHours, thisWeekHours, thisMonthHours, pendingHours });
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/missionary/auth/logout", { method: "POST" });
      router.push("/missionary/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      general: "default",
      outreach: "primary",
      administration: "secondary",
      training: "success",
      community_service: "warning",
      other: "info",
    };
    return colors[category as keyof typeof colors] || "default";
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "warning",
      approved: "success",
      rejected: "error",
    };
    return colors[status as keyof typeof colors] || "default";
  };

  if (loading || !paramsLoaded) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Loading...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      {/* Header */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Person sx={{ mr: 2, color: "primary.main" }} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h5" component="h1" fontWeight="bold">
              Missionary Portal
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Welcome back {email}!
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<ExitToApp />}
            onClick={handleLogout}
            size="large"
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      gutterBottom
                      fontWeight="medium"
                    >
                      Total Hours
                    </Typography>
                    <Typography
                      variant="h3"
                      fontWeight="bold"
                      color="primary.main"
                    >
                      {stats.totalHours}
                    </Typography>
                  </Box>
                  <AccessTime sx={{ fontSize: 48, color: "primary.main" }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      gutterBottom
                      fontWeight="medium"
                    >
                      This Week
                    </Typography>
                    <Typography
                      variant="h3"
                      fontWeight="bold"
                      color="success.main"
                    >
                      {stats.thisWeekHours}
                    </Typography>
                  </Box>
                  <CalendarToday sx={{ fontSize: 48, color: "success.main" }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      gutterBottom
                      fontWeight="medium"
                    >
                      This Month
                    </Typography>
                    <Typography
                      variant="h3"
                      fontWeight="bold"
                      color="secondary.main"
                    >
                      {stats.thisMonthHours}
                    </Typography>
                  </Box>
                  <TrendingUp sx={{ fontSize: 48, color: "secondary.main" }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      gutterBottom
                      fontWeight="medium"
                    >
                      Pending
                    </Typography>
                    <Typography
                      variant="h3"
                      fontWeight="bold"
                      color="warning.main"
                    >
                      {stats.pendingHours}
                    </Typography>
                  </Box>
                  <Schedule sx={{ fontSize: 48, color: "warning.main" }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Main Content */}
        <Paper elevation={2} sx={{ mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: 2,
              borderBottom: 1,
              borderColor: "divider",
            }}
          >
            <Tabs
              value={tabValue}
              onChange={(e, newValue) => setTabValue(newValue)}
            >
              <Tab
                label="Recent Hours"
                sx={{ fontSize: "1.1rem", fontWeight: "medium" }}
              />
              <Tab
                label="Quick Log"
                sx={{ fontSize: "1.1rem", fontWeight: "medium" }}
              />
            </Tabs>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => router.push(`./${email}/hours`)}
              size="large"
            >
              Log New Hours
            </Button>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Box>
              <Typography variant="h5" gutterBottom fontWeight="bold">
                Recent Hour Logs
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Your recent volunteer hour submissions
              </Typography>

              {hours.length === 0 ? (
                <Alert
                  severity="info"
                  sx={{ textAlign: "center", fontSize: "1.1rem" }}
                >
                  No hours logged yet. Start by logging your first entry!
                </Alert>
              ) : (
                <List>
                  {hours.slice(0, 10).map((hour, index) => (
                    <Box key={hour.id}>
                      <ListItem sx={{ px: 0, py: 2 }}>
                        <ListItemText
                          primary={
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                mb: 1,
                              }}
                            >
                              <Chip
                                label={hour.category.replace("_", " ")}
                                color={getCategoryColor(hour.category) as any}
                                size="medium"
                              />
                              <Chip
                                label={hour.approval_status}
                                color={
                                  getStatusColor(hour.approval_status) as any
                                }
                                size="medium"
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography
                                variant="h6"
                                sx={{ mb: 0.5, fontWeight: "medium" }}
                              >
                                {hour.activity_description}
                              </Typography>
                              <Typography
                                variant="body1"
                                color="text.secondary"
                              >
                                {new Date(hour.date).toLocaleDateString()} •{" "}
                                {hour.location || "No location specified"}
                              </Typography>
                            </Box>
                          }
                        />
                        <Box sx={{ textAlign: "right" }}>
                          <Typography
                            variant="h4"
                            fontWeight="bold"
                            color="primary.main"
                          >
                            {hour.hours}h
                          </Typography>
                        </Box>
                      </ListItem>
                      {index < hours.slice(0, 10).length - 1 && <Divider />}
                    </Box>
                  ))}
                </List>
              )}
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box sx={{ textAlign: "center", py: 6 }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
                Use the dedicated hour logging page for the best experience
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => router.push("/missionary/hours/log")}
                size="large"
              >
                Go to Hour Logging
              </Button>
            </Box>
          </TabPanel>
        </Paper>
      </Container>
    </Box>
  );
}
