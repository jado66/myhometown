"use client";

import React, { useState, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Avatar,
  Chip,
  Button,
  Divider,
  Grid,
  Paper,
} from "@mui/material";
import {
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  Person as PersonIcon,
  Add as AddIcon,
  BarChart as BarChartIcon,
} from "@mui/icons-material";

interface Missionary {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  assignment_status: "active" | "inactive" | "pending";
  assignment_level?: "state" | "city" | "community";
  title?: string;
  group?: string;
}

interface FilterState {
  searchTerm: string;
  statusFilter: string;
  assignmentLevel: "all" | "state" | "city" | "community";
  selectedCityId: string | null;
  selectedCommunityId: string | null;
}

import { MissionaryHours } from "@/types/missionary/types";

interface HoursOverviewProps {
  missionaries: Missionary[];
  filters: FilterState;
  hours: MissionaryHours[];
}

export function HoursOverview({
  missionaries,
  filters,
  hours,
}: HoursOverviewProps) {
  // Calculate hours stats based on filtered missionaries
  const filteredHours = useMemo(() => {
    return hours.filter((h) =>
      missionaries.some((m) => m.id === h.missionary_id)
    );
  }, [hours, missionaries]);

  const hoursStats = useMemo(() => {
    const totalHours = filteredHours.reduce((sum, h) => sum + h.total_hours, 0);
    const uniqueMissionaries = new Set(
      filteredHours.map((h) => h.missionary_id)
    ).size;
    const averagePerMissionary =
      uniqueMissionaries > 0 ? Math.round(totalHours / uniqueMissionaries) : 0;

    // Calculate thisWeek and thisMonth based on period_start_date
    const now = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(now.getDate() - 7);
    const monthAgo = new Date();
    monthAgo.setMonth(now.getMonth() - 1);

    const thisWeek = filteredHours
      .filter((h) => new Date(h.period_start_date) >= weekAgo)
      .reduce((sum, h) => sum + h.total_hours, 0);
    const thisMonth = filteredHours
      .filter((h) => new Date(h.period_start_date) >= monthAgo)
      .reduce((sum, h) => sum + h.total_hours, 0);

    return {
      total: totalHours,
      activeMissionaries: uniqueMissionaries,
      averagePerMissionary,
      thisWeek,
      thisMonth,
      weeklyEntries: filteredHours.filter((h) => h.entry_method === "weekly")
        .length,
      monthlyEntries: filteredHours.filter((h) => h.entry_method === "monthly")
        .length,
    };
  }, [filteredHours]);

  // Missionary hours summary
  const missionaryHoursSummary = useMemo(() => {
    const summary = new Map();
    missionaries.forEach((missionary) => {
      const missionaryHours = filteredHours.filter(
        (h) => h.missionary_id === missionary.id
      );
      const totalHours = missionaryHours.reduce(
        (sum, h) => sum + h.total_hours,
        0
      );
      const weeklyHours = missionaryHours
        .filter((h) => h.entry_method === "weekly")
        .reduce((sum, h) => sum + h.total_hours, 0);
      const monthlyHours = missionaryHours
        .filter((h) => h.entry_method === "monthly")
        .reduce((sum, h) => sum + h.total_hours, 0);
      if (totalHours > 0) {
        summary.set(missionary.id, {
          missionary,
          totalHours,
          entries: missionaryHours.length,
          weeklyHours,
          monthlyHours,
          weeklyEntries: missionaryHours.filter(
            (h) => h.entry_method === "weekly"
          ).length,
          monthlyEntries: missionaryHours.filter(
            (h) => h.entry_method === "monthly"
          ).length,
        });
      }
    });
    return Array.from(summary.values()).sort(
      (a, b) => b.totalHours - a.totalHours
    );
  }, [filteredHours, missionaries]);

  return (
    <Box>
      {/* Hours Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Avatar sx={{ mx: "auto", mb: 2, bgcolor: "primary.main" }}>
                <ScheduleIcon />
              </Avatar>
              <Typography variant="h4" color="primary" fontWeight="bold">
                {hoursStats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Hours
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Avatar sx={{ mx: "auto", mb: 2, bgcolor: "success.main" }}>
                <PersonIcon />
              </Avatar>
              <Typography variant="h4" color="success.main" fontWeight="bold">
                {hoursStats.activeMissionaries}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Missionaries
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Avatar sx={{ mx: "auto", mb: 2, bgcolor: "info.main" }}>
                <TrendingUpIcon />
              </Avatar>
              <Typography variant="h4" color="info.main" fontWeight="bold">
                {hoursStats.averagePerMissionary}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg Hours/Missionary
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Avatar sx={{ mx: "auto", mb: 2, bgcolor: "warning.main" }}>
                <ScheduleIcon />
              </Avatar>
              <Typography variant="h4" color="warning.main" fontWeight="bold">
                {hoursStats.thisWeek}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This Week
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Hours Summary */}

      <Typography
        variant="body2"
        color="text.primary"
        sx={{ display: "flex", mb: 3, alignItems: "center" }}
      >
        <BarChartIcon sx={{ mr: 1 }} />
        Hours Summary by Missionary
      </Typography>

      {missionaryHoursSummary.length > 0 ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {missionaryHoursSummary.map((summary) => (
            <Paper key={summary.missionary.id} sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar sx={{ bgcolor: "primary.main" }}>
                    {summary.missionary.first_name[0]}
                    {summary.missionary.last_name[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {summary.missionary.first_name}{" "}
                      {summary.missionary.last_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {summary.missionary.email}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                      {summary.missionary.title && (
                        <Chip
                          label={summary.missionary.title}
                          size="small"
                          sx={{ textTransform: "capitalize" }}
                          variant="outlined"
                        />
                      )}
                      <Chip
                        label={summary.missionary.assignment_status}
                        size="small"
                        color={
                          summary.missionary.assignment_status === "active"
                            ? "success"
                            : "default"
                        }
                      />
                    </Box>
                  </Box>
                </Box>
                <Box sx={{ textAlign: "right" }}>
                  <Typography variant="h4" color="primary" fontWeight="bold">
                    {summary.totalHours}h
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {summary.entries} entries
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                    <Chip
                      label={`Weekly: ${summary.weeklyHours}h`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    <Chip
                      label={`Monthly: ${summary.monthlyHours}h`}
                      size="small"
                      color="secondary"
                      variant="outlined"
                    />
                  </Box>
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>
      ) : (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <ScheduleIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No hours recorded
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            No hours have been recorded for the selected missionaries.
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />}>
            Add First Hours Entry
          </Button>
        </Box>
      )}

      {/* Filter Summary */}
      {(filters.searchTerm ||
        filters.statusFilter !== "all" ||
        filters.assignmentLevel !== "all") && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Showing hours for {missionaries.length} missionaries matching
                current filters:
              </Typography>
              {filters.assignmentLevel !== "all" && (
                <Chip
                  label={`Level: ${filters.assignmentLevel}`}
                  size="small"
                  variant="outlined"
                />
              )}
              {filters.statusFilter !== "all" && (
                <Chip
                  label={`Status: ${filters.statusFilter}`}
                  size="small"
                  sx={{ textTransform: "capitalize" }}
                  variant="outlined"
                />
              )}
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
