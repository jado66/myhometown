"use client";

import type React from "react";

import { useState, useMemo } from "react";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import {
  Box,
  Paper,
  Typography,
  Divider,
  Table,
  TableContainer,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import { People, Warning } from "@mui/icons-material";

// Define types based on the actual data structure
interface Project {
  id: string;
  name: string;
  dateStr: string;
  location: string;
  stakeName: string;
  partnerGroup: string;
  volunteerCount: number;
  duration: number;
  volunteerHours: number;
  status: string;
}

interface DayOfService {
  id: string;
  start_date: string;
  end_date: string;
  name: string;
  short_id: string;
}

interface WhoAreYou {
  type: string;
  value?: string;
  projectId?: string;
  hasPrepDay?: boolean;
}

interface VolunteerResponse {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  whoAreYou: WhoAreYou;
  minorVolunteers: Array<{ name: string; age: number }> | null;
  dayOfService: string;
  submissionId: string;
}

interface VolunteerNeedsTableProps {
  projects: Project[];
  daysOfService: DayOfService[];
  responses: VolunteerResponse[];
}

// Helper types for processed data
interface ProcessedProject extends Project {
  volunteersSignedUp: number;
  volunteersNeeded: number;
  dayOfServiceId: string;
}

interface ProcessedDay {
  id: string;
  name: string;
  date: string;
  dateFormatted: string;
  projects: ProcessedProject[];
}

export default function VolunteerNeededChart({
  projects,
  daysOfService,
  responses,
}: VolunteerNeedsTableProps) {
  const [sortType, setSortType] = useState<"alphabetical" | "percentage">(
    "alphabetical"
  );

  // Handle sort change
  const handleSortChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSortType(event.target.value as "alphabetical" | "percentage");
  };

  // Process data to calculate volunteers signed up for each project
  const processedData = useMemo(() => {
    // First, map days of service to a more usable format
    const formattedDays = daysOfService.map((day) => ({
      id: day.id,
      name:
        day.name ||
        `Service Day (${new Date(day.end_date).toLocaleDateString()})`,
      date: day.end_date,
      dateFormatted: new Date(day.end_date).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
      projects: [] as ProcessedProject[],
    }));

    // Assign projects to their respective days of service
    projects.forEach((project: any) => {
      const dayToUse =
        formattedDays.find((day) => day.id === project.dayOfServiceId) ||
        formattedDays[0];

      if (dayToUse) {
        // Count volunteers that have this project's ID in their whoAreYou.projectId
        let volunteersSignedUp = 0;

        const projectResponses = responses.filter(
          (response) =>
            response.dayOfService === dayToUse.id &&
            response.whoAreYou &&
            "projectId" in response.whoAreYou &&
            response.whoAreYou.projectId === project.id
        );

        // Count adult volunteers (one per response)
        volunteersSignedUp += projectResponses.length;

        // Count minor volunteers
        projectResponses.forEach((response) => {
          if (
            response.minorVolunteers &&
            Array.isArray(response.minorVolunteers)
          ) {
            volunteersSignedUp += response.minorVolunteers.length;
          }
        });

        // Add project with volunteer count to the day
        dayToUse.projects.push({
          ...project,
          volunteersSignedUp,
          volunteersNeeded: Math.max(
            0,
            project.volunteerCount > 0
              ? project.volunteerCount - volunteersSignedUp
              : 10 - volunteersSignedUp
          ),
          dayOfServiceId: dayToUse.id,
        });
      }
    });

    return formattedDays;
  }, [projects, daysOfService, responses]);

  // Prepare data for the current day's table (always shows first/only day)
  const currentDayData = useMemo(() => {
    if (!processedData[0] || !processedData[0].projects)
      return [];

    const projects = [...processedData[0].projects];
    if (sortType === "alphabetical") {
      projects.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortType === "percentage") {
      projects.sort((a, b) => {
        // Calculate percentage signed up for each project
        const percentA =
          a.volunteersSignedUp /
            (a.volunteerCount > 0 ? a.volunteerCount : 10) || 0;
        const percentB =
          b.volunteersSignedUp /
            (b.volunteerCount > 0 ? b.volunteerCount : 10) || 0;
        return percentA - percentB;
      });
    }
    return projects;
  }, [processedData, sortType]);

  // Calculate summary statistics for the current day
  const currentDaySummary = useMemo(() => {
    if (!processedData[0] || !processedData[0].projects) {
      return { totalNeeded: 0, totalSignedUp: 0, projectsNeedingVolunteers: 0 };
    }

    const projects = processedData[0].projects;

    // For projects with volunteerCount of 0, assume 10 are needed
    const totalNeeded = projects.reduce(
      (sum, p) => sum + (p.volunteerCount > 0 ? p.volunteerCount : 10),
      0
    );
    const totalSignedUp = projects.reduce(
      (sum, p) => sum + p.volunteersSignedUp,
      0
    );
    const projectsNeedingVolunteers = projects.filter(
      (p) => p.volunteersNeeded > 0
    ).length;

    return { totalNeeded, totalSignedUp, projectsNeedingVolunteers };
  }, [processedData]);

  // If no data is available
  if (!daysOfService.length || !projects.length) {
    return (
      <Typography variant="h6" align="center">
        No project data available
      </Typography>
    );
  }

  return (
    <>
      {/* Sorting Filter */}
      <Box sx={{ mb: 2, minWidth: 200 }}>
        <FormControl fullWidth size="small">
          <InputLabel id="sort-type-label">Sort By</InputLabel>
          <Select
            labelId="sort-type-label"
            id="sort-type-select"
            value={sortType}
            label="Sort By"
            onChange={handleSortChange}
          >
            <MenuItem value="alphabetical">Alphabetical (A-Z)</MenuItem>
            <MenuItem value="percentage">
              Percentage Signed Up (Lowest First)
            </MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Summary Stats */}
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
        <Chip
          icon={<People />}
          label={`${currentDaySummary.totalSignedUp} / ${currentDaySummary.totalNeeded} Volunteers`}
          color="primary"
        />

        {currentDaySummary.projectsNeedingVolunteers > 0 && (
          <Chip
            icon={<Warning />}
            label={`${currentDaySummary.projectsNeedingVolunteers} Projects Need Volunteers`}
            color="warning"
          />
        )}
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Projects Table */}
      <TableContainer component={Paper} variant="outlined">
        <Table size="medium">
          <TableHead>
            <TableRow>
              <TableCell>Project Name</TableCell>
              <TableCell align="center">
                Volunteers (Signed Up / Needed)
              </TableCell>
              <TableCell align="center">More Volunteers Needed</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentDayData.length > 0 ? (
              currentDayData.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <Typography variant="body2">{project.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {project.location} • {project.stakeName}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">
                      {project.volunteersSignedUp} /{" "}
                      {project.volunteerCount > 0 ? project.volunteerCount : 10}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    {project.volunteersNeeded > 0 ? (
                      <Chip
                        label={`${project.volunteersNeeded} more needed`}
                        color="warning"
                        size="small"
                      />
                    ) : (
                      <Chip
                        label="Fully staffed"
                        color="success"
                        size="small"
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  No projects found for this day of service
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
