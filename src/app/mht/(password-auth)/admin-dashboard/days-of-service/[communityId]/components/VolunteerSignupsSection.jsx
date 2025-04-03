"use client";

import React from "react";
import {
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { ExpandMore as ExpandMoreIcon } from "@mui/icons-material";
import { FormResponseTable } from "@/components/FormResponseTable";

const VolunteerSignupsSection = ({
  expanded,
  onChange,
  formId,
  responses,
  formConfig,
  onViewResponse,
  onDeleteResponse,
  daysOfService,
  projectsMap,
  isLoading,
}) => {
  return (
    <Accordion expanded={expanded} onChange={onChange} sx={{ mb: 2 }}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="volunteer-signups-content"
        id="volunteer-signups-header"
      >
        <Typography variant="h6">Volunteer Signups</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <FormResponseTable
          formId={formId}
          responses={responses}
          formData={formConfig}
          onViewResponse={onViewResponse}
          onDeleteResponse={onDeleteResponse}
          daysOfService={daysOfService}
          projectsData={projectsMap}
          isLoading={isLoading}
        />
      </AccordionDetails>
    </Accordion>
  );
};

export default VolunteerSignupsSection;
