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
import { FormBuilder } from "./stepper-components/FormBuilder";
import { ExampleIcons } from "../events/ClassesTreeView/IconSelect";
import { FieldSelectorDialog } from "./FieldSelectorDialog";
import Loading from "../util/Loading";
import { Close } from "@mui/icons-material";

const getSteps = (onlyForm, type) => {
  const allSteps = [
    {
      label: "Class Description",
      optional: false,
    },
    {
      label: "Review Description",
      optional: false,
    },
    {
      label: `${type === "class" ? "Class" : "Volunteer"} Signup Form`,
      optional: false,
    },
    {
      label: "Review Signup Form",
      optional: false,
    },
  ];

  return onlyForm ? allSteps.slice(2) : allSteps;
};

export default function ClassCreationStepper({
  isNew,
  handleClose,
  CategorySelectOptions,
  onlyForm = false,
  type = "class",
}) {
  const [activeStep, setActiveStep] = useState(0);
  const [isFieldSelectorOpen, setIsFieldSelectorOpen] = useState(false);
  const {
    classConfig,
    formConfig,
    fieldOrder,
    handleSaveClass,
    originalClassObj,
    isLoading,
    handleDeleteClass,
  } = useClassSignup();

  const steps = getSteps(onlyForm, type);

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
    // If onlyForm is true, we need to offset the step number since we're only showing the last two steps
    const adjustedStep = onlyForm ? step + 2 : step;

    switch (adjustedStep) {
      case 0:
        return (
          <ClassDescriptionEditor
            CategorySelectOptions={CategorySelectOptions}
            isEdit={!isNew}
          />
        );

      case 1:
        return (
          <Paper sx={{ p: 3 }}>
            <Typography
              sx={{ display: "flex", alignItems: "center", mb: 2 }}
              variant="h4"
            >
              {classConfig.icon && (
                <Typography sx={{ mr: "1em" }}>
                  {ExampleIcons[classConfig.icon]}
                </Typography>
              )}
              {classConfig.title}
            </Typography>
            <ClassPreview classData={classConfig} />
          </Paper>
        );
      case 2:
        return (
          <FormBuilder
            showFieldSelector={() => setIsFieldSelectorOpen(true)}
            formTitle={
              type === "volunteer signup" ? "Volunteer Signup" : "Class Signup"
            }
          />
        );

      case 3:
        return (
          <Paper sx={{ p: 3 }}>
            <ViewClassSignupForm testSubmit type={type} isCreating />
          </Paper>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Dialog
        open={true}
        onClose={null}
        fullWidth
        PaperProps={{
          sx: {
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignContent: "center",
          },
        }}
        maxWidth="xl"
        disableEscapeKeyDown
      >
        <Typography
          variant="h4"
          sx={{ mb: 3, display: "flex", justifyContent: "center" }}
        >
          Loading Class Data
        </Typography>
        <Box sx={{ mx: "auto" }}>
          <Loading size={80} />
        </Box>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={true}
      onClose={null}
      fullWidth
      maxWidth="xl"
      disableEscapeKeyDown
    >
      <Box sx={{ p: 4 }}>
        <Typography variant="h4" sx={{ mb: 3, textTransform: "capitalize" }}>
          {(isNew ? `Create New ${type}: ` : "Edit: ") +
            classConfig.title +
            " - " +
            steps[activeStep].label}
        </Typography>

        {!isNew && (
          <Box sx={{ position: "absolute", top: 0, right: 0 }}>
            <Button sx={{ m: 3 }} onClick={handleClose}>
              <Close />
            </Button>
          </Box>
        )}

        <Box sx={{ width: "100%" }}>
          <Stepper
            activeStep={activeStep}
            sx={{
              mb: 4,
              width: steps.length === 2 ? "50%" : "90%",
              mx: "auto",
            }}
          >
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel>
                  <Typography sx={{ display: { xs: "none", md: "block" } }}>
                    {step.label}
                  </Typography>
                </StepLabel>
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
            {!isNew && (
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  color="error"
                  variant="outlined"
                  onClick={handleDeleteClass}
                >
                  Delete Class
                </Button>
              </Box>
            )}
            <Stack direction="row" spacing={2}>
              <Button variant="outlined" onClick={handleClose}>
                Cancel
              </Button>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleFinish}
                  sx={{ textTransform: "capitalize" }}
                >
                  {type === "volunteer signup"
                    ? "Save Volunteer Signup"
                    : isNew
                    ? `Create ${type}`
                    : "Save Changes"}
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
      <FieldSelectorDialog
        isOpen={isFieldSelectorOpen}
        handleClose={() => setIsFieldSelectorOpen(false)}
      />
    </Dialog>
  );
}
