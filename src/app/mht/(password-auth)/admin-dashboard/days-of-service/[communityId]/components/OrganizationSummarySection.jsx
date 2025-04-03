"use client";

import React from "react";
import {
  Typography,
  Box,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
} from "@mui/material";
import { Assignment, ExpandMore as ExpandMoreIcon } from "@mui/icons-material";
import ServiceDayHeader from "./ServiceDayHeader";

const OrganizationSummarySection = ({
  expanded,
  onChange,
  projectSummary,
  generateCommunityReport,
}) => {
  // Group projects by date
  const projectsByDate = projectSummary.reduce((acc, project) => {
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
    <Accordion expanded={expanded} onChange={onChange} sx={{ mb: 2 }}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="organization-summary-content"
        id="organization-summary-header"
      >
        <Typography variant="h6">Organization Volunteer Summary</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Button
          variant="outlined"
          color="primary"
          sx={{ my: 2, display: "flex" }}
          onClick={generateCommunityReport}
        >
          <Assignment sx={{ mr: 1 }} />
          Print Org/Group Volunteer Hours Report
        </Button>

        {sortedDates.length === 0 ? (
          <EmptyOrganizationTable />
        ) : (
          sortedDates.map((dateStr) => {
            const projectsOnDate = projectsByDate[dateStr];

            // Calculate total volunteer hours for this date
            const dateTotalHours = projectsOnDate.reduce(
              (total, project) => total + project.volunteerHours,
              0
            );

            // Group by stake first
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
                  ([stakeName, stakeProjects]) => {
                    // Calculate total volunteer hours for this stake on this date
                    const stakeTotalHours = stakeProjects.reduce(
                      (total, project) => total + project.volunteerHours,
                      0
                    );

                    // Now group by partner group within this stake
                    const projectsByGroup = stakeProjects.reduce(
                      (acc, project) => {
                        const groupName =
                          project.partnerGroup || "Unknown Group";
                        if (!acc[groupName]) {
                          acc[groupName] = [];
                        }
                        acc[groupName].push(project);
                        return acc;
                      },
                      {}
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

                        <OrganizationGroupsTable
                          projectsByGroup={projectsByGroup}
                          stakeName={stakeName}
                        />
                      </Box>
                    );
                  }
                )}
              </Box>
            );
          })
        )}
      </AccordionDetails>
    </Accordion>
  );
};

const EmptyOrganizationTable = () => (
  <TableContainer component={Paper} variant="outlined">
    <Table size="medium">
      <TableHead>
        <TableRow>
          <TableCell>Group Name</TableCell>
          <TableCell>Organization</TableCell>
          <TableCell align="right">Volunteers</TableCell>
          <TableCell align="right">Duration (hrs)</TableCell>
          <TableCell align="right">Volunteer Hours</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell colSpan={5} align="center">
            No organization data found
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </TableContainer>
);

const OrganizationGroupsTable = ({ projectsByGroup, stakeName }) => (
  <TableContainer component={Paper} variant="outlined">
    <Table size="medium">
      <TableHead>
        <TableRow>
          <TableCell>Group Name</TableCell>
          <TableCell align="right">Volunteers</TableCell>
          <TableCell align="right">Duration (hrs)</TableCell>
          <TableCell align="right">Volunteer Hours</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {Object.entries(projectsByGroup).map(([groupName, groupProjects]) => {
          // Sum up volunteers, duration, and hours for this group
          const groupVolunteers = groupProjects.reduce(
            (sum, p) => sum + p.volunteerCount,
            0
          );
          const groupDuration =
            groupProjects.reduce((sum, p) => sum + p.duration, 0) /
            groupProjects.length; // Average duration
          const groupHours = groupProjects.reduce(
            (sum, p) => sum + p.volunteerHours,
            0
          );

          return (
            <TableRow key={`${stakeName}-${groupName}`}>
              <TableCell>{groupName}</TableCell>
              <TableCell align="right">{groupVolunteers}</TableCell>
              <TableCell align="right">{groupDuration}</TableCell>
              <TableCell align="right">{groupHours}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  </TableContainer>
);

export default OrganizationSummarySection;
