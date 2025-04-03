"use client";

import React from "react";
import {
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { ExpandMore as ExpandMoreIcon } from "@mui/icons-material";
import VolunteerNeedsChart from "./VolunteersNeededChart";

const VolunteersNeededSection = ({
  expanded,
  onChange,
  projects,
  daysOfService,
  responses,
}) => {
  return (
    <Accordion expanded={expanded} onChange={onChange}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="volunteers-needed-content"
        id="volunteers-needed-header"
      >
        <Typography variant="h6">Volunteers Needed Chart</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <VolunteerNeedsChart
          projects={projects}
          daysOfService={daysOfService}
          responses={responses}
        />
      </AccordionDetails>
    </Accordion>
  );
};

export default VolunteersNeededSection;
