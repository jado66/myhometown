"use client";

import React from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Chip,
  Alert,
  AlertTitle,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
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
} from "@mui/icons-material";
import { MissionaryCard } from "./MissionaryCard";
import { MissionaryListView } from "./MissionaryListView";

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
}: UpcomingReleasesProps) {
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
      {/* Stats Cards styled like HoursOverview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Warning sx={{ fontSize: 40, color: "#d32f2f", mb: 1 }} />
              <Typography variant="h4" color="#d32f2f" fontWeight="bold">
                {criticalCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Within 30 days
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Info sx={{ fontSize: 40, color: "#f57c00", mb: 1 }} />
              <Typography variant="h4" color="#f57c00" fontWeight="bold">
                {warningCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Within 60 days
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <CheckCircle sx={{ fontSize: 40, color: "#2e7d32", mb: 1 }} />
              <Typography variant="h4" color="#2e7d32" fontWeight="bold">
                {infoCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Within 90 days
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Person sx={{ fontSize: 40, color: "text.secondary", mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {totalUpcoming}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total upcoming
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

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
          variant="body2"
          color="text.primary"
          sx={{ display: "flex", alignItems: "center" }}
        >
          <Group sx={{ mr: 1 }} />
          Upcoming Releases
        </Typography>
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
