"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  AppBar,
  Toolbar,
  Container,
  Avatar,
  Menu,
  ListItemIcon,
  ListItemText,
  Tabs,
  Tab,
  Alert,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  MoreVert,
  Person,
  Search,
  Schedule,
  Assessment,
  AccessTime,
  TrendingUp,
  CalendarToday,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment from "moment";

interface Missionary {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_picture_url?: string;
  city_id?: string;
  community_id?: string;
  assignment_status: "active" | "inactive" | "unassigned";
  contact_number?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface City {
  id: string;
  name: string;
  state: string;
  country: string;
}

interface Community {
  id: string;
  name: string;
  city_id: string;
  state: string;
  country: string;
}

interface MissionaryHours {
  missionary_email: string;
  total_hours: number;
  this_month_hours: number;
  this_week_hours: number;
  last_entry_date: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function MissionaryManagement() {
  const [tabValue, setTabValue] = useState(0);
  const [missionaries, setMissionaries] = useState<Missionary[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [missionaryHours, setMissionaryHours] = useState<MissionaryHours[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bulkHoursDialogOpen, setBulkHoursDialogOpen] = useState(false);
  const [editingMissionary, setEditingMissionary] = useState<Missionary | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMissionary, setSelectedMissionary] =
    useState<Missionary | null>(null);

  // Bulk hours form data
  const [bulkHoursData, setBulkHoursData] = useState({
    missionary_emails: [] as string[],
    date: moment(),
    hours: "",
    activity_description: "",
    category: "general",
    location: "",
  });

  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    city_id: "",
    community_id: "",
    assignment_status: "active" as "active" | "inactive" | "unassigned",
    contact_number: "",
    notes: "",
  });

  const categories = [
    { value: "general", label: "General Activities" },
    { value: "outreach", label: "Community Outreach" },
    { value: "administration", label: "Office Work" },
    { value: "training", label: "Training & Learning" },
    { value: "community_service", label: "Community Service" },
    { value: "other", label: "Other Activities" },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch missionaries, cities, communities, and hours data
      const [missionariesRes, citiesRes, communitiesRes, hoursRes] =
        await Promise.all([
          fetch("/api/database/missionaries"),
          fetch("/api/database/cities"),
          fetch("/api/database/communities"),
          fetch("/api/missionary/hours/aggregate"),
        ]);

      if (missionariesRes.ok) {
        const { missionaries: missionariesData } = await missionariesRes.json();
        setMissionaries(missionariesData || []);
      }

      if (citiesRes.ok) {
        const { cities: citiesData } = await citiesRes.json();
        setCities(citiesData || []);
      }

      if (communitiesRes.ok) {
        const { communities: communitiesData } = await communitiesRes.json();
        setCommunities(communitiesData || []);
      }

      if (hoursRes.ok) {
        const { hours: hoursData } = await hoursRes.json();
        setMissionaryHours(hoursData || []);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (missionary?: Missionary) => {
    if (missionary) {
      setEditingMissionary(missionary);
      setFormData({
        email: missionary.email,
        first_name: missionary.first_name,
        last_name: missionary.last_name,
        city_id: missionary.city_id || "",
        community_id: missionary.community_id || "",
        assignment_status: missionary.assignment_status,
        contact_number: missionary.contact_number || "",
        notes: missionary.notes || "",
      });
    } else {
      setEditingMissionary(null);
      setFormData({
        email: "",
        first_name: "",
        last_name: "",
        city_id: "",
        community_id: "",
        assignment_status: "active",
        contact_number: "",
        notes: "",
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingMissionary(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingMissionary
        ? `/api/database/missionaries/${editingMissionary.id}`
        : "/api/database/missionaries";

      const method = editingMissionary ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchData();
        handleCloseDialog();
      }
    } catch (error) {
      console.error("Failed to save missionary:", error);
    }
  };

  const handleDelete = async (missionary: Missionary) => {
    if (
      confirm(
        `Are you sure you want to delete ${missionary.first_name} ${missionary.last_name}?`
      )
    ) {
      try {
        const response = await fetch(
          `/api/database/missionaries/${missionary.id}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          await fetchData();
        }
      } catch (error) {
        console.error("Failed to delete missionary:", error);
      }
    }
    setAnchorEl(null);
  };

  const handleBulkHoursSubmit = async () => {
    if (bulkHoursData.missionary_emails.length === 0) {
      alert("Please select at least one missionary");
      return;
    }

    try {
      const promises = bulkHoursData.missionary_emails.map((email) =>
        fetch("/api/missionary/hours", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            date: bulkHoursData.date.format("YYYY-MM-DD"),
            hours: Number.parseFloat(bulkHoursData.hours),
            activity_description: bulkHoursData.activity_description,
            category: bulkHoursData.category,
            location: bulkHoursData.location,
          }),
        })
      );

      await Promise.all(promises);
      setBulkHoursDialogOpen(false);
      setBulkHoursData({
        missionary_emails: [],
        date: moment(),
        hours: "",
        activity_description: "",
        category: "general",
        location: "",
      });
      await fetchData(); // Refresh hours data
      alert(
        `Successfully logged hours for ${bulkHoursData.missionary_emails.length} missionaries`
      );
    } catch (error) {
      console.error("Failed to submit bulk hours:", error);
      alert("Failed to submit bulk hours");
    }
  };

  const filteredMissionaries = missionaries.filter((missionary) => {
    const matchesSearch =
      missionary.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      missionary.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      missionary.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || missionary.assignment_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    const colors = {
      active: "success",
      inactive: "error",
      unassigned: "warning",
    };
    return colors[status as keyof typeof colors] || "default";
  };

  const getCityName = (cityId?: string) => {
    const city = cities.find((c) => c.id === cityId);
    return city ? `${city.name}, ${city.state}` : "Unassigned";
  };

  const getCommunityName = (communityId?: string) => {
    const community = communities.find((c) => c.id === communityId);
    return community ? community.name : "Unassigned";
  };

  const getMissionaryHours = (email: string) => {
    return missionaryHours.find((h) => h.missionary_email === email);
  };

  // Calculate aggregate statistics
  const totalHoursAllMissionaries = missionaryHours.reduce(
    (sum, h) => sum + h.total_hours,
    0
  );
  const totalThisMonth = missionaryHours.reduce(
    (sum, h) => sum + h.this_month_hours,
    0
  );
  const totalThisWeek = missionaryHours.reduce(
    (sum, h) => sum + h.this_week_hours,
    0
  );

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
        {/* Header */}
        <AppBar position="static" color="default" elevation={1}>
          <Toolbar>
            <Person sx={{ mr: 2, color: "primary.main" }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" component="h1" fontWeight="bold">
                Missionary Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage missionaries, view hours, and log bulk entries
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<Schedule />}
                onClick={() => setBulkHoursDialogOpen(true)}
                sx={{ mr: 1 }}
              >
                Bulk Hours
              </Button>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog()}
              >
                Add Missionary
              </Button>
            </Box>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ py: 4 }}>
          {/* Aggregate Hours Summary */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={4}>
              <Card elevation={2}>
                <CardContent sx={{ textAlign: "center", p: 3 }}>
                  <AccessTime
                    sx={{ fontSize: 40, color: "primary.main", mb: 1 }}
                  />
                  <Typography
                    variant="h4"
                    fontWeight="bold"
                    color="primary.main"
                  >
                    {totalHoursAllMissionaries.toLocaleString()}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Total Hours Logged
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card elevation={2}>
                <CardContent sx={{ textAlign: "center", p: 3 }}>
                  <CalendarToday
                    sx={{ fontSize: 40, color: "success.main", mb: 1 }}
                  />
                  <Typography
                    variant="h4"
                    fontWeight="bold"
                    color="success.main"
                  >
                    {totalThisMonth.toLocaleString()}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    This Month
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card elevation={2}>
                <CardContent sx={{ textAlign: "center", p: 3 }}>
                  <TrendingUp
                    sx={{ fontSize: 40, color: "secondary.main", mb: 1 }}
                  />
                  <Typography
                    variant="h4"
                    fontWeight="bold"
                    color="secondary.main"
                  >
                    {totalThisWeek.toLocaleString()}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    This Week
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Tabs */}
          <Paper elevation={2} sx={{ mb: 3 }}>
            <Tabs
              value={tabValue}
              onChange={(e, newValue) => setTabValue(newValue)}
            >
              <Tab
                label="Missionaries"
                sx={{ fontSize: "1.1rem", fontWeight: "medium" }}
              />
              <Tab
                label="Hours Overview"
                sx={{ fontSize: "1.1rem", fontWeight: "medium" }}
              />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              {/* Filters */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        placeholder="Search missionaries..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <Search sx={{ mr: 1, color: "text.secondary" }} />
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <FormControl fullWidth>
                        <InputLabel>Status Filter</InputLabel>
                        <Select
                          value={statusFilter}
                          label="Status Filter"
                          onChange={(e) => setStatusFilter(e.target.value)}
                        >
                          <MenuItem value="all">All Statuses</MenuItem>
                          <MenuItem value="active">Active</MenuItem>
                          <MenuItem value="inactive">Inactive</MenuItem>
                          <MenuItem value="unassigned">Unassigned</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Typography variant="body2" color="text.secondary">
                        {filteredMissionaries.length} missionaries found
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Missionaries Table */}
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Missionary</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>City</TableCell>
                      <TableCell>Community</TableCell>
                      <TableCell>Contact</TableCell>
                      <TableCell>Total Hours</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredMissionaries.map((missionary) => {
                      const hours = getMissionaryHours(missionary.email);
                      return (
                        <TableRow key={missionary.id} hover>
                          <TableCell>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                              }}
                            >
                              <Avatar
                                src={missionary.profile_picture_url}
                                sx={{ width: 40, height: 40 }}
                              >
                                {missionary.first_name[0]}
                                {missionary.last_name[0]}
                              </Avatar>
                              <Box>
                                <Typography variant="body1" fontWeight="medium">
                                  {missionary.first_name} {missionary.last_name}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  ID: {missionary.id.slice(0, 8)}...
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>{missionary.email}</TableCell>
                          <TableCell>
                            <Chip
                              label={missionary.assignment_status}
                              color={
                                getStatusColor(
                                  missionary.assignment_status
                                ) as any
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {getCityName(missionary.city_id)}
                          </TableCell>
                          <TableCell>
                            {getCommunityName(missionary.community_id)}
                          </TableCell>
                          <TableCell>
                            {missionary.contact_number || "N/A"}
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body1"
                              fontWeight="bold"
                              color="primary.main"
                            >
                              {hours?.total_hours || 0}h
                            </Typography>
                            {hours && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {hours.this_month_hours}h this month
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              onClick={(e) => {
                                setAnchorEl(e.currentTarget);
                                setSelectedMissionary(missionary);
                              }}
                            >
                              <MoreVert />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              {/* Hours Overview Table */}
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Missionary</TableCell>
                      <TableCell>Total Hours</TableCell>
                      <TableCell>This Month</TableCell>
                      <TableCell>This Week</TableCell>
                      <TableCell>Last Entry</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {missionaryHours
                      .sort((a, b) => b.total_hours - a.total_hours)
                      .map((hours) => {
                        const missionary = missionaries.find(
                          (m) => m.email === hours.missionary_email
                        );
                        return (
                          <TableRow key={hours.missionary_email} hover>
                            <TableCell>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                }}
                              >
                                <Avatar sx={{ width: 40, height: 40 }}>
                                  {missionary?.first_name?.[0]}
                                  {missionary?.last_name?.[0]}
                                </Avatar>
                                <Box>
                                  <Typography
                                    variant="body1"
                                    fontWeight="medium"
                                  >
                                    {missionary?.first_name}{" "}
                                    {missionary?.last_name}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    {hours.missionary_email}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="h6"
                                fontWeight="bold"
                                color="primary.main"
                              >
                                {hours.total_hours}h
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body1" color="success.main">
                                {hours.this_month_hours}h
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="body1"
                                color="secondary.main"
                              >
                                {hours.this_week_hours}h
                              </Typography>
                            </TableCell>

                            <TableCell>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {hours.last_entry_date
                                  ? moment(hours.last_entry_date).format(
                                      "MMM D, YYYY"
                                    )
                                  : "Never"}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>
          </Paper>
        </Container>

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem
            onClick={() => {
              if (selectedMissionary) handleOpenDialog(selectedMissionary);
              setAnchorEl(null);
            }}
          >
            <ListItemIcon>
              <Edit fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() => {
              if (selectedMissionary) handleDelete(selectedMissionary);
            }}
          >
            <ListItemIcon>
              <Delete fontSize="small" />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        </Menu>

        {/* Add/Edit Missionary Dialog */}
        <Dialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {editingMissionary ? "Edit Missionary" : "Add New Missionary"}
          </DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={formData.first_name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        first_name: e.target.value,
                      }))
                    }
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={formData.last_name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        last_name: e.target.value,
                      }))
                    }
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="email"
                    label="Email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    required
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={formData.assignment_status}
                      label="Status"
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          assignment_status: e.target.value as any,
                        }))
                      }
                    >
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                      <MenuItem value="unassigned">Unassigned</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>City</InputLabel>
                    <Select
                      value={formData.city_id}
                      label="City"
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          city_id: e.target.value,
                        }))
                      }
                    >
                      <MenuItem value="">Unassigned</MenuItem>
                      {cities.map((city) => (
                        <MenuItem key={city.id} value={city.id}>
                          {city.name}, {city.state}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Community</InputLabel>
                    <Select
                      value={formData.community_id}
                      label="Community"
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          community_id: e.target.value,
                        }))
                      }
                    >
                      <MenuItem value="">Unassigned</MenuItem>
                      {communities
                        .filter(
                          (community) =>
                            !formData.city_id ||
                            community.city_id === formData.city_id
                        )
                        .map((community) => (
                          <MenuItem key={community.id} value={community.id}>
                            {community.name}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Contact Number"
                    value={formData.contact_number}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        contact_number: e.target.value,
                      }))
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Notes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editingMissionary ? "Update" : "Create"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Bulk Hours Dialog */}
        <Dialog
          open={bulkHoursDialogOpen}
          onClose={() => setBulkHoursDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Schedule />
              Log Hours for Multiple Missionaries
            </Box>
          </DialogTitle>
          <DialogContent>
            <Alert severity="info" sx={{ mb: 3 }}>
              This will log the same hours and activity for all selected
              missionaries on the chosen date.
            </Alert>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Select Missionaries</InputLabel>
                  <Select
                    multiple
                    value={bulkHoursData.missionary_emails}
                    onChange={(e) =>
                      setBulkHoursData((prev) => ({
                        ...prev,
                        missionary_emails: e.target.value as string[],
                      }))
                    }
                    renderValue={(selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {selected.map((email) => {
                          const missionary = missionaries.find(
                            (m) => m.email === email
                          );
                          return (
                            <Chip
                              key={email}
                              label={`${missionary?.first_name} ${missionary?.last_name}`}
                              size="small"
                            />
                          );
                        })}
                      </Box>
                    )}
                  >
                    {missionaries
                      .filter((m) => m.assignment_status === "active")
                      .map((missionary) => (
                        <MenuItem
                          key={missionary.email}
                          value={missionary.email}
                        >
                          {missionary.first_name} {missionary.last_name} (
                          {missionary.email})
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Date"
                  value={bulkHoursData.date}
                  onChange={(date) =>
                    date &&
                    setBulkHoursData((prev) => ({
                      ...prev,
                      date,
                    }))
                  }
                  slotProps={{
                    textField: { fullWidth: true },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Hours"
                  value={bulkHoursData.hours}
                  onChange={(e) =>
                    setBulkHoursData((prev) => ({
                      ...prev,
                      hours: e.target.value,
                    }))
                  }
                  inputProps={{ step: "0.25", min: "0", max: "24" }}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={bulkHoursData.category}
                    onChange={(e) =>
                      setBulkHoursData((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                  >
                    {categories.map((cat) => (
                      <MenuItem key={cat.value} value={cat.value}>
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
                  rows={3}
                  label="Activity Description"
                  value={bulkHoursData.activity_description}
                  onChange={(e) =>
                    setBulkHoursData((prev) => ({
                      ...prev,
                      activity_description: e.target.value,
                    }))
                  }
                  placeholder="Describe the activities performed..."
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Location (Optional)"
                  value={bulkHoursData.location}
                  onChange={(e) =>
                    setBulkHoursData((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  placeholder="Where did this take place?"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setBulkHoursDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleBulkHoursSubmit}
              variant="contained"
              disabled={
                bulkHoursData.missionary_emails.length === 0 ||
                !bulkHoursData.hours ||
                !bulkHoursData.activity_description.trim()
              }
            >
              Log Hours for {bulkHoursData.missionary_emails.length}{" "}
              Missionaries
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
}
