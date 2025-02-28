import React from "react";
import { Box, Typography, Divider, Alert, InputAdornment } from "@mui/material";
import { useProjectForm } from "@/contexts/ProjectFormProvider";
import ProjectTextField from "./ProjectTextField";
import TaskTable from "@/components/days-of-service/form-components/TaskTable";
import { ProjectResources } from "./ProjectResources";

const BudgetStep = () => {
  const { formData, handleInputChange, handleNumberInputChange } =
    useProjectForm();

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
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="h4" sx={{ mt: 2, mb: 1, textAlign: "center" }}>
        This step of the form is typically filled out by the Resource Couple
      </Typography>
      <Divider />

      <Typography variant="h6">Budget Estimates</Typography>
      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography>
          Once you enter this budget information and navigate away from this
          step you will not be able to see this again. Talk to a Resource
          Developer, or Neighborhood Services Director if this needs to be
          changed after the fact.
        </Typography>
      </Alert>
      <ProjectTextField
        label="Resource Budget Description"
        multiline
        rows={4}
        key="budget"
        value={formData.budget}
        onChange={(e) => handleInputChange("budget", e.target.value)}
      />
      <ProjectTextField
        label="Resource Budget Estimates"
        type="number"
        key="budget estimates"
        min={0}
        value={formData.budget_estimates}
        onChange={(e) =>
          handleNumberInputChange("budget_estimates", e.target.value)
        }
        hasInputAdornment
        InputProps={{
          startAdornment: <InputAdornment position="start">$</InputAdornment>,
        }}
      />
      <Divider sx={{ my: 1 }} />

      <ProjectTextField
        label="Property Owner's Ability Description"
        multiline
        rows={4}
        key="homeowner ability"
        value={formData.homeowner_ability}
        onChange={(e) => handleInputChange("homeowner_ability", e.target.value)}
      />
      <ProjectTextField
        label="Property Owner's Ability Estimates"
        type="number"
        key="homeowner ability estimates"
        value={formData.homeowner_ability_estimates}
        min={0}
        onChange={(e) =>
          handleNumberInputChange("homeowner_ability_estimates", e.target.value)
        }
        hasInputAdornment
        InputProps={{
          startAdornment: <InputAdornment position="start">$</InputAdornment>,
        }}
      />
    </Box>
  );
};

export default BudgetStep;
