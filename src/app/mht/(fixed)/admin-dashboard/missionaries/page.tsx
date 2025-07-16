// Main Component: MissionaryManagement.tsx
"use client";

import React, { useState } from "react";
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
import { MissionaryCard } from "./MissionaryCard";
import { HoursOverview } from "./HoursOverview";
import { SearchAndFilter } from "./SearchAndFilter";
import { AggregateStats } from "./AggregateStats";
import type { Missionary, City, Community, AssignmentLevel } from "./types";
import { POSITIONS_BY_LEVEL } from "./positions";

// Mock data for demonstration
const mockCities: City[] = [
  { id: "1", name: "Salt Lake City", state: "Utah", country: "USA" },
  { id: "2", name: "Provo", state: "Utah", country: "USA" },
  { id: "3", name: "Ogden", state: "Utah", country: "USA" },
];

const mockCommunities: Community[] = [
  {
    id: "1",
    name: "Downtown Community",
    city_id: "1",
    state: "Utah",
    country: "USA",
  },
  {
    id: "2",
    name: "East Bench Community",
    city_id: "1",
    state: "Utah",
    country: "USA",
  },
  {
    id: "3",
    name: "Provo Central",
    city_id: "2",
    state: "Utah",
    country: "USA",
  },
];

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
  const [cities] = useState<City[]>(mockCities);
  const [communities] = useState<Community[]>(mockCommunities);

  // Assignment level selection
  const [assignmentLevel, setAssignmentLevel] =
    useState<AssignmentLevel>("state");
  const [selectedCityId, setSelectedCityId] = useState<string>("");
  const [selectedCommunityId, setSelectedCommunityId] = useState<string>("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMissionary, setEditingMissionary] = useState<Missionary | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Get available positions based on assignment level
  const getAvailablePositions = () => {
    return POSITIONS_BY_LEVEL[assignmentLevel] || {};
  };

  // Filter communities based on selected city
  const getFilteredCommunities = () => {
    if (!selectedCityId) return [];
    return communities.filter((c) => c.city_id === selectedCityId);
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

  const handleSaveMissionary = (formData: any) => {
    if (editingMissionary) {
      setMissionaries((prev) =>
        prev.map((m) =>
          m.id === editingMissionary.id
            ? { ...m, ...formData, updated_at: new Date().toISOString() }
            : m
        )
      );
    } else {
      const newMissionary: Missionary = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setMissionaries((prev) => [...prev, newMissionary]);
    }
    handleCloseDialog();
  };

  const handleDeleteMissionary = (missionary: Missionary) => {
    if (
      confirm(
        `Are you sure you want to delete ${missionary.first_name} ${missionary.last_name}?`
      )
    ) {
      setMissionaries((prev) => prev.filter((m) => m.id !== missionary.id));
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
      !assignmentLevel || missionary.assignment_level === assignmentLevel;

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
                  setAssignmentLevel(e.target.value as AssignmentLevel);
                  setSelectedCityId("");
                  setSelectedCommunityId("");
                }}
                row
              >
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
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

                  <Grid item xs={12} md={4}>
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

                  <Grid item xs={12} md={4}>
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
                    value={selectedCityId}
                    label="Select City"
                    onChange={(e) => {
                      setSelectedCityId(e.target.value);
                      setSelectedCommunityId("");
                    }}
                  >
                    <MenuItem value="">All Cities</MenuItem>
                    {cities.map((city) => (
                      <MenuItem key={city.id} value={city.id}>
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
                    value={selectedCommunityId}
                    label="Select Community"
                    onChange={(e) => setSelectedCommunityId(e.target.value)}
                  >
                    <MenuItem value="">All Communities</MenuItem>
                    {getFilteredCommunities().map((community) => (
                      <MenuItem key={community.id} value={community.id}>
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
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSaveMissionary}
        missionary={editingMissionary}
        cities={cities}
        communities={communities}
        assignmentLevel={assignmentLevel}
        positions={getAvailablePositions()}
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
