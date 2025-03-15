import React from "react";
import { Box, Typography } from "@mui/material";
import { useProjectForm } from "@/contexts/ProjectFormProvider";
import ProjectTextField from "./ProjectTextField";

const ReportingStep = () => {
  const { formData, handleInputChange } = useProjectForm();

  const handleToolAdd = (e, category) => {
    if (e.key === "Enter" && e.target.value.trim()) {
      e.preventDefault();
      const value = e.target.value.trim();
      const categoryMap = {
        tools: "volunteerTools",
        equipment: "equipment",
        homeownerMaterials: "homeownerMaterials",
        otherMaterials: "otherMaterials",
      };
      const fieldName = categoryMap[category];
      const currentItems = formData[fieldName] || [];
      const newItems = [...currentItems, value];
      handleInputChange(fieldName, newItems);
      e.target.value = "";
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="h6">Project Reporting</Typography>
      <ProjectTextField
        label="Number of Volunteers"
        type="number"
        key="actual_volunteers"
        helperText="The number of volunteers who actually participated in the project."
        min={0}
        value={formData.actual_volunteers}
        onChange={(e) => handleInputChange("actual_volunteers", e.target.value)}
      />

      <ProjectTextField
        label="Actual duration of project (hours)"
        type="number"
        key="actual_project_duration"
        min={0}
        max={12}
        value={formData.actual_project_duration}
        onChange={(e) =>
          handleInputChange("actual_project_duration", e.target.value)
        }
        helperText="This is NOT the total number of man hours. For example, if the project started at 8:00 AM and ended at noon, the duration would be 4 hours."
      />
    </Box>
  );
};

export default ReportingStep;
