"use client";

import React from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  Alert,
  Grid,
  AlertTitle,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
  Button,
} from "@mui/material";
import {
  Schedule,
  Person,
  Warning,
  Info,
  CheckCircle,
  Group,
  ViewModule,
  ViewList,
  Download,
} from "@mui/icons-material";

import { AggregateStats } from "./AggregateStats";
import { MissionaryListView } from "./MissionaryListView";
import { MissionaryCard } from "./MissionaryCard";
import { SearchAndFilter } from "./SearchAndFilter";

interface Missionary {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  contact_number?: string;
  assignment_status: "Active";
  assignment_level?: "State" | "City" | "Community";
  city_id?: string;
  community_id?: string;
  group?: string;
  title?: string;
  start_date?: string;
  end_date?: string;
  notes?: string;
  person_type?: "missionary" | "volunteer";
}

interface Community {
  _id: string;
  id: string;
  name: string;
  city_id: string;
}

interface City {
  _id: string;
  id: string;
  name: string;
  state: string;
}

interface FilterState {
  searchTerm: string;
  statusFilter: string;
  assignmentLevel: "all" | "state" | "city" | "community";
  selectedCityId: string | null;
  selectedCommunityId: string | null;
  personType: "all" | "missionary" | "volunteer";
  upcomingReleaseDays?: 30 | 60 | 90;
}

interface UpcomingReleasesProps {
  missionaries: Missionary[];
  cities: City[];
  communities: Community[];
  viewMode: "card" | "list";
  onViewModeChange: (
    event: React.MouseEvent<HTMLElement>,
    newViewMode: "card" | "list" | null
  ) => void;
  onEdit: (missionary: Missionary) => void;
  onDelete: (missionary: Missionary) => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

// Helper to calculate release date from start_date and duration (e.g., '12 months')
const getReleaseDate = (missionary: {
  start_date?: string;
  duration?: string;
}): Date | null => {
  if (!missionary.start_date || !missionary.duration) return null;
  const monthsMatch = missionary.duration.match(/(\d+)/);
  if (!monthsMatch) return null;
  const months = parseInt(monthsMatch[1], 10);
  if (isNaN(months)) return null;
  const start = new Date(missionary.start_date);
  start.setMonth(start.getMonth() + months);
  return start;
};

// Helper function to calculate days until release using calculated release date
const getDaysUntilRelease = (missionary: {
  start_date?: string;
  duration?: string;
}): number => {
  const releaseDate = getReleaseDate(missionary);
  if (!releaseDate) return Infinity;
  const now = new Date();
  const diffTime = releaseDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Helper function to get urgency level
const getUrgencyLevel = (
  days: number
): "critical" | "warning" | "info" | null => {
  if (days <= 30) return "critical";
  if (days <= 60) return "warning";
  if (days <= 90) return "info";
  return null;
};

// Helper function to format date
const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return "No end date set";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export function UpcomingReleases({
  missionaries,
  cities,
  communities,
  viewMode,
  onViewModeChange,
  onEdit,
  onDelete,
  filters,
  onFiltersChange,
}: UpcomingReleasesProps) {
  // Export CSV handler
  const handleExportCSV = () => {
    // Combine all upcoming releases
    const allUpcoming = [
      ...groupedMissionaries.critical,
      ...groupedMissionaries.warning,
      ...groupedMissionaries.info,
    ].sort((a, b) => a.daysUntilRelease - b.daysUntilRelease);

    const header = [
      "First Name",
      "Last Name",
      "Email",
      "Phone",
      "Type",
      "Status",
      "Level",
      "Assignment",
      "Position",
      "Start Date",
      "Release Date",
      "Days Until Release",
      "Urgency",
    ];

    const rows = allUpcoming.map((m: any) => {
      let assignment = "";
      if (m.assignment_level?.toLowerCase() === "city") {
        assignment = cities.find((c) => c.id === m.city_id)?.name || "";
      } else if (m.assignment_level?.toLowerCase() === "community") {
        assignment = communities.find((c) => c.id === m.community_id)?.name || "";
      } else if (m.assignment_level?.toLowerCase() === "state") {
        assignment = "Utah";
      }

      const releaseDate = getReleaseDate(m);
      const urgency = getUrgencyLevel(m.daysUntilRelease);

      return {
        "First Name": m.first_name,
        "Last Name": m.last_name,
        "Email": m.email,
        "Phone": m.contact_number || "",
        "Type": m.person_type || "missionary",
        "Status": m.assignment_status,
        "Level": m.assignment_level || "",
        "Assignment": assignment,
        "Position": m.title || "",
        "Start Date": m.start_date ? new Date(m.start_date).toLocaleDateString("en-US") : "",
        "Release Date": releaseDate ? releaseDate.toLocaleDateString("en-US") : "",
        "Days Until Release": m.daysUntilRelease,
        "Urgency": urgency === "critical" ? "Within 30 days" : urgency === "warning" ? "Within 60 days" : "Within 90 days",
      };
    });

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return "";
      const str = String(val);
      if (/[",\n]/.test(str)) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    };

    const csvContent = [
      header.join(","),
      ...rows.map((row) => header.map((h) => escapeCsv((row as any)[h])).join(",")),
    ].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `upcoming_releases_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Group missionaries by urgency level using calculated release date
  const groupedMissionaries = missionaries.reduce(
    (acc, missionary) => {
      // Calculate days until release from start_date and durationUpcoming Releases
      const days = getDaysUntilRelease(missionary);
      const urgency = getUrgencyLevel(days);
      if (urgency) {
        acc[urgency].push({ ...missionary, daysUntilRelease: days });
      }
      return acc;
    },
    {
      critical: [] as (Missionary & { daysUntilRelease: number })[],
      warning: [] as (Missionary & { daysUntilRelease: number })[],
      info: [] as (Missionary & { daysUntilRelease: number })[],
    }
  );

  // Sort each group by days until release (ascending)
  Object.keys(groupedMissionaries).forEach((key) => {
    groupedMissionaries[key as keyof typeof groupedMissionaries].sort(
      (a, b) => a.daysUntilRelease - b.daysUntilRelease
    );
  });

  const totalUpcoming =
    groupedMissionaries.critical.length +
    groupedMissionaries.warning.length +
    groupedMissionaries.info.length;
  const criticalCount = groupedMissionaries.critical.length;
  const warningCount = groupedMissionaries.warning.length;
  const infoCount = groupedMissionaries.info.length;

  if (totalUpcoming === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: "center" }}>
        <Schedule sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          No upcoming releases found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No missionaries or volunteers have end dates within the next 90 days.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      {/* Stats Cards (shared AggregateStats) */}
      <AggregateStats
        cards={[
          {
            label: "Within 30 days",
            value: criticalCount,
            color: "error.main",
            icon: <Warning sx={{ color: "#fff" }} />,
          },
          {
            label: "Within 60 days",
            value: warningCount,
            color: "warning.main",
            icon: <Info sx={{ color: "#fff" }} />,
          },
          {
            label: "Within 90 days",
            value: infoCount,
            color: "success.main",
            icon: <CheckCircle sx={{ color: "#fff" }} />,
          },
          {
            label: "Total upcoming",
            value: totalUpcoming,
            color: "grey.400",
            icon: <Person sx={{ color: "text.secondary" }} />,
          },
        ]}
      />

      {/* Search and Filter */}
      <SearchAndFilter
        filters={filters}
        onFiltersChange={onFiltersChange}
        cities={cities}
        communities={communities}
        resultCount={missionaries.length}
      />

      {/* Header and view toggle inline */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Typography
          variant="h5"
          color="text.primary"
          sx={{ display: "flex", alignItems: "center" }}
        >
          Upcoming Releases Table
        </Typography>
<Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={onViewModeChange}
            size="small"
          >
            <ToggleButton value="card" aria-label="card view">
              <ViewModule sx={{ mr: 1 }} />
              Cards
            </ToggleButton>
            <ToggleButton value="list" aria-label="list view">
              <ViewList sx={{ mr: 1 }} />
              List
            </ToggleButton>
          </ToggleButtonGroup>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleExportCSV}
            disabled={totalUpcoming === 0}
          >
            Export CSV
          </Button>
        </Box>
      </Box>

      {/* Critical Releases (Within 30 days) */}
      {criticalCount > 0 && (
        <Box sx={{ mb: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            <AlertTitle>Critical - Releases within 30 days</AlertTitle>
            These missionaries and volunteers are scheduled to be released soon.
            Immediate attention may be required for transition planning.
          </Alert>
          {viewMode === "card" ? (
            <Grid container spacing={3}>
              {groupedMissionaries.critical.map((missionary) => (
                <Grid item xs={12} lg={6} key={missionary.id}>
                  <Box sx={{ position: "relative" }}>
                    <MissionaryCard
                      missionary={missionary}
                      cities={cities}
                      communities={communities}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      isUpcomingView={true}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          ) : (
            <MissionaryListView
              missionaries={groupedMissionaries.critical}
              cities={cities}
              communities={communities}
              onEdit={onEdit}
              onDelete={onDelete}
              isUpcomingView={true}
            />
          )}
        </Box>
      )}

      {/* Warning Releases (31-60 days) */}
      {warningCount > 0 && (
        <Box sx={{ mb: 4 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <AlertTitle>Warning - Releases within 60 days</AlertTitle>
            These releases are approaching. Consider beginning transition
            preparations.
          </Alert>
          {viewMode === "card" ? (
            <Grid container spacing={3}>
              {groupedMissionaries.warning.map((missionary) => (
                <Grid item xs={12} lg={6} key={missionary.id}>
                  <Box sx={{ position: "relative" }}>
                    <MissionaryCard
                      missionary={missionary}
                      cities={cities}
                      communities={communities}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      isUpcomingView={true}
                    />
                    {/* <Chip
                      label={`${missionary.daysUntilRelease} days left`}
                      color="warning"
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        zIndex: 1,
                      }}
                    /> */}
                  </Box>
                </Grid>
              ))}
            </Grid>
          ) : (
            <MissionaryListView
              missionaries={groupedMissionaries.warning}
              cities={cities}
              communities={communities}
              onEdit={onEdit}
              onDelete={onDelete}
              isUpcomingView={true}
            />
          )}
        </Box>
      )}

      {/* Info Releases (61-90 days) */}
      {infoCount > 0 && (
        <Box sx={{ mb: 4 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            <AlertTitle>Info - Releases within 90 days</AlertTitle>
            These releases are scheduled for the coming months. Good time for
            long-term planning.
          </Alert>
          {viewMode === "card" ? (
            <Grid container spacing={3}>
              {groupedMissionaries.info.map((missionary) => (
                <Grid item xs={12} lg={6} key={missionary.id}>
                  <Box sx={{ position: "relative" }}>
                    <MissionaryCard
                      missionary={missionary}
                      cities={cities}
                      communities={communities}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      isUpcomingView={true}
                    />
                    <Chip
                      label={`${missionary.daysUntilRelease} days left`}
                      color="info"
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        zIndex: 1,
                      }}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          ) : (
            <MissionaryListView
              missionaries={groupedMissionaries.info}
              cities={cities}
              communities={communities}
              onEdit={onEdit}
              onDelete={onDelete}
              isUpcomingView={true}
            />
          )}
        </Box>
      )}
    </Box>
  );
}
