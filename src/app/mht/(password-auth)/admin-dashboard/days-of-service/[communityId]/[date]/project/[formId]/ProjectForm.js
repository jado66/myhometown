"use client";
import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
} from "@mui/material";
import StepContent from "./StepContent";
import CollaborationSection from "./CollaborationSection";
import { useProjectForm } from "@/contexts/ProjectFormProvider";
import Loading from "@/components/util/Loading";
import { useRouter } from "next/navigation";
import { VisibilityOff } from "@mui/icons-material";
import { toast } from "react-toastify";

const steps = [
  { label: "Project Information" },
  { label: "Detailed Planning" },
  { label: "Budget Estimates" },
  { label: "Review Project Assignment" },
  { label: "Partner Stake & Ward Participation" },
  { label: "Resource Assessment" },
];

const ProjectForm = ({ formId, date, communityId }) => {
  const router = useRouter();
  const {
    activeStep,
    setActiveStep,
    formData,
    checkAndHideBudget,
    isInitialLoading,
    saveProject,
    finishProject,
    isBudgetHidden,
  } = useProjectForm();

  const goToStep = (step) => {
    if (step === 2 && isBudgetHidden) {
      toast.info(
        <div>
          Budget access is hidden. Click{" "}
          <a
            href={
              process.env.NEXT_PUBLIC_DOMAIN +
              `/admin-dashboard/days-of-service/${communityId}`
            }
            style={{ color: "#1976d2", textDecoration: "underline" }}
            onClick={(e) => e.stopPropagation()}
          >
            here
          </a>{" "}
          and find the Budget Access button to enter your password.
        </div>,
        {
          toastId: "budget-hidden-toast",
          autoClose: 10000, // Longer display time (10 seconds)
          closeOnClick: false, // Prevents closing when clicking the link
        }
      );
      return;
    }
    checkAndHideBudget();
    setActiveStep(step);
  };

  const handleNext = () => {
    const projectFormPage = document.getElementById("project-form-page");
    if (projectFormPage) projectFormPage.scrollIntoView({ behavior: "smooth" });

    // Get the total number of steps based on budget visibility
    const totalSteps = getSteps(isBudgetHidden).length;

    if (activeStep < totalSteps - 1) {
      if (isBudgetHidden && activeStep === 1) {
        // Skip from Step 1 (Detailed Planning) to Step 3 (Review Project Assignment)
        goToStep(activeStep + 2);
      } else if (isBudgetHidden && activeStep === 2) {
        // This case shouldn't occur since we skip step 2, but included for safety
        goToStep(activeStep + 1);
      } else {
        // Normal progression
        goToStep(activeStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      if (isBudgetHidden && activeStep === 3) {
        // Skip from Step 3 (Review Project Assignment) back to Step 1 (Detailed Planning)
        goToStep(activeStep - 2);
      } else if (isBudgetHidden && activeStep === 2) {
        // This case shouldn't occur since we skip step 2, but included for safety
        goToStep(activeStep - 1);
      } else {
        // Normal progression
        goToStep(activeStep - 1);
      }
    }
  };

  const saveAndExit = () => {
    saveProject();
    router.push(
      process.env.NEXT_PUBLIC_DOMAIN +
        `/admin-dashboard/days-of-service/${communityId}`
    );
  };

  const handleFinish = () => {
    finishProject();
    router.push(
      process.env.NEXT_PUBLIC_DOMAIN +
        `/admin-dashboard/days-of-service/${communityId}`
    );
  };

  const getSteps = (isBudgetHidden) => {
    if (isBudgetHidden) {
      return steps;
    } else {
      return steps.filter((step) => step.label !== "Budget Estimates");
    }
  };

  if (isInitialLoading) return <Loading />;

  return (
    <>
      <Card
        sx={{
          margin: "auto",
          p: {
            xs: 0,
            sm: 3,
          },
        }}
      >
        <CardContent>
          <Typography variant="h4" sx={{ mt: 1, mb: 3, textAlign: "center" }}>
            Days of Service Project Form
          </Typography>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            {steps.map((step, index) => (
              <Step
                key={step.label}
                sx={{
                  cursor:
                    isBudgetHidden && step.label === "Budget Estimates"
                      ? "not-allowed"
                      : "pointer",
                }}
                onClick={() => goToStep(index)}
              >
                <StepLabel
                  icon={
                    isBudgetHidden && step.label === "Budget Estimates" ? (
                      <VisibilityOff />
                    ) : undefined
                  }
                  sx={{
                    "& .MuiStepLabel-label": {
                      display: {
                        xs: "none",
                        sm: "block",
                      },
                      color:
                        isBudgetHidden && step.label === "Budget Estimates"
                          ? "grey.500"
                          : "inherit",
                    },
                  }}
                >
                  {step.label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
          <StepContent
            activeStep={activeStep}
            date={date}
            isBudgetHidden={!isBudgetHidden}
          />
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
            <Button
              variant="contained"
              color="inherit"
              onClick={handleBack}
              disabled={activeStep === 0}
            >
              Back
            </Button>
            <Box sx={{ flexGrow: 1 }} />
            {activeStep === steps.length - 1 && (
              <Button
                variant="outlined"
                color="primary"
                onClick={saveAndExit}
                sx={{ mx: 1 }}
              >
                Save and Exit
              </Button>
            )}
            <Button
              variant="contained"
              color="primary"
              onClick={
                activeStep === steps.length - 1 ? handleFinish : handleNext
              }
            >
              {activeStep === steps.length - 1 ? "Finish Project" : "Next"}
            </Button>
          </Box>
        </CardContent>
      </Card>
      <CollaborationSection />
    </>
  );
};

export default ProjectForm;
