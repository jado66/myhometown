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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  TablePagination,
} from "@mui/material";
import {
  Add as AddIcon,
  BarChart as BarChartIcon,
  Schedule,
  TrendingUp,
  Person,
  Analytics,
  TableChart,
  Download,
} from "@mui/icons-material";
import { AggregateStats } from "./AggregateStats";
import { SearchAndFilter } from "./SearchAndFilter";
import { MissionaryViewDialog } from "./MissionaryViewDialog";

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
  personType: "all" | "missionary" | "volunteer";
  upcomingReleaseDays?: 30 | 60 | 90;
}

import type { MissionaryHours } from "@/types/missionary/types";
import { HoursAnalytics } from "./HoursAnalytics";

// Helper function to format numbers with commas
const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

const formatHoursValue = (num: number, hasEntries: boolean): string => {
  if (!hasEntries) return "-";
  return formatNumber(num);
};

interface HoursOverviewProps {
  missionaries: Missionary[];
  filters: FilterState;
  hours: MissionaryHours[];
  cities: any[];
  communities: any[];
  onFiltersChange: (filters: FilterState) => void;
  onEdit?: (missionary: any) => void;
}

export function HoursOverview({
  missionaries,
  filters,
  hours,
  cities,
  communities,
  onFiltersChange,
  onEdit,
}: HoursOverviewProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedMissionary, setSelectedMissionary] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(250);
  const currentYear = new Date().getFullYear();

  // Calculate hours stats based on filtered missionaries
  const filteredHours = useMemo(() => {
    const filtered = hours.filter((h) =>
      missionaries.some((m) => m.id === h.missionary_id),
    );

    return filtered;
  }, [hours, missionaries]);

  const hoursStats = useMemo(() => {
    const totalHours = filteredHours.reduce((sum, h) => sum + h.total_hours, 0);
    const uniqueMissionaries = new Set(
      filteredHours.map((h) => h.missionary_id),
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

  const categoryStats = useMemo(() => {
    let totalCRC = 0;
    let totalDOS = 0;
    let totalAdmin = 0;
    let totalSchool = 0;
    let totalEvents = 0;
    let monthCRC = 0;
    let monthDOS = 0;
    let monthAdmin = 0;
    let monthSchool = 0;
    let monthEvents = 0;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    for (const h of filteredHours) {
      // Parse the date string directly to avoid timezone issues
      const [year, month] = h.period_start_date.split("-").map(Number);
      const isThisMonth = year === currentYear && month === currentMonth + 1;

      for (const a of h.activities || []) {
        if (!a || !a.category || !a.hours) continue;
        const hrs = a.hours;
        switch (a.category) {
          case "crc":
            totalCRC += hrs;
            if (isThisMonth) monthCRC += hrs;
            break;
          case "dos":
            totalDOS += hrs;
            if (isThisMonth) monthDOS += hrs;
            break;
          case "administrative":
            totalAdmin += hrs;
            if (isThisMonth) monthAdmin += hrs;
            break;
          case "in-school-services":
            totalSchool += hrs;
            if (isThisMonth) monthSchool += hrs;
            break;
          case "community-events":
            totalEvents += hrs;
            if (isThisMonth) monthEvents += hrs;
            break;
        }
      }
    }

    return {
      totalCRC,
      totalDOS,
      totalAdmin,
      totalSchool,
      totalEvents,
      monthCRC,
      monthDOS,
      monthAdmin,
      monthSchool,
      monthEvents,
    };
  }, [filteredHours]);

  // Missionary hours summary with category breakdown
  const missionaryHoursSummary = useMemo(() => {
    const summary = new Map();
    const now = new Date();
    // Use year and month numbers for comparison to avoid timezone issues
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    missionaries.forEach((missionary) => {
      const missionaryHours = filteredHours.filter(
        (h) => h.missionary_id === missionary.id,
      );
      const hasEntries = missionaryHours.length > 0;
      const totalHours = missionaryHours.reduce(
        (sum, h) => sum + h.total_hours,
        0,
      );

      if (missionaryHours.length > 0) {
        console.log(
          `[HoursOverview] ${missionary.first_name} ${missionary.last_name}:`,
          {
            entries: missionaryHours.length,
            totalHours,
            records: missionaryHours.map((h) => ({
              id: h.id,
              period: h.period_start_date,
              hours: h.total_hours,
              created: h.created_at,
            })),
          },
        );
      }

      // Calculate category breakdowns
      let totalCRC = 0;
      let totalDOS = 0;
      let totalAdmin = 0;
      let totalSchool = 0;
      let totalEvents = 0;
      let monthCRC = 0;
      let monthDOS = 0;
      let monthAdmin = 0;
      let monthSchool = 0;
      let monthEvents = 0;
      let monthTotal = 0;
      let monthHasEntries = false;

      for (const h of missionaryHours) {
        // Parse the date string directly to avoid timezone issues
        const [year, month] = h.period_start_date.split("-").map(Number);
        const isThisMonth = year === currentYear && month === currentMonth + 1;

        if (isThisMonth) {
          monthTotal += h.total_hours;
          monthHasEntries = true;
        }

        for (const a of h.activities || []) {
          if (!a || !a.category || !a.hours) continue;
          const hrs = a.hours;
          switch (a.category) {
            case "crc":
              totalCRC += hrs;
              if (isThisMonth) monthCRC += hrs;
              break;
            case "dos":
              totalDOS += hrs;
              if (isThisMonth) monthDOS += hrs;
              break;
            case "administrative":
              totalAdmin += hrs;
              if (isThisMonth) monthAdmin += hrs;
              break;
            case "in-school-services":
              totalSchool += hrs;
              if (isThisMonth) monthSchool += hrs;
              break;
            case "community-events":
              totalEvents += hrs;
              if (isThisMonth) monthEvents += hrs;
              break;
          }
        }
      }

      summary.set(missionary.id, {
        missionary,
        totalHours,
        entries: missionaryHours.length,
        hasEntries,
        totalCRC,
        totalDOS,
        totalAdmin,
        totalSchool,
        totalEvents,
        monthTotal,
        monthHasEntries,
        monthCRC,
        monthDOS,
        monthAdmin,
        monthSchool,
        monthEvents,
      });
    });
    return Array.from(summary.values()).sort((a, b) => {
      if (a.hasEntries !== b.hasEntries) {
        return a.hasEntries ? -1 : 1;
      }
      return b.totalHours - a.totalHours;
    });
  }, [filteredHours, missionaries]);

  const loggingCount = useMemo(() => {
    return missionaryHoursSummary.filter((s) => s.hasEntries).length;
  }, [missionaryHoursSummary]);

  const paginatedMissionaryHoursSummary = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return missionaryHoursSummary.slice(start, end);
  }, [missionaryHoursSummary, page, rowsPerPage]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newSize = parseInt(event.target.value, 10);
    setRowsPerPage(newSize);
    setPage(0);
  };

  return (
    <Box>
      {/* Hours Stats Cards (shared AggregateStats) */}
      <AggregateStats
        size={2}
        cards={[
          {
            label: `Total Hours (${currentYear})`,
            value: hoursStats.total,
            color: "primary.main",
            // icon: <Schedule sx={{ color: "#fff" }} />,
          },
          {
            label: `Total CRC Hours (${currentYear})`,
            value: categoryStats.totalCRC,
            color: "primary.main",
            // icon: <BarChartIcon sx={{ color: "#fff" }} />,
          },
          {
            label: `Total DOS Hours (${currentYear})`,
            value: categoryStats.totalDOS,
            color: "primary.main",
            // icon: <Analytics sx={{ color: "#fff" }} />,
          },
          {
            label: `Total Admin Hours (${currentYear})`,
            value: categoryStats.totalAdmin,
            color: "primary.main",
            // icon: <TableChart sx={{ color: "#fff" }} />,
          },
          {
            label: `Total School Hours (${currentYear})`,
            value: categoryStats.totalSchool,
            color: "primary.main",
            // icon: <BarChartIcon sx={{ color: "#fff" }} />,
          },
          {
            label: `Total Events Hours (${currentYear})`,
            value: categoryStats.totalEvents,
            color: "primary.main",
            // icon: <Analytics sx={{ color: "#fff" }} />,
          },
          {
            label: "This Month Hours",
            value: hoursStats.thisMonth,
            color: "primary.main",
            // icon: <Schedule sx={{ color: "#fff" }} />,
          },
          {
            label: "This Month CRC",
            value: categoryStats.monthCRC,
            color: "primary.main",
            // icon: <BarChartIcon sx={{ color: "#fff" }} />,
          },
          {
            label: "This Month DOS",
            value: categoryStats.monthDOS,
            color: "primary.main",
            // icon: <Analytics sx={{ color: "#fff" }} />,
          },
          {
            label: "This Month Administrative",
            value: categoryStats.monthAdmin,
            color: "primary.main",
            // icon: <TableChart sx={{ color: "#fff" }} />,
          },
          {
            label: "This Month School",
            value: categoryStats.monthSchool,
            color: "primary.main",
            // icon: <BarChartIcon sx={{ color: "#fff" }} />,
          },
          {
            label: "This Month Events",
            value: categoryStats.monthEvents,
            color: "primary.main",
            // icon: <Analytics sx={{ color: "#fff" }} />,
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
              <BarChartIcon sx={{ mr: 1 }} />
              Hours Summary by Missionary &amp; Volunteer
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ ml: 2, fontWeight: "bold" }}
              >
                {loggingCount} Individuals Logging Hours -{"  "}
                {(missionaries.length > 0
                  ? (loggingCount / missionaries.length) * 100
                  : 0
                ).toFixed(0)}
                %
              </Typography>
            </Typography>

            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={() => {
                const formatExportHours = (
                  value: number,
                  hasEntries: boolean,
                ) => (hasEntries ? value : "-");

                const header = [
                  "Level",
                  "Assignment",
                  "Person Type",
                  "Position",
                  "First Name",
                  "Last Name",
                  "Email",
                  "Total Hours",
                  "Total CRC",
                  "Total DOS",
                  "Total Admin",
                  "Total School",
                  "Total Events",
                  "January Hours",
                  "February Hours",
                  "March Hours",
                  "April Hours",
                  "May Hours",
                  "June Hours",
                  "July Hours",
                  "August Hours",
                  "September Hours",
                  "October Hours",
                  "November Hours",
                  "December Hours",
                ];

                const rows = missionaryHoursSummary.map((summary) => {
                  // Calculate hours by month for this missionary
                  const monthlyHours = Array(12).fill(0);
                  const monthlyHasEntries = Array(12).fill(false);
                  const missionaryHours = filteredHours.filter(
                    (h) => h.missionary_id === summary.missionary.id,
                  );

                  missionaryHours.forEach((h) => {
                    const [year, month] = h.period_start_date
                      .split("-")
                      .map(Number);
                    if (year === currentYear && month >= 1 && month <= 12) {
                      monthlyHours[month - 1] += h.total_hours;
                      monthlyHasEntries[month - 1] = true;
                    }
                  });

                  // Resolve assignment based on level
                  let assignment = "";
                  const m = summary.missionary;
                  if (m.assignment_level?.toLowerCase() === "city") {
                    assignment =
                      cities.find((c) => c.id === m.city_id)?.name || "";
                  } else if (
                    m.assignment_level?.toLowerCase() === "community"
                  ) {
                    const community = communities.find(
                      (c) => c.id === m.community_id,
                    );
                    const city = cities.find((c) => c.id === m.city_id);
                    if (community && city) {
                      assignment = `${community.name} (${city.name})`;
                    } else if (community) {
                      assignment = community.name;
                    }
                  } else if (m.assignment_level?.toLowerCase() === "state") {
                    assignment = "Utah";
                  }

                  return {
                    Level: summary.missionary.assignment_level || "",
                    Assignment: assignment,
                    "Person Type":
                      summary.missionary.person_type || "missionary",
                    Position: summary.missionary.title || "",
                    "First Name": summary.missionary.first_name,
                    "Last Name": summary.missionary.last_name,
                    Email: summary.missionary.email,
                    "Total Hours": formatExportHours(
                      summary.totalHours,
                      summary.hasEntries,
                    ),
                    "Total CRC": formatExportHours(
                      summary.totalCRC,
                      summary.hasEntries,
                    ),
                    "Total DOS": formatExportHours(
                      summary.totalDOS,
                      summary.hasEntries,
                    ),
                    "Total Admin": formatExportHours(
                      summary.totalAdmin,
                      summary.hasEntries,
                    ),
                    "Total School": formatExportHours(
                      summary.totalSchool,
                      summary.hasEntries,
                    ),
                    "Total Events": formatExportHours(
                      summary.totalEvents,
                      summary.hasEntries,
                    ),
                    "January Hours": formatExportHours(
                      monthlyHours[0],
                      monthlyHasEntries[0],
                    ),
                    "February Hours": formatExportHours(
                      monthlyHours[1],
                      monthlyHasEntries[1],
                    ),
                    "March Hours": formatExportHours(
                      monthlyHours[2],
                      monthlyHasEntries[2],
                    ),
                    "April Hours": formatExportHours(
                      monthlyHours[3],
                      monthlyHasEntries[3],
                    ),
                    "May Hours": formatExportHours(
                      monthlyHours[4],
                      monthlyHasEntries[4],
                    ),
                    "June Hours": formatExportHours(
                      monthlyHours[5],
                      monthlyHasEntries[5],
                    ),
                    "July Hours": formatExportHours(
                      monthlyHours[6],
                      monthlyHasEntries[6],
                    ),
                    "August Hours": formatExportHours(
                      monthlyHours[7],
                      monthlyHasEntries[7],
                    ),
                    "September Hours": formatExportHours(
                      monthlyHours[8],
                      monthlyHasEntries[8],
                    ),
                    "October Hours": formatExportHours(
                      monthlyHours[9],
                      monthlyHasEntries[9],
                    ),
                    "November Hours": formatExportHours(
                      monthlyHours[10],
                      monthlyHasEntries[10],
                    ),
                    "December Hours": formatExportHours(
                      monthlyHours[11],
                      monthlyHasEntries[11],
                    ),
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
                  ...rows.map((row) =>
                    header.map((h) => escapeCsv((row as any)[h])).join(","),
                  ),
                ].join("\r\n");

                const blob = new Blob([csvContent], {
                  type: "text/csv;charset=utf-8;",
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `hours_overview_${new Date()
                  .toISOString()
                  .slice(0, 10)}.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
              disabled={missionaryHoursSummary.length === 0}
            >
              Export CSV
            </Button>
          </Box>

          {missionaryHoursSummary.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "grey.50" }}>
                    <TableCell
                      sx={{ borderRight: "3px solid", borderColor: "divider" }}
                    >
                      Name
                    </TableCell>
                    <Tooltip title="Total Hours">
                      <TableCell
                        align="center"
                        sx={{
                          borderRight: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        Total Hrs
                      </TableCell>
                    </Tooltip>
                    <Tooltip title="Total Community Resource Center Hours">
                      <TableCell
                        align="center"
                        sx={{
                          borderRight: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        Total CRC
                      </TableCell>
                    </Tooltip>
                    <Tooltip title="Total Days of Service Hours">
                      <TableCell
                        align="center"
                        sx={{
                          borderRight: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        Total DOS
                      </TableCell>
                    </Tooltip>
                    <Tooltip title="Total Administrative Hours">
                      <TableCell
                        align="center"
                        sx={{
                          borderRight: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        Total Admin
                      </TableCell>
                    </Tooltip>
                    <Tooltip title="Total In School Services Hours">
                      <TableCell
                        align="center"
                        sx={{
                          borderRight: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        Total School
                      </TableCell>
                    </Tooltip>
                    <Tooltip title="Total Community Events Hours">
                      <TableCell
                        align="center"
                        sx={{
                          borderRight: "3px solid",
                          borderColor: "divider",
                        }}
                      >
                        Total Events
                      </TableCell>
                    </Tooltip>
                    <Tooltip title="Current Month Total Hours">
                      <TableCell
                        align="center"
                        sx={{
                          borderRight: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        Month Hrs
                      </TableCell>
                    </Tooltip>
                    <Tooltip title="Current Month CRC Hours">
                      <TableCell
                        align="center"
                        sx={{
                          borderRight: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        Month CRC
                      </TableCell>
                    </Tooltip>
                    <Tooltip title="Current Month DOS Hours">
                      <TableCell
                        align="center"
                        sx={{
                          borderRight: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        Month DOS
                      </TableCell>
                    </Tooltip>
                    <Tooltip title="Current Month Administrative Hours">
                      <TableCell
                        align="center"
                        sx={{
                          borderRight: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        Month Admin
                      </TableCell>
                    </Tooltip>
                    <Tooltip title="Current Month School Hours">
                      <TableCell
                        align="center"
                        sx={{
                          borderRight: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        Month School
                      </TableCell>
                    </Tooltip>
                    <Tooltip title="Current Month Events Hours">
                      <TableCell align="center">Month Events</TableCell>
                    </Tooltip>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedMissionaryHoursSummary.map((summary, index) => (
                    <TableRow
                      key={summary.missionary.id}
                      hover
                      sx={{
                        backgroundColor:
                          index % 2 === 0 ? "transparent" : "grey.50",
                      }}
                    >
                      <TableCell
                        sx={{
                          borderRight: "3px solid",
                          borderColor: "divider",
                        }}
                      >
                        <Tooltip title="View details">
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                              cursor: "pointer",
                              "&:hover": {
                                "& .missionary-name": {
                                  textDecoration: "underline",
                                },
                              },
                            }}
                            onClick={() => {
                              setSelectedMissionary(summary.missionary);
                              setDetailsOpen(true);
                            }}
                          >
                            <Avatar
                              src={summary.missionary.profile_picture_url}
                              sx={{
                                bgcolor: "primary.main",
                                width: 36,
                                height: 36,
                              }}
                            >
                              {summary.missionary.first_name[0]}
                              {summary.missionary.last_name[0]}
                            </Avatar>
                            <Box>
                              <Typography
                                variant="subtitle2"
                                fontWeight="bold"
                                className="missionary-name"
                              >
                                {summary.missionary.first_name}{" "}
                                {summary.missionary.last_name}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {summary.missionary.email}
                              </Typography>
                            </Box>
                          </Box>
                        </Tooltip>
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          borderRight: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          color="primary.main"
                        >
                          {formatHoursValue(
                            summary.totalHours,
                            summary.hasEntries,
                          )}
                        </Typography>
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          borderRight: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <Typography variant="body2" fontWeight="medium">
                          {formatHoursValue(
                            summary.totalCRC,
                            summary.hasEntries,
                          )}
                        </Typography>
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          borderRight: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <Typography variant="body2" fontWeight="medium">
                          {formatHoursValue(
                            summary.totalDOS,
                            summary.hasEntries,
                          )}
                        </Typography>
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          borderRight: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <Typography variant="body2" fontWeight="medium">
                          {formatHoursValue(
                            summary.totalAdmin,
                            summary.hasEntries,
                          )}
                        </Typography>
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          borderRight: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <Typography variant="body2" fontWeight="medium">
                          {formatHoursValue(
                            summary.totalSchool,
                            summary.hasEntries,
                          )}
                        </Typography>
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          borderRight: "3px solid",
                          borderColor: "divider",
                        }}
                      >
                        <Typography variant="body2" fontWeight="medium">
                          {formatHoursValue(
                            summary.totalEvents,
                            summary.hasEntries,
                          )}
                        </Typography>
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          borderRight: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          color="secondary.main"
                        >
                          {formatHoursValue(
                            summary.monthTotal,
                            summary.monthHasEntries,
                          )}
                        </Typography>
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          borderRight: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <Typography variant="body2" fontWeight="medium">
                          {formatHoursValue(
                            summary.monthCRC,
                            summary.monthHasEntries,
                          )}
                        </Typography>
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          borderRight: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <Typography variant="body2" fontWeight="medium">
                          {formatHoursValue(
                            summary.monthDOS,
                            summary.monthHasEntries,
                          )}
                        </Typography>
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          borderRight: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <Typography variant="body2" fontWeight="medium">
                          {formatHoursValue(
                            summary.monthAdmin,
                            summary.monthHasEntries,
                          )}
                        </Typography>
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          borderRight: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <Typography variant="body2" fontWeight="medium">
                          {formatHoursValue(
                            summary.monthSchool,
                            summary.monthHasEntries,
                          )}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" fontWeight="medium">
                          {formatHoursValue(
                            summary.monthEvents,
                            summary.monthHasEntries,
                          )}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* Sum Row */}
                  <TableRow sx={{ backgroundColor: "grey.100" }}>
                    <TableCell
                      sx={{ borderRight: "3px solid", borderColor: "divider" }}
                    >
                      <Typography variant="subtitle2" fontWeight="bold">
                        Page Total ({paginatedMissionaryHoursSummary.length}{" "}
                        missionaries)
                      </Typography>
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ borderRight: "1px solid", borderColor: "divider" }}
                    >
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        color="primary.main"
                      >
                        {formatNumber(
                          paginatedMissionaryHoursSummary.reduce(
                            (sum, s) => sum + s.totalHours,
                            0,
                          ),
                        )}
                      </Typography>
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ borderRight: "1px solid", borderColor: "divider" }}
                    >
                      <Typography variant="body2" fontWeight="bold">
                        {formatNumber(
                          paginatedMissionaryHoursSummary.reduce(
                            (sum, s) => sum + s.totalCRC,
                            0,
                          ),
                        )}
                      </Typography>
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ borderRight: "1px solid", borderColor: "divider" }}
                    >
                      <Typography variant="body2" fontWeight="bold">
                        {formatNumber(
                          paginatedMissionaryHoursSummary.reduce(
                            (sum, s) => sum + s.totalDOS,
                            0,
                          ),
                        )}
                      </Typography>
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ borderRight: "1px solid", borderColor: "divider" }}
                    >
                      <Typography variant="body2" fontWeight="bold">
                        {formatNumber(
                          paginatedMissionaryHoursSummary.reduce(
                            (sum, s) => sum + s.totalAdmin,
                            0,
                          ),
                        )}
                      </Typography>
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ borderRight: "1px solid", borderColor: "divider" }}
                    >
                      <Typography variant="body2" fontWeight="bold">
                        {formatNumber(
                          paginatedMissionaryHoursSummary.reduce(
                            (sum, s) => sum + s.totalSchool,
                            0,
                          ),
                        )}
                      </Typography>
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ borderRight: "3px solid", borderColor: "divider" }}
                    >
                      <Typography variant="body2" fontWeight="bold">
                        {formatNumber(
                          paginatedMissionaryHoursSummary.reduce(
                            (sum, s) => sum + s.totalEvents,
                            0,
                          ),
                        )}
                      </Typography>
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ borderRight: "1px solid", borderColor: "divider" }}
                    >
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        color="secondary.main"
                      >
                        {formatNumber(
                          paginatedMissionaryHoursSummary.reduce(
                            (sum, s) => sum + s.monthTotal,
                            0,
                          ),
                        )}
                      </Typography>
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ borderRight: "1px solid", borderColor: "divider" }}
                    >
                      <Typography variant="body2" fontWeight="bold">
                        {formatNumber(
                          paginatedMissionaryHoursSummary.reduce(
                            (sum, s) => sum + s.monthCRC,
                            0,
                          ),
                        )}
                      </Typography>
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ borderRight: "1px solid", borderColor: "divider" }}
                    >
                      <Typography variant="body2" fontWeight="bold">
                        {formatNumber(
                          paginatedMissionaryHoursSummary.reduce(
                            (sum, s) => sum + s.monthDOS,
                            0,
                          ),
                        )}
                      </Typography>
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ borderRight: "1px solid", borderColor: "divider" }}
                    >
                      <Typography variant="body2" fontWeight="bold">
                        {formatNumber(
                          paginatedMissionaryHoursSummary.reduce(
                            (sum, s) => sum + s.monthAdmin,
                            0,
                          ),
                        )}
                      </Typography>
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ borderRight: "1px solid", borderColor: "divider" }}
                    >
                      <Typography variant="body2" fontWeight="bold">
                        {formatNumber(
                          paginatedMissionaryHoursSummary.reduce(
                            (sum, s) => sum + s.monthSchool,
                            0,
                          ),
                        )}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" fontWeight="bold">
                        {formatNumber(
                          paginatedMissionaryHoursSummary.reduce(
                            (sum, s) => sum + s.monthEvents,
                            0,
                          ),
                        )}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <TablePagination
                component="div"
                count={missionaryHoursSummary.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[10, 25, 50, 100, 250]}
                labelRowsPerPage="Rows per page"
              />
            </TableContainer>
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

      {/* Details Dialog */}
      <MissionaryViewDialog
        open={detailsOpen && !!selectedMissionary}
        onClose={() => setDetailsOpen(false)}
        onEdit={
          onEdit
            ? (missionary) => {
                setDetailsOpen(false);
                onEdit(missionary);
              }
            : undefined
        }
        missionary={selectedMissionary}
        cities={cities}
        communities={communities}
        hoursData={
          selectedMissionary
            ? {
                totalHours:
                  missionaryHoursSummary.find(
                    (s) => s.missionary.id === selectedMissionary.id,
                  )?.totalHours || 0,
                currentMonthHours:
                  missionaryHoursSummary.find(
                    (s) => s.missionary.id === selectedMissionary.id,
                  )?.monthTotal || 0,
                hasEntries:
                  (missionaryHoursSummary.find(
                    (s) => s.missionary.id === selectedMissionary.id,
                  )?.entries || 0) > 0,
                entryCount:
                  missionaryHoursSummary.find(
                    (s) => s.missionary.id === selectedMissionary.id,
                  )?.entries || 0,
              }
            : undefined
        }
      />
    </Box>
  );
}
