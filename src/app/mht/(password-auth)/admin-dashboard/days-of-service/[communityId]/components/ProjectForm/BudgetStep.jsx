import React from "react";
import { Box, Typography, Divider, Alert, InputAdornment } from "@mui/material";
import { useProjectForm } from "@/contexts/ProjectFormProvider";
import ProjectTextField from "./ProjectTextField";
import TaskTable from "@/components/days-of-service/form-components/TaskTable";
import { ProjectResources } from "./ProjectResources";

const BudgetStep = () => {
  const {
    formData,
    handleInputChange,
    handleNumberInputChange,
    isBudgetAuthenticated,
  } = useProjectForm();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="h4" sx={{ mt: 2, mb: 1, textAlign: "center" }}>
        This step is typically filled out by the Resource Couple/Project Manager
      </Typography>
      <Divider />

      <Typography variant="h6">Budget Estimates</Typography>
      {!isBudgetAuthenticated && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography>
            Once you enter this budget information and navigate away from this
            step you will not be able to see this again. Talk to a Resource
            Developer, or Neighborhood Services Director if this needs to be
            changed after the fact.
          </Typography>
        </Alert>
      )}
      <ProjectTextField
        label="Resource Budget Description"
        multiline
        rows={4}
        key="budget"
        value={formData.budget}
        onChange={(e) => handleInputChange("budget", e.target.value)}
        helperText="This is a description of the budget for the project. This can include the source of the funds, the intended use of the funds, and any other relevant information."
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
        helperText="This is the total budget for the project in dollars. This also includes the property owner's ability to contribute to the project."
      />
      <Divider sx={{ my: 1 }} />

      <ProjectTextField
        label="Property Owner's Ability Contribution"
        multiline
        rows={4}
        key="homeowner ability"
        value={formData.homeowner_ability}
        onChange={(e) => handleInputChange("homeowner_ability", e.target.value)}
        helperText="This is the property owner's ability to contribute to the project. This can be in the form of materials, tools, or other resources."
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
        helperText="This is the property owner's financial ability to contribute to the project in dollars."
      />
    </Box>
  );
};

export default BudgetStep;
