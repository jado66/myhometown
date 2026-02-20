"use client";

import React from "react";
import { Typography, Box } from "@mui/material";
import VolunteerNeedsChart from "./VolunteersNeededChart";

const VolunteersNeededSection = ({ projects, daysOfService, responses }) => {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Volunteer Distribution by Project
      </Typography>
      <VolunteerNeedsChart
        projects={projects}
        daysOfService={daysOfService}
        responses={responses}
      />
    </Box>
  );
};

export default VolunteersNeededSection;
