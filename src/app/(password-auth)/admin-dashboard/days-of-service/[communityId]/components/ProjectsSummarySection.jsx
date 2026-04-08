"use client";

import React from "react";
import {
  Typography,
  Box,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
} from "@mui/material";
import { Assignment, Warning } from "@mui/icons-material";
import ServiceDayHeader from "./ServiceDayHeader";
import TightedCell from "./TightedCell";

const ProjectsSummarySection = ({
  projectSummary,
  generateCommunityReport,
}) => {
  // Group projects by date first
  const projectsByDate = projectSummary.reduce((acc, project) => {
    // Use dateStr as the key for grouping
    const dateKey = project.dateStr;
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(project);
    return acc;
  }, {});

  // Sort dates chronologically
  const sortedDates = Object.keys(projectsByDate).sort((a, b) => {
    return new Date(a) - new Date(b);
  });

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Days Of Service Summary
      </Typography>
      <Box>
        <Button
          variant="outlined"
          color="primary"
          sx={{ my: 2, display: "flex" }}
          onClick={generateCommunityReport}
        >
          <Assignment sx={{ mr: 1 }} />
          Print Days of Service Summary Report
        </Button>

        {sortedDates.length === 0 ? (
          <EmptyProjectsTable />
        ) : (
          sortedDates.map((dateStr) => {
            const projectsOnDate = projectsByDate[dateStr];

            // Calculate total volunteer hours for this date
            const dateTotalHours = projectsOnDate.reduce(
              (total, project) => total + project.volunteerHours,
              0,
            );

            // Group the projects on this date by stake
            const projectsByStake = projectsOnDate.reduce((acc, project) => {
              const stakeName = project.stakeName || "Unknown Organization";
              if (!acc[stakeName]) {
                acc[stakeName] = [];
              }
              acc[stakeName].push(project);
              return acc;
            }, {});

            return (
              <Box key={dateStr} sx={{ mb: 5 }}>
                <ServiceDayHeader
                  dateStr={dateStr}
                  totalHours={dateTotalHours}
                />

                {/* Organizations under this date */}
                {Object.entries(projectsByStake).map(
                  ([stakeName, projects]) => {
                    // Calculate total volunteer hours for this stake on this date
                    const stakeTotalHours = projects.reduce(
                      (total, project) => total + project.volunteerHours,
                      0,
                    );

                    return (
                      <Box
                        key={`${dateStr}-${stakeName}`}
                        sx={{ mb: 3, p: 1.5 }}
                      >
                        <Typography
                          variant="subtitle1"
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <span>{stakeName}</span>
                          <span>Total Hours: {stakeTotalHours}</span>
                        </Typography>

                        <ProjectsTable projects={projects} />
                      </Box>
                    );
                  },
                )}
              </Box>
            );
          })
        )}
      </Box>
    </Box>
  );
};

const EmptyProjectsTable = () => (
  <TableContainer component={Paper} variant="outlined">
    <Table size="medium">
      <TableHead>
        <TableRow>
          <TableCell>Project Name</TableCell>
          <TableCell>Date</TableCell>
          <TableCell>Location</TableCell>
          <TableCell>Organization</TableCell>
          <TableCell>Partner Group</TableCell>
          <TableCell align="right">Volunteers</TableCell>
          <TableCell align="right">Duration (hrs)</TableCell>
          <TableCell align="right">Volunteer Hours</TableCell>
          <TableCell>Status</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell colSpan={9} align="center">
            No projects found
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </TableContainer>
);

const ProjectsTable = ({ projects }) => (
  <TableContainer component={Paper} variant="outlined">
    <Table size="medium">
      <TableHead>
        <TableRow>
          <TableCell>Project Name</TableCell>
          <TableCell>Project City</TableCell>
          <TableCell>Partner Group</TableCell>
          <TableCell align="right">Volunteers</TableCell>
          <TableCell align="right">Duration (hrs)</TableCell>
          <TableCell align="right">Volunteer Hours</TableCell>
          <TableCell>Status</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {projects.map((project) => (
          <TableRow key={project.id}>
            <TightedCell>{project.name}</TightedCell>
            <TightedCell>{project.location?.toLowerCase()}</TightedCell>
            <TightedCell>
              {project.partnerGroup ? (
                project.partnerGroup
              ) : (
                <Typography
                  sx={{
                    color: "danger",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Warning sx={{ mr: 1, color: "#dea835" }} />
                  Needed
                </Typography>
              )}
            </TightedCell>
            <TightedCell align="right">{project.volunteerCount}</TightedCell>
            <TightedCell align="right">{project.duration}</TightedCell>
            <TightedCell align="right">{project.volunteerHours}</TightedCell>
            <TightedCell>{project.status}</TightedCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

export default ProjectsSummarySection;
