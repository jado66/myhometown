"use client";

import React from "react";
import { Typography, Box } from "@mui/material";
import { FormResponseTable } from "@/components/FormResponseTable";

const VolunteerSignupsSection = ({
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
    <Box sx={{ mb: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Volunteer Signups
      </Typography>
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
    </Box>
  );
};

export default VolunteerSignupsSection;
