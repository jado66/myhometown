"use client";

import React, { useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Paper,
} from "@mui/material";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import {
  TrendingUp,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline,
  CalendarToday,
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

interface MissionaryHours {
  id: string;
  missionary_id: string;
  total_hours: number;
  period_start_date: string;
  period_end_date: string;
  entry_method: "weekly" | "monthly";
  created_at: string;
}

interface FilterState {
  searchTerm: string;
  statusFilter: string;
  assignmentLevel: "all" | "state" | "city" | "community";
  selectedCityId: string | null;
  selectedCommunityId: string | null;
}

interface HoursAnalyticsProps {
  missionaries: Missionary[];
  hours: MissionaryHours[];
  filters: FilterState;
}

const COLORS = [
  "#a16faf",
  "#1b75bc",
  "#febc18",
  "#318d43",
  "#e45620",
  "#bdbdbd",
  "#616161",
];

export function HoursAnalytics({
  missionaries,
  hours,
  filters,
}: HoursAnalyticsProps) {
  const [chartPeriod, setChartPeriod] = React.useState<
    "6months" | "1year" | "all"
  >("6months");
  const [topMissionariesCount, setTopMissionariesCount] = React.useState<
    5 | 10 | 15
  >(10);

  // Filter hours based on current missionary filters
  const filteredHours = useMemo(() => {
    return hours.filter((h) =>
      missionaries.some((m) => m.id === h.missionary_id)
    );
  }, [hours, missionaries]);

  // 1. Monthly Hours Trend Data
  const monthlyTrendData = useMemo(() => {
    const monthlyData = new Map<string, number>();

    filteredHours.forEach((h) => {
      const date = new Date(h.period_start_date);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      monthlyData.set(
        monthKey,
        (monthlyData.get(monthKey) || 0) + h.total_hours
      );
    });

    const sortedData = Array.from(monthlyData.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, hours]) => ({
        month: new Date(month + "-01").toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
        }),
        hours,
        monthKey: month,
      }));

    // Filter by selected period
    const now = new Date();
    const cutoffDate = new Date();

    if (chartPeriod === "6months") {
      cutoffDate.setMonth(now.getMonth() - 6);
    } else if (chartPeriod === "1year") {
      cutoffDate.setFullYear(now.getFullYear() - 1);
    }

    return chartPeriod === "all"
      ? sortedData
      : sortedData.filter(
          (item) => new Date(item.monthKey + "-01") >= cutoffDate
        );
  }, [filteredHours, chartPeriod]);

  // 2. Top Missionaries Bar Chart Data
  const topMissionariesData = useMemo(() => {
    const missionaryTotals = new Map<
      string,
      { missionary: Missionary; hours: number }
    >();

    filteredHours.forEach((h) => {
      const missionary = missionaries.find((m) => m.id === h.missionary_id);
      if (missionary) {
        const existing = missionaryTotals.get(h.missionary_id);
        missionaryTotals.set(h.missionary_id, {
          missionary,
          hours: (existing?.hours || 0) + h.total_hours,
        });
      }
    });

    return Array.from(missionaryTotals.values())
      .sort((a, b) => b.hours - a.hours)
      .slice(0, topMissionariesCount)
      .map(({ missionary, hours }) => ({
        name: `${missionary.first_name} ${missionary.last_name}`,
        hours,
        level: missionary.assignment_level || "unassigned",
      }));
  }, [filteredHours, missionaries, topMissionariesCount]);

  // 3. Assignment Level Distribution
  const assignmentLevelData = useMemo(() => {
    const levelTotals = new Map<string, number>();

    filteredHours.forEach((h) => {
      const missionary = missionaries.find((m) => m.id === h.missionary_id);
      const level = missionary?.assignment_level || "unassigned";
      levelTotals.set(level, (levelTotals.get(level) || 0) + h.total_hours);
    });

    return Array.from(levelTotals.entries()).map(([level, hours]) => ({
      name: level.charAt(0).toUpperCase() + level.slice(1),
      value: hours,
      percentage: Math.round(
        (hours / filteredHours.reduce((sum, h) => sum + h.total_hours, 0)) * 100
      ),
    }));
  }, [filteredHours, missionaries]);

  // 4. Entry Method Comparison
  const entryMethodData = useMemo(() => {
    const methodTotals = { weekly: 0, monthly: 0 };
    const methodCounts = { weekly: 0, monthly: 0 };

    filteredHours.forEach((h) => {
      methodTotals[h.entry_method] += h.total_hours;
      methodCounts[h.entry_method] += 1;
    });

    return [
      {
        method: "Weekly Entries",
        hours: methodTotals.weekly,
        entries: methodCounts.weekly,
        avgHours:
          methodCounts.weekly > 0
            ? Math.round(methodTotals.weekly / methodCounts.weekly)
            : 0,
      },
      {
        method: "Monthly Entries",
        hours: methodTotals.monthly,
        entries: methodCounts.monthly,
        avgHours:
          methodCounts.monthly > 0
            ? Math.round(methodTotals.monthly / methodCounts.monthly)
            : 0,
      },
    ];
  }, [filteredHours]);

  // 5. Hours Heatmap Data (by month and year)
  const heatmapData = useMemo(() => {
    const yearMonthData = new Map<string, Map<string, number>>();

    filteredHours.forEach((h) => {
      const date = new Date(h.period_start_date);
      const year = date.getFullYear().toString();
      const month = date.toLocaleDateString("en-US", { month: "short" });

      if (!yearMonthData.has(year)) {
        yearMonthData.set(year, new Map());
      }

      const yearData = yearMonthData.get(year)!;
      yearData.set(month, (yearData.get(month) || 0) + h.total_hours);
    });

    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const result: any[] = [];

    yearMonthData.forEach((monthData, year) => {
      months.forEach((month) => {
        result.push({
          year,
          month,
          hours: monthData.get(month) || 0,
        });
      });
    });

    return result;
  }, [filteredHours]);

  if (filteredHours.length === 0) {
    return (
      <Card>
        <CardContent sx={{ textAlign: "center", py: 8 }}>
          <BarChartIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Hours Data Available
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No hours data found for the selected filters. Try adjusting your
            search criteria.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      {/* Analytics Controls */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Time Period</InputLabel>
          <Select
            value={chartPeriod}
            label="Time Period"
            onChange={(e) => setChartPeriod(e.target.value as any)}
          >
            <MenuItem value="6months">Last 6 Months</MenuItem>
            <MenuItem value="1year">Last Year</MenuItem>
            <MenuItem value="all">All Time</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Top Count</InputLabel>
          <Select
            value={topMissionariesCount}
            label="Top Count"
            onChange={(e) => setTopMissionariesCount(e.target.value as any)}
          >
            <MenuItem value={5}>Top 5</MenuItem>
            <MenuItem value={10}>Top 10</MenuItem>
            <MenuItem value={15}>Top 15</MenuItem>
          </Select>
        </FormControl>

        <Chip
          icon={<CalendarToday />}
          label={`${filteredHours.length} entries analyzed`}
          variant="outlined"
          size="small"
        />
      </Box>

      <Grid container spacing={3}>
        {/* 1. Monthly Hours Trend */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <TrendingUp sx={{ mr: 1, color: "primary.main" }} />
                <Typography variant="h6">Monthly Hours Trend</Typography>
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: any) => [
                      `${value} hours`,
                      "Total Hours",
                    ]}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="hours"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* 2. Top Missionaries */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <BarChartIcon sx={{ mr: 1, color: "primary.main" }} />
                <Typography variant="h6">
                  Top {topMissionariesCount} Contributors
                </Typography>
              </Box>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={topMissionariesData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={120} />
                  <Tooltip
                    formatter={(value: any, name: any, props: any) => [
                      `${value} hours`,
                      `Level: ${props.payload.level}`,
                    ]}
                  />
                  <Bar dataKey="hours" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* 3. Assignment Level Distribution */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <PieChartIcon sx={{ mr: 1, color: "primary.main" }} />
                <Typography variant="h6">Hours by Level</Typography>
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={assignmentLevelData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {assignmentLevelData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [`${value} hours`]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* 5. Summary Stats */}
        <Grid item xs={12} md={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Analytics Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Paper
                    sx={{
                      p: 2,
                      textAlign: "center",
                      bgcolor: "primary.light",
                      color: "white",
                    }}
                  >
                    <Typography variant="h4" fontWeight="bold">
                      {filteredHours.reduce((sum, h) => sum + h.total_hours, 0)}
                    </Typography>
                    <Typography variant="body2">Total Hours</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper
                    sx={{
                      p: 2,
                      textAlign: "center",
                      bgcolor: "success.light",
                      color: "white",
                    }}
                  >
                    <Typography variant="h4" fontWeight="bold">
                      {new Set(filteredHours.map((h) => h.missionary_id)).size}
                    </Typography>
                    <Typography variant="body2">Active Contributors</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper
                    sx={{
                      p: 2,
                      textAlign: "center",
                      bgcolor: "info.light",
                      color: "white",
                    }}
                  >
                    <Typography variant="h4" fontWeight="bold">
                      {Math.round(
                        filteredHours.reduce(
                          (sum, h) => sum + h.total_hours,
                          0
                        ) /
                          Math.max(
                            new Set(filteredHours.map((h) => h.missionary_id))
                              .size,
                            1
                          )
                      )}
                    </Typography>
                    <Typography variant="body2">Avg Hours/Person</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper
                    sx={{
                      p: 2,
                      textAlign: "center",
                      bgcolor: "warning.light",
                      color: "white",
                    }}
                  >
                    <Typography variant="h4" fontWeight="bold">
                      {monthlyTrendData.length > 1
                        ? Math.round(
                            (((monthlyTrendData[monthlyTrendData.length - 1]
                              ?.hours || 0) -
                              (monthlyTrendData[monthlyTrendData.length - 2]
                                ?.hours || 0)) /
                              Math.max(
                                monthlyTrendData[monthlyTrendData.length - 2]
                                  ?.hours || 1,
                                1
                              )) *
                              100
                          )
                        : 0}
                      %
                    </Typography>
                    <Typography variant="body2">Month Growth</Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
