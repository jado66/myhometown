"use client";

import React from "react";
import { Typography, Paper } from "@mui/material";

const ServiceDayHeader = ({ dateStr, totalHours }) => {
  return (
    <Paper
      sx={{
        p: 2,
        mb: 2,
        bgcolor: "primary.main",
        color: "primary.contrastText",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Typography variant="h6">Day of Service: {dateStr}</Typography>
      <Typography variant="subtitle1">Total Hours: {totalHours}</Typography>
    </Paper>
  );
};

export default ServiceDayHeader;
