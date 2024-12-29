"use client";
import React, { useEffect, useState } from "react"; // Remove useState since we'll use context
import {
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  Box,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { useProjectForm } from "@/contexts/ProjectFormProvider";
import Loading from "@/components/util/Loading";
import AddressFormFields from "./form-components/AddressFormFields";

const ProjectForm = () => {
  const [hasLoaded, setHasLoaded] = useState(null);
  // Replace useState with context
  const {
    activeStep,
    setActiveStep,
    formData,
    handleInputChange,
    isInitialLoading,
  } = useProjectForm();

  const steps = [
    {
      label: "Project Information",
      fields: [
        "addressStreet1",
        "addressStreet2",
        "addressCity",
        "addressState",
        "addressZipCode",
        "propertyOwner",
        "phoneNumber",
        "area",
        "violations",
        "remedies",
      ],
    },
    {
      label: "Initial Resolution",
      fields: ["isResolved"],
    },
    {
      label: "Assistance Evaluation",
      fields: ["canHelp"],
    },
    {
      label: "Detailed Planning",
      fields: ["preferredRemedies", "specificTasks"],
    },
    {
      label: "Resource Assessment",
      fields: ["budget", "homeownerAbility"],
    },
  ];

  // Replace local handlers with context handlers
  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <AddressFormFields />
            <TextField
              label="Property Owner"
              fullWidth
              value={formData.propertyOwner}
              onChange={(e) =>
                handleInputChange("propertyOwner", e.target.value)
              }
            />
            <TextField
              label="Phone Number"
              fullWidth
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
            />
            <TextField
              label="Area"
              fullWidth
              value={formData.area}
              onChange={(e) => handleInputChange("area", e.target.value)}
            />
            <TextField
              label="Code Violations"
              fullWidth
              multiline
              rows={4}
              value={formData.violations}
              onChange={(e) => handleInputChange("violations", e.target.value)}
            />
            <TextField
              label="Suggested Remedies"
              fullWidth
              multiline
              rows={4}
              value={formData.remedies}
              onChange={(e) => handleInputChange("remedies", e.target.value)}
            />
          </Box>
        );

      case 1:
        return (
          <FormControl component="fieldset">
            <FormLabel component="legend">Is the issue resolved?</FormLabel>
            <RadioGroup
              value={formData.isResolved}
              onChange={(e) =>
                handleInputChange("isResolved", e.target.value === "true")
              }
            >
              <FormControlLabel
                value={true}
                control={<Radio />}
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CheckCircleIcon color="success" />
                    <span>Yes</span>
                  </Box>
                }
              />
              <FormControlLabel
                value={false}
                control={<Radio />}
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CancelIcon color="error" />
                    <span>No</span>
                  </Box>
                }
              />
            </RadioGroup>
          </FormControl>
        );

      case 2:
        return !formData.isResolved ? (
          <FormControl component="fieldset">
            <FormLabel component="legend">Can we help?</FormLabel>
            <RadioGroup
              value={formData.canHelp}
              onChange={(e) =>
                handleInputChange("canHelp", e.target.value === "true")
              }
            >
              <FormControlLabel
                value={true}
                control={<Radio />}
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CheckCircleIcon color="success" />
                    <span>Yes</span>
                  </Box>
                }
              />
              <FormControlLabel
                value={false}
                control={<Radio />}
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CancelIcon color="error" />
                    <span>No</span>
                  </Box>
                }
              />
            </RadioGroup>
          </FormControl>
        ) : null;

      case 3:
        return formData.canHelp ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Preferred Remedies"
              fullWidth
              multiline
              rows={4}
              value={formData.preferredRemedies}
              onChange={(e) =>
                handleInputChange("preferredRemedies", e.target.value)
              }
            />
            <TextField
              label="Specific Tasks"
              fullWidth
              multiline
              rows={4}
              value={formData.specificTasks}
              onChange={(e) =>
                handleInputChange("specificTasks", e.target.value)
              }
            />
          </Box>
        ) : null;

      case 4:
        return formData.canHelp ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Resource Budget Estimates"
              fullWidth
              multiline
              rows={4}
              value={formData.budget}
              onChange={(e) => handleInputChange("budget", e.target.value)}
            />
            <TextField
              label="Homeowner's Ability Assessment"
              fullWidth
              multiline
              rows={4}
              value={formData.homeownerAbility}
              onChange={(e) =>
                handleInputChange("homeownerAbility", e.target.value)
              }
            />
          </Box>
        ) : null;

      default:
        return null;
    }
  };

  if (isInitialLoading) {
    return <Loading />;
  }

  return (
    <Card sx={{ maxWidth: 800, margin: "auto" }}>
      <CardContent>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((step, index) => (
            <Step key={index}>
              <StepLabel>{step.label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Typography variant="h6" gutterBottom>
          {steps[activeStep].label}
        </Typography>

        {renderStepContent()}

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
          <Button
            variant="contained"
            color="inherit"
            onClick={handleBack}
            disabled={activeStep === 0}
          >
            Back
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleNext}
            disabled={activeStep === steps.length - 1}
          >
            Next
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProjectForm;
