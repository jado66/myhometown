"use client";

import { useMemo, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  Paper,
  Divider,
} from "@mui/material";

interface ScrollableWeeksProps {
  hourEntries?: MissionaryHourEntry[];
}

interface MissionaryHourEntry {
  id: string;
  period_start_date: string;
  entry_method: "weekly" | "monthly";
  total_hours: number;
  location: string | null;
  activities: any[];
  created_at: string;
}

interface WeekData {
  weekNumber: number;
  startDate: Date;
  endDate: Date;
  isCurrentWeek: boolean;
}

interface MonthGroup {
  month: string;
  monthNumber: number;
  weeks: WeekData[];
}

export function ScrollableWeeks({ hourEntries = [] }: ScrollableWeeksProps) {
  const currentWeekRef = useRef<HTMLDivElement>(null);
  const currentMonthRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Process hour entries into week and month inputs
  const { weekInputs, monthInputs } = useMemo(() => {
    const weekInputs: Record<number, number> = {};
    const monthInputs: Record<number, number> = {};

    hourEntries.forEach((entry) => {
      const startDate = new Date(entry.period_start_date);

      if (entry.entry_method === "weekly") {
        // Calculate week number of the year
        const yearStart = new Date(startDate.getFullYear(), 0, 1);
        const weekNumber = Math.ceil(
          ((startDate.getTime() - yearStart.getTime()) / 86400000 +
            yearStart.getDay() +
            1) /
            7
        );
        weekInputs[weekNumber] = entry.total_hours;
      } else if (entry.entry_method === "monthly") {
        monthInputs[startDate.getMonth()] = entry.total_hours;
      }
    });

    return { weekInputs, monthInputs };
  }, [hourEntries]);

  const { weeks, monthGroups } = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const currentDate = new Date();
    const weeks: WeekData[] = [];

    // Start from the first day of the year
    const startOfYear = new Date(currentYear, 0, 1);

    // Find the first Monday of the year (or use Jan 1 if it's a Monday)
    const firstMonday = new Date(startOfYear);
    const dayOfWeek = startOfYear.getDay();
    const daysToMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
    if (dayOfWeek !== 1) {
      firstMonday.setDate(startOfYear.getDate() + daysToMonday);
    }

    const weekStart = new Date(firstMonday);
    let weekNumber = 1;

    // Generate weeks for the entire year
    while (weekStart.getFullYear() === currentYear) {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      // Check if this is the current week
      const isCurrentWeek = currentDate >= weekStart && currentDate <= weekEnd;

      weeks.push({
        weekNumber,
        startDate: new Date(weekStart),
        endDate: new Date(weekEnd),
        isCurrentWeek,
      });

      // Move to next week
      weekStart.setDate(weekStart.getDate() + 7);
      weekNumber++;

      // Stop if we've gone into the next year
      if (weekStart.getFullYear() > currentYear) {
        break;
      }
    }

    // Group weeks by month, but filter out weeks with no input
    const monthGroups: MonthGroup[] = [];
    const monthMap = new Map<number, WeekData[]>();

    weeks.forEach((week) => {
      // Only include weeks that have input
      if (weekInputs[week.weekNumber]) {
        const monthKey = week.startDate.getMonth();
        if (!monthMap.has(monthKey)) {
          monthMap.set(monthKey, []);
        }
        monthMap.get(monthKey)!.push(week);
      }
    });

    // Convert to array format
    monthMap.forEach((monthWeeks, monthNumber) => {
      const monthName = new Date(
        currentYear,
        monthNumber,
        1
      ).toLocaleDateString("en-US", {
        month: "long",
      });
      monthGroups.push({
        month: monthName,
        monthNumber,
        weeks: monthWeeks,
      });
    });

    // Sort by month number
    monthGroups.sort((a, b) => a.monthNumber - b.monthNumber);

    return { weeks, monthGroups };
  }, [hourEntries, weekInputs]);

  const formatWeekRange = (start: Date, end: Date) => {
    const startMonth = start.toLocaleDateString("en-US", { month: "short" });
    const endMonth = end.toLocaleDateString("en-US", { month: "short" });

    if (start.getMonth() === end.getMonth()) {
      return `${startMonth} ${start.getDate()}-${end.getDate()}`;
    }
    return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}`;
  };

  // Scroll to current month on mount
  useEffect(() => {
    if (currentMonthRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const currentMonth = currentMonthRef.current;

      // Calculate the position to center the current month
      const containerHeight = container.clientHeight;
      const monthTop = currentMonth.offsetTop;
      const monthHeight = currentMonth.clientHeight;

      const scrollTop = monthTop - containerHeight / 2 + monthHeight / 2;

      container.scrollTo({
        top: Math.max(0, scrollTop),
        behavior: "smooth",
      });
    }
  }, [monthGroups]);

  return (
    <Paper
      elevation={3}
      sx={{
        maxHeight: "600px",
        position: "relative",
        overflow: "hidden",
        borderRadius: 2,
        mt: 4,
      }}
    >
      <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
        <Typography variant="h5" fontWeight="bold">
          Yearly Overview
        </Typography>
      </Box>
      {/* Fade overlays */}
      <Box
        sx={{
          position: "absolute",
          top: 65,
          left: 0,
          right: 0,
          height: "40px",
          background:
            "linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "40px",
          background:
            "linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />

      {/* Scrollable content */}
      <Box
        ref={scrollContainerRef}
        sx={{
          height: "100%",
          overflowY: "auto",
          p: 3,
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-track": {
            background: "#f1f1f1",
            borderRadius: "3px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#c1c1c1",
            borderRadius: "3px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "#a8a8a8",
          },
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          {monthGroups.map((monthGroup, index) => {
            // Determine if this is the current month
            const now = new Date();
            const isCurrentMonth = monthGroup.monthNumber === now.getMonth();
            return (
              <Box
                key={monthGroup.monthNumber}
                ref={isCurrentMonth ? currentMonthRef : undefined}
              >
                <Box sx={{ display: "flex", gap: 2, py: 2 }}>
                  {/* Month Label */}
                  <Box
                    sx={{
                      width: "100px",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Typography
                        variant="h6"
                        color="text.secondary"
                        sx={{
                          fontWeight: 600,
                          position: "sticky",

                          top: 0,
                          mb: 0,
                          backgroundColor: "background.paper",
                        }}
                      >
                        {monthGroup.month}
                      </Typography>
                      {monthInputs[monthGroup.monthNumber] && (
                        <Box
                          sx={{
                            px: 1,
                            backgroundColor: "primary.main",
                            color: "primary.contrastText",
                            borderRadius: "50%",

                            height: 24,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.75rem",
                            fontWeight: "bold",
                          }}
                        >
                          {monthInputs[monthGroup.monthNumber]}
                        </Box>
                      )}
                    </Box>
                    {!monthInputs[monthGroup.monthNumber] && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ ml: 1 }}
                      >
                        {monthGroup.weeks.length}{" "}
                        {monthGroup.weeks.length === 1 ? "week" : "weeks"}
                      </Typography>
                    )}
                  </Box>

                  {/* Weeks Grid or Month Display */}
                  <Box sx={{ flex: 1 }}>
                    {monthInputs[monthGroup.monthNumber] ? (
                      // Show just the month with number, no individual weeks
                      <Box sx={{ py: 2, ml: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          hours logged this month
                        </Typography>
                      </Box>
                    ) : (
                      // Show individual weeks (already filtered to only those with input)
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "repeat(2, 1fr)",
                          gap: 2,
                        }}
                      >
                        {monthGroup.weeks.map((week) => (
                          <Card
                            key={week.weekNumber}
                            ref={week.isCurrentWeek ? currentWeekRef : null}
                            elevation={week.isCurrentWeek ? 4 : 1}
                            sx={{
                              transition: "all 0.2s ease-in-out",
                              backgroundColor: week.isCurrentWeek
                                ? "primary.main"
                                : "background.paper",
                              color: week.isCurrentWeek
                                ? "primary.contrastText"
                                : "text.primary",
                              "&:hover": {
                                elevation: 3,
                                transform: "translateY(-2px)",
                                backgroundColor: week.isCurrentWeek
                                  ? "primary.dark"
                                  : "action.hover",
                              },
                              border: week.isCurrentWeek
                                ? "2px solid"
                                : "1px solid",
                              borderColor: week.isCurrentWeek
                                ? "primary.dark"
                                : "divider",
                            }}
                          >
                            <CardContent
                              sx={{ p: 2, "&:last-child": { pb: 2 } }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  mb: 1,
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 600,
                                    color: week.isCurrentWeek
                                      ? "primary.contrastText"
                                      : "text.primary",
                                  }}
                                >
                                  {formatWeekRange(
                                    week.startDate,
                                    week.endDate
                                  )}
                                </Typography>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
                                  {weekInputs[week.weekNumber] && (
                                    <Box
                                      sx={{
                                        backgroundColor: week.isCurrentWeek
                                          ? "primary.contrastText"
                                          : "primary.main",
                                        color: week.isCurrentWeek
                                          ? "primary.main"
                                          : "primary.contrastText",
                                        borderRadius: "50%",
                                        width: 20,
                                        height: 20,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "0.7rem",
                                        fontWeight: "bold",
                                      }}
                                    >
                                      {weekInputs[week.weekNumber]}
                                    </Box>
                                  )}
                                  {week.isCurrentWeek && (
                                    <Box
                                      sx={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: "50%",
                                        backgroundColor: "primary.contrastText",
                                      }}
                                    />
                                  )}
                                </Box>
                              </Box>
                              {week.isCurrentWeek && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontWeight: 500,
                                    color: "primary.contrastText",
                                    opacity: 0.8,
                                  }}
                                >
                                  Current Week
                                </Typography>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </Box>
                    )}
                  </Box>
                </Box>

                {/* Horizontal divider between months */}
                {index < monthGroups.length - 1 && (
                  <Divider sx={{ my: 1, borderColor: "divider" }} />
                )}
              </Box>
            );
          })}
        </Box>
      </Box>
    </Paper>
  );
}
