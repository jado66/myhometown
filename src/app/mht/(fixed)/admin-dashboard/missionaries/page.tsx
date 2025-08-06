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
} from "@mui/material";
import { Add, Schedule, Person, Download, Upload } from "@mui/icons-material";
import { SearchAndFilter } from "./SearchAndFilter";
import { MissionaryCard } from "./MissionaryCard";
import { HoursOverview } from "./HoursOverview";
import { useMissionaryHours } from "@/hooks/use-missionary-hours";
import { AggregateStats } from "./AggregateStats";
import { useUser } from "@/contexts/UserProvider";
import useManageCities from "@/hooks/use-manage-cities";
import { useCommunities } from "@/hooks/use-communities";

// Mock data types
interface Missionary {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  contact_number?: string;
  assignment_status: "active" | "inactive" | "pending";
  assignment_level?: "state" | "city" | "community";
  city_id?: string;
  community_id?: string;
  group?: string;
  title?: string;
  start_date?: string;
  notes?: string;
}

interface City {
  _id: string;
  id: string;
  name: string;
  state: string;
}

interface Community {
  _id: string;
  id: string;
  name: string;
  city: string;
}

interface FilterState {
  searchTerm: string;
  statusFilter: string;
  assignmentLevel: "all" | "state" | "city" | "community";
  selectedCityId: string | null;
  selectedCommunityId: string | null;
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

// Back to:
export default function MissionaryManagement() {
  const [missionaries, setMissionaries] = useState<Missionary[]>([]);
  const { user } = useUser();
  const { cities } = useManageCities(user);
  const { communities } = useCommunities(user);
  const [tabValue, setTabValue] = useState(0);

  // Single source of truth for filters
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: "",
    statusFilter: "all",
    assignmentLevel: "all",
    selectedCityId: null,
    selectedCommunityId: null,
  });

  // Sync individual filter states for filtering logic
  const searchTerm = filters.searchTerm;
  const statusFilter = filters.statusFilter;
  const assignmentLevel = filters.assignmentLevel;
  const selectedCityId = filters.selectedCityId;
  const selectedCommunityId = filters.selectedCommunityId;

  // Fetch missionaries on mount
  useEffect(() => {
    fetchMissionaries();
  }, []);

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

    const matchesCity =
      !selectedCityId || missionary.city_id === selectedCityId;

    const matchesCommunity =
      !selectedCommunityId || missionary.community_id === selectedCommunityId;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesLevel &&
      matchesCity &&
      matchesCommunity
    );
  });

  // Fetch missionary hours
  const {
    hours,
    loading: hoursLoading,
    error: hoursError,
  } = useMissionaryHours();

  const handleExportCSV = () => {
    const data = filteredMissionaries.map((m) => ({
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

    console.log("Exporting CSV with data:", data);
  };

  const handleOpenDialog = (missionary?: Missionary) => {
    console.log("Opening dialog for missionary:", missionary);
  };

  const handleDeleteMissionary = (missionary: Missionary) => {
    console.log("Deleting missionary:", missionary);
  };

  return (
    <Grid container item sm={12} display="flex">
      <Box sx={{ backgroundColor: "#f5f5f5", flexGrow: 1, minHeight: "100vh" }}>
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
                onClick={() => console.log("Bulk import")}
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
          {/* Unified Search and Filter */}
          <SearchAndFilter
            filters={filters}
            onFiltersChange={setFilters}
            cities={cities}
            communities={communities}
            resultCount={filteredMissionaries.length}
          />

          {/* Main Content Tabs */}
          <Paper elevation={2} sx={{ mb: 3 }}>
            <Tabs
              value={tabValue}
              onChange={(e, newValue) => setTabValue(newValue)}
            >
              <Tab label="Missionary Table" />
              <Tab label="Hours Overview" />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              {/* Aggregate Stats - Only shown on management tab */}
              <AggregateStats missionaries={filteredMissionaries} />

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

              {filteredMissionaries.length === 0 && (
                <Paper sx={{ p: 4, textAlign: "center", mt: 3 }}>
                  <Person
                    sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
                  />
                  <Typography variant="h6" gutterBottom>
                    No missionaries found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Try adjusting your search criteria or add a new missionary.
                  </Typography>
                </Paper>
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <HoursOverview
                missionaries={filteredMissionaries}
                filters={filters}
                hours={hours}
              />
            </TabPanel>
          </Paper>
        </Container>
      </Box>
    </Grid>
  );
}
