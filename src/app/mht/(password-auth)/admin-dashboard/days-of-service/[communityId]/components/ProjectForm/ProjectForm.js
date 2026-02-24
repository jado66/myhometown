"use client";
import React, { useState } from "react";
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
import { toast } from "react-toastify";
import JsonViewer from "@/components/util/debug/DebugOutput";
import AskYesNoDialog from "@/components/util/AskYesNoDialog";
import { ProjectOptionsMenu } from "./ProjectOptionsMenu";
import { DayOfServiceAssignmentDialog } from "./DayOfServiceAssignmentDialog";

const allSteps = [
  { label: "Project Information" },
  { label: "Detailed Planning" },
  { label: "Review Project Assignment" },
  { label: "Resource Assessment" },
  { label: "Reporting" },
];

const ProjectForm = ({ date, communityId }) => {
  const [showFinishDialog, setShowFinishDialog] = React.useState(false);

  const [dayOfServiceDialogOpen, setDayOfServiceDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [isAssigning, setIsAssigning] = useState(false);

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
    isImporting,
    isExporting,
    importProject,
    exportProject,
    assignProjectToServiceDay,
  } = useProjectForm();

  const handleConfirmAssignment = async (selection) => {
    setIsAssigning(true);

    try {
      const result = await assignProjectToServiceDay(selection);

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error in assignment:", error);
      toast.error("Failed to assign project");
    } finally {
      setIsAssigning(false);
    }
  };

  const goToStep = (step) => {
    checkAndHideBudget();
    setActiveStep(step);
  };

  const handleNext = () => {
    const projectFormPage = document.getElementById("project-form-page");
    if (projectFormPage) projectFormPage.scrollIntoView({ behavior: "smooth" });

    const totalSteps = getSteps().length;

    if (activeStep < totalSteps) {
      goToStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      goToStep(activeStep - 1);
    }
  };

  const saveAndExit = () => {
    const route = date
      ? process.env.NEXT_PUBLIC_DOMAIN +
        `/admin-dashboard/days-of-service/${communityId}/${date}/organization/${formData.partner_stake_id}`
      : process.env.NEXT_PUBLIC_DOMAIN +
        `/admin-dashboard/days-of-service/${communityId}`;

    saveProject();
    router.push(route);
  };

  const handleFinish = () => {
    finishProject();
    router.push(route);
  };

  const getSteps = () => {
    return allSteps;
  };

  if (isInitialLoading) return <Loading />;

  const steps = getSteps(isBudgetHidden);

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
        {/* <JsonViewer data={formData} /> */}

        <DayOfServiceAssignmentDialog
          open={dayOfServiceDialogOpen}
          onClose={() => setDayOfServiceDialogOpen(false)}
          onConfirm={handleConfirmAssignment}
          currentValue={selectedAssignment?.fullOption}
          title="Assign Project to Day of Service & Organization"
        />

        <CardContent
          sx={{
            position: "relative",
          }}
        >
          {/* Top right buttons */}
          <Box
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              display: {
                xs: "none",
                sm: "block",
              },
            }}
          >
            <ProjectOptionsMenu
              isExporting={isExporting}
              isImporting={isImporting}
              exportProject={exportProject}
              importProject={importProject}
              openDaysOfServiceSelection={() => setDayOfServiceDialogOpen(true)}
            />
          </Box>

          <Typography variant="h4" sx={{ mt: 1, mb: 3, textAlign: "center" }}>
            Days of Service Project Form
          </Typography>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            {steps.map((step, index) => (
              <Step
                key={step.label}
                sx={{
                  cursor: "pointer",
                }}
                onClick={() => goToStep(index)}
              >
                <StepLabel
                  sx={{
                    "& .MuiStepLabel-label": {
                      display: {
                        xs: "none",
                        sm: "block",
                      },
                    },
                  }}
                >
                  {step.label}
                </StepLabel>
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
                Return to Projects Page
              </Button>
            )}
            <Button
              variant="contained"
              color="primary"
              disabled={
                activeStep === steps.length - 1 &&
                formData.status === "completed"
              }
              onClick={
                activeStep === steps.length - 1
                  ? () => setShowFinishDialog(true)
                  : handleNext
              }
            >
              {activeStep === steps.length - 1
                ? formData.status !== "completed"
                  ? "Mark Project Ready For Day of Service"
                  : "Project Completed"
                : "Next"}
            </Button>
          </Box>
        </CardContent>
      </Card>
      <CollaborationSection />

      <AskYesNoDialog
        // title, description, onConfirm, onCancel, onClose, open
        title="Are you sure?"
        description='Are you sure this project is ready for the Day of Service? You will still be able to edit your project but your project will indicate "Ready for Day of Service".'
        onConfirm={handleFinish}
        onCancel={() => setShowFinishDialog(false)}
        onClose={() => setShowFinishDialog(false)}
        open={showFinishDialog}
      />
    </>
  );
};

export default ProjectForm;
