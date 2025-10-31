"use client";

import { useMemo, useState } from "react";
import {
  Box,
  Chip,
  Button,
  Divider,
  Typography,
  Paper,
  Avatar,
  Tabs,
  Tab,
  Card,
  CardContent,
} from "@mui/material";
import {
  Add as AddIcon,
  BarChart as BarChartIcon,
  Schedule,
  TrendingUp,
  Person,
  Analytics,
  TableChart,
} from "@mui/icons-material";
import { AggregateStats } from "./AggregateStats";
import { SearchAndFilter } from "./SearchAndFilter";

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

import type { MissionaryHours } from "@/types/missionary/types";
import { HoursAnalytics } from "./HoursAnalytics";

interface HoursOverviewProps {
  missionaries: Missionary[];
  filters: FilterState;
  hours: MissionaryHours[];
  cities: any[];
  communities: any[];
  onFiltersChange: (filters: FilterState) => void;
}

export function HoursOverview({
  missionaries,
  filters,
  hours,
  cities,
  communities,
  onFiltersChange,
}: HoursOverviewProps) {
  const [activeTab, setActiveTab] = useState(0);

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
      {/* Hours Stats Cards (shared AggregateStats) */}
      <AggregateStats
        cards={[
          {
            label: "Total Hours",
            value: hoursStats.total,
            color: "primary.main",
            icon: <Schedule sx={{ color: "#fff" }} />,
          },
          {
            label: "Active Missionaries & Volunteers ",
            value: hoursStats.activeMissionaries,
            color: "success.main",
            icon: <Person sx={{ color: "#fff" }} />,
          },
          {
            label: "Avg Hours/Missionary",
            value: hoursStats.averagePerMissionary,
            color: "info.main",
            icon: <TrendingUp sx={{ color: "#fff" }} />,
          },
          {
            label: "This Month",
            value: hoursStats.thisMonth,
            color: "warning.main",
            icon: <Schedule sx={{ color: "#fff" }} />,
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

      {/* Tabs for different views */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
        >
          <Tab
            icon={<TableChart />}
            label="Missionaries & Volunteers Summary"
            iconPosition="start"
          />
          <Tab
            icon={<Analytics />}
            label="Analytics & Charts"
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 1 && (
        <h4>Analytics Will Coming Soon</h4>
        // <HoursAnalytics
        //   missionaries={missionaries}
        //   hours={hours}
        //   filters={filters}
        // />
      )}

      {activeTab === 0 && (
        <Box>
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
                      <Typography
                        variant="h4"
                        color="primary"
                        fontWeight="bold"
                      >
                        {summary.totalHours}h
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {summary.entries} entries
                      </Typography>
                      {/* <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                        <Chip
                          label={`${summary.weeklyHours}h`}
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
                      </Box> */}
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Box>
          ) : (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Schedule sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
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
