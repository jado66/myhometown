// Main Component: MissionaryManagement.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Grid,
  Paper,
  Tabs,
  Tab,
  Card,
  CardContent,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  Select,
  MenuItem,
  InputLabel,
  Chip,
} from "@mui/material";
import {
  Add,
  Schedule,
  Person,
  Download,
  Business,
  LocationCity,
  Group,
} from "@mui/icons-material";
import { MissionaryDialog } from "./MissionaryDialog";
import { HoursOverview } from "./HoursOverview";
import { SearchAndFilter } from "./SearchAndFilter";
import { AggregateStats } from "./AggregateStats";
import type { Missionary, City, Community, AssignmentLevel } from "./types";
import { POSITIONS_BY_LEVEL } from "./positions";
import { useUser } from "@/hooks/use-user";
import useManageCities from "@/hooks/use-manage-cities";
import { useCommunities } from "@/hooks/use-communities";
import JsonViewer from "@/components/util/debug/DebugOutput";
import { Upload } from "@mui/icons-material";
import { BulkImportDialog } from "./BulkImportDialog";
import { MissionaryCard } from "./MissionaryCard";

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

  const { user } = useUser();

  const { cities } = useManageCities(user);

  const { communities } = useCommunities(user);
  // Assignment level selection
  const [assignmentLevel, setAssignmentLevel] = useState<
    AssignmentLevel | "all"
  >("all");
  // Fetch missionaries on mount
  useEffect(() => {
    fetchMissionaries();
  }, []);
  // Use null as initial value to avoid uncontrolled-to-controlled warning
  const [selectedCityId, setSelectedCityId] = useState<string | null>("");
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(
    ""
  );

  const [bulkImportOpen, setBulkImportOpen] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMissionary, setEditingMissionary] = useState<Missionary | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Get available positions based on assignment level
  const getAvailablePositions = () => {
    if (assignmentLevel === "all") {
      // Merge all positions
      return Object.keys(POSITIONS_BY_LEVEL).reduce((acc, key) => {
        Object.entries(POSITIONS_BY_LEVEL[key]).forEach(([group, titles]) => {
          if (!acc[group]) acc[group] = [];
          acc[group] = [...acc[group], ...titles];
        });
        return acc;
      }, {});
    }
    return POSITIONS_BY_LEVEL[assignmentLevel] || {};
  };

  // Filter communities based on selected city
  const getFilteredCommunities = () => {
    if (!selectedCityId) return [];
    // Find city name by selectedCityId
    const selectedCity = cities.find((city) => city._id === selectedCityId);
    if (!selectedCity) return [];
    return communities.filter((c) => c.city === selectedCity.name);
  };

  const handleBulkImport = async (missionaries) => {
    try {
      const response = await fetch("/api/database/missionaries/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ missionaries }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to import missionaries");
      }

      const result = await response.json();

      // Refresh the missionaries list
      await fetchMissionaries();

      setBulkImportOpen(false);

      // Show success message
      console.log(`Successfully imported ${result.imported} missionaries`);
    } catch (error) {
      console.error("Error importing missionaries:", error);
      throw error; // Re-throw to let the dialog handle the error
    }
  };

  const handleOpenDialog = (missionary?: Missionary) => {
    if (missionary) {
      setEditingMissionary(missionary);
    } else {
      setEditingMissionary(null);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingMissionary(null);
  };

  const fetchMissionaries = async () => {
    try {
      const response = await fetch("/api/database/missionaries");
      if (!response.ok) {
        throw new Error("Failed to fetch missionaries");
      }
      const data = await response.json();
      setMissionaries(data.missionaries || []);
    } catch (error) {
      console.error("Error fetching missionaries:", error);
    }
  };

  const handleSaveMissionary = async (formData: any) => {
    try {
      const url = editingMissionary
        ? `/api/database/missionaries?id=${editingMissionary.id}`
        : "/api/database/missionaries";

      const method = editingMissionary ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save missionary");
      }

      const result = await response.json();

      // Refresh the missionaries list
      await fetchMissionaries();

      handleCloseDialog();

      // Show success message
      console.log("Missionary saved successfully");
    } catch (error) {
      console.error("Error saving missionary:", error);
      // Handle error - show toast/alert
    }
  };
  const handleDeleteMissionary = async (missionary: Missionary) => {
    if (
      confirm(
        `Are you sure you want to delete ${missionary.first_name} ${missionary.last_name}?`
      )
    ) {
      try {
        const response = await fetch(
          `/api/database/missionaries?id=${missionary.id}`,
          {
            method: "DELETE",
          }
        );
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to delete missionary");
        }
        // Refresh the missionaries list
        await fetchMissionaries();
        // Show success message
        console.log("Missionary deleted successfully");
      } catch (error) {
        console.error("Error deleting missionary:", error);
        // Handle error - show toast/alert
      }
    }
  };

  const handleExportCSV = () => {
    const data = missionaries.map((m) => ({
      "First Name": m.first_name,
      "Last Name": m.last_name,
      Email: m.email,
      Phone: m.contact_number || "",
      Status: m.assignment_status,
      "Assignment Level": m.assignment_level || "",
      City: cities.find((c) => c.id === m.city_id)?.name || "",
      Community: communities.find((c) => c.id === m.community_id)?.name || "",
      Group: m.group || "",
      Title: m.title || "",
      "Start Date": m.start_date || "",
      Notes: m.notes || "",
    }));

    exportToCSV(
      data,
      `missionaries_report_${new Date().toISOString().split("T")[0]}`
    );
  };

  const filteredMissionaries = missionaries.filter((missionary) => {
    const matchesSearch =
      missionary.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      missionary.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      missionary.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (missionary.title || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (missionary.group || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || missionary.assignment_status === statusFilter;

    const matchesLevel =
      assignmentLevel === "all" ||
      missionary.assignment_level === assignmentLevel;

    return matchesSearch && matchesStatus && matchesLevel;
  });

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      {/* Header */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Person sx={{ mr: 2, color: "primary.main" }} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" component="h1" fontWeight="bold">
              Missionary Management System
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Manage contacts, assignments, and service records
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Upload />}
              onClick={() => setBulkImportOpen(true)}
            >
              Bulk Import
            </Button>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={handleExportCSV}
            >
              Export CSV
            </Button>
            <Button variant="outlined" startIcon={<Schedule />}>
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
        {/* Assignment Level Selection */}
        <Card sx={{ mb: 4, p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Select Assignment Level
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <RadioGroup
                value={assignmentLevel}
                onChange={(e) => {
                  setAssignmentLevel(e.target.value);
                  setSelectedCityId("");
                  setSelectedCommunityId("");
                }}
                row
              >
                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
                    <Card
                      sx={{
                        p: 2,
                        cursor: "pointer",
                        border: 2,
                        borderColor:
                          assignmentLevel === "all"
                            ? "primary.main"
                            : "grey.300",
                        "&:hover": { borderColor: "primary.main" },
                      }}
                      onClick={() => setAssignmentLevel("all")}
                    >
                      <FormControlLabel
                        value="all"
                        control={<Radio />}
                        label={
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Person />
                            <Box>
                              <Typography variant="subtitle1" fontWeight="bold">
                                All Levels
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Show all missionaries
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Card
                      sx={{
                        p: 2,
                        cursor: "pointer",
                        border: 2,
                        borderColor:
                          assignmentLevel === "state"
                            ? "primary.main"
                            : "grey.300",
                        "&:hover": { borderColor: "primary.main" },
                      }}
                      onClick={() => setAssignmentLevel("state")}
                    >
                      <FormControlLabel
                        value="state"
                        control={<Radio />}
                        label={
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Business />
                            <Box>
                              <Typography variant="subtitle1" fontWeight="bold">
                                State Level
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Utah state-wide assignments
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Card
                      sx={{
                        p: 2,
                        cursor: "pointer",
                        border: 2,
                        borderColor:
                          assignmentLevel === "city"
                            ? "primary.main"
                            : "grey.300",
                        "&:hover": { borderColor: "primary.main" },
                      }}
                      onClick={() => setAssignmentLevel("city")}
                    >
                      <FormControlLabel
                        value="city"
                        control={<Radio />}
                        label={
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <LocationCity />
                            <Box>
                              <Typography variant="subtitle1" fontWeight="bold">
                                City Level
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                City-specific assignments
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Card
                      sx={{
                        p: 2,
                        cursor: "pointer",
                        border: 2,
                        borderColor:
                          assignmentLevel === "community"
                            ? "primary.main"
                            : "grey.300",
                        "&:hover": { borderColor: "primary.main" },
                      }}
                      onClick={() => setAssignmentLevel("community")}
                    >
                      <FormControlLabel
                        value="community"
                        control={<Radio />}
                        label={
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Group />
                            <Box>
                              <Typography variant="subtitle1" fontWeight="bold">
                                Community Level
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Community assignments
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                    </Card>
                  </Grid>
                </Grid>
              </RadioGroup>
            </Grid>

            {/* City Selection (for city and community levels) */}
            {(assignmentLevel === "city" ||
              assignmentLevel === "community") && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Select City</InputLabel>
                  <Select
                    value={selectedCityId ?? ""}
                    label="Select City"
                    onChange={(e) => {
                      setSelectedCityId(
                        e.target.value === "" ? null : e.target.value
                      );
                      setSelectedCommunityId("");
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {},
                      },
                      // Fixes portal rendering for z-index issues
                      container: document.body,
                    }}
                  >
                    <MenuItem value="">All Cities</MenuItem>
                    {cities.map((city) => (
                      <MenuItem key={city._id} value={city._id}>
                        {city.name}, {city.state}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {/* Community Selection (for community level only) */}
            {assignmentLevel === "community" && selectedCityId && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Select Community</InputLabel>
                  <Select
                    value={selectedCommunityId ?? ""}
                    label="Select Community"
                    onChange={(e) =>
                      setSelectedCommunityId(
                        e.target.value === "" ? null : e.target.value
                      )
                    }
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          zIndex: 9999,
                        },
                      },
                      container: document.body,
                    }}
                  >
                    <MenuItem value="">All Communities</MenuItem>
                    {getFilteredCommunities().map((community) => (
                      <MenuItem key={community._id} value={community._id}>
                        {community.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>

          {/* Display available positions for selected level */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Available Groups & Titles:
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {Object.entries(getAvailablePositions()).map(
                ([group, titles]) => (
                  <Chip
                    key={group}
                    label={`${group} (${titles.length})`}
                    variant="outlined"
                    size="small"
                  />
                )
              )}
            </Box>
          </Box>
        </Card>

        {/* Aggregate Stats */}
        <AggregateStats missionaries={missionaries} />

        {/* Tabs */}
        <Paper elevation={2} sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
          >
            <Tab label="Contact Management" />
            <Tab label="Hours Overview" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            {/* Search and Filter */}
            <SearchAndFilter
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              resultCount={filteredMissionaries.length}
            />

            {/* Missionary Cards */}
            <Grid container spacing={3}>
              {filteredMissionaries.map((missionary) => (
                <Grid item xs={12} lg={6} key={missionary.id}>
                  <MissionaryCard
                    missionary={missionary}
                    cities={cities}
                    communities={communities}
                    onEdit={handleOpenDialog}
                    onDelete={handleDeleteMissionary}
                  />
                </Grid>
              ))}
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <HoursOverview missionaries={missionaries} />
          </TabPanel>
        </Paper>
      </Container>

      {/* Add/Edit Dialog */}
      <MissionaryDialog
        user={user}
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSaveMissionary}
        missionary={editingMissionary}
        cities={cities}
        communities={communities}
      />
    </Box>
  );
}

const exportToCSV = (data, filename) => {
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          return typeof value === "string" && value.includes(",")
            ? `"${value}"`
            : value;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
