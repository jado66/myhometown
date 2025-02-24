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

const steps = [
  { label: "Project Information" },
  { label: "Detailed Planning" },
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
    isInitialLoading,
    saveProject,
    finishProject,
  } = useProjectForm();

  const handleNext = () => {
    const projectFormPage = document.getElementById("project-form-page");
    if (projectFormPage) projectFormPage.scrollIntoView({ behavior: "smooth" });
    if (activeStep < steps.length - 1) setActiveStep(activeStep + 1);
  };

  const handleBack = () => {
    if (activeStep > 0) setActiveStep(activeStep - 1);
  };

  const saveAndExit = () => {
    saveProject();
    router.push(`/admin-dashboard/days-of-service/${communityId}/${date}`);
  };

  const handleFinish = () => {
    finishProject();
    router.push(`/admin-dashboard/days-of-service/${communityId}/${date}`);
  };

  if (isInitialLoading) return <Loading />;

  return (
    <>
      <Card sx={{ margin: "auto", p: 1 }}>
        <CardContent>
          <Typography variant="h4" sx={{ mt: 1, mb: 3, textAlign: "center" }}>
            Days of Service Project Form
          </Typography>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            {steps.map((step, index) => (
              <Step key={index} onClick={() => setActiveStep(index)}>
                <StepLabel>{step.label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <StepContent activeStep={activeStep} date={date} />
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
