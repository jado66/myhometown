import React, { useState } from "react";
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  Box,
  Paper,
  Typography,
  Stack,
  Dialog,
} from "@mui/material";
import ClassPreview from "./stepper-components/ClassPreview";
import { ViewClassSignupForm } from "./stepper-components/ViewClassSignupForm";
import { useClassSignup } from "./ClassSignupContext";
import { ClassDescriptionEditor } from "./stepper-components/ClassDescriptionEditor";

const steps = [
  {
    label: "Class Description",
    optional: false,
  },
  {
    label: "Form Builder",
    optional: false,
  },
  {
    label: "Preview Class",
    optional: false,
  },
  {
    label: "Preview Form",
    optional: false,
  },
];

export default function ClassCreationStepper({ isNew, handleClose }) {
  const [activeStep, setActiveStep] = useState(0);
  const [isFieldSelectorOpen, setIsFieldSelectorOpen] = useState(false);
  const { classConfig, handleSaveClass } = useClassSignup();

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleFinish = async () => {
    try {
      await handleSaveClass();
      handleClose();
    } catch (error) {
      console.error("Error saving class:", error);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return <ClassDescriptionEditor />;

      case 1:
        return (
          <FormBuilder showFieldSelector={() => setIsFieldSelectorOpen(true)} />
        );

      case 2:
        return (
          <Paper sx={{ p: 3 }}>
            <ClassPreview classData={classConfig} />
          </Paper>
        );
      case 3:
        return (
          <Paper sx={{ p: 3 }}>
            <ViewClassSignupForm />
          </Paper>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={true} onClose={handleClose} fullWidth maxWidth="xl">
      <Box sx={{ p: 4 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          {isNew ? "Create New Class" : "Edit Class"}
        </Typography>

        <Box sx={{ width: "100%" }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel>{step.label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box sx={{ mt: 4, mb: 4 }}>{renderStepContent(activeStep)}</Box>

          <Box sx={{ display: "flex", justifyContent: "space-between", pt: 2 }}>
            <Button
              variant="outlined"
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Back
            </Button>
            <Stack direction="row" spacing={2}>
              <Button variant="outlined" onClick={handleClose}>
                Cancel
              </Button>
              {activeStep === steps.length - 1 ? (
                <Button variant="contained" onClick={handleFinish}>
                  {isNew ? "Create Class" : "Save Changes"}
                </Button>
              ) : (
                <Button variant="contained" onClick={handleNext}>
                  Next
                </Button>
              )}
            </Stack>
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
}
