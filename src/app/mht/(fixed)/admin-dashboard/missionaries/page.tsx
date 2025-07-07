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
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  MoreVert,
  Person,
  Search,
} from "@mui/icons-material";

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

export default function MissionaryManagement() {
  const [missionaries, setMissionaries] = useState<Missionary[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMissionary, setEditingMissionary] = useState<Missionary | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMissionary, setSelectedMissionary] =
    useState<Missionary | null>(null);

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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch missionaries, cities, and communities
      const [missionariesRes, citiesRes, communitiesRes] = await Promise.all([
        fetch("/api/database/missionaries"),
        fetch("/api/database/cities"),
        fetch("/api/database/communities"),
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
              Manage missionaries and their assignments
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Add Missionary
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
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
        <Paper elevation={3}>
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
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredMissionaries.map((missionary) => (
                  <TableRow key={missionary.id} hover>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
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
                          <Typography variant="body2" color="text.secondary">
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
                          getStatusColor(missionary.assignment_status) as any
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{getCityName(missionary.city_id)}</TableCell>
                    <TableCell>
                      {getCommunityName(missionary.community_id)}
                    </TableCell>
                    <TableCell>{missionary.contact_number || "N/A"}</TableCell>
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
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

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

        {/* Add/Edit Dialog */}
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
      </Container>
    </Box>
  );
}
