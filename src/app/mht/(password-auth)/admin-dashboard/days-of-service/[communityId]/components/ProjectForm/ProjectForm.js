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
  const [completionError, setCompletionError] = useState(null);

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
    handleInputChange,
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
    setCompletionError(null);

    const projectFormPage = document.getElementById("project-form-page");
    if (projectFormPage) projectFormPage.scrollIntoView({ behavior: "smooth" });

    const totalSteps = getSteps().length;

    if (activeStep < totalSteps) {
      goToStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    setCompletionError(null);

    if (activeStep > 0) {
      goToStep(activeStep - 1);
    }
  };

  const getExitRoute = () =>
    date
      ? process.env.NEXT_PUBLIC_DOMAIN +
        `/admin-dashboard/days-of-service/${communityId}/${date}/organization/${formData.partner_stake_id}`
      : process.env.NEXT_PUBLIC_DOMAIN +
        `/admin-dashboard/days-of-service/${communityId}`;

  const saveAndExit = () => {
    saveProject();
    router.push(getExitRoute());
  };

  const handleMarkReady = () => {
    toast.success("Project has been marked as ready for Day of Service!");

    handleInputChange("status", "ready");
    handleNext();
  };

  const handleUnmarkReady = () => {
    toast.success("Project has been marked as not ready.");
    handleInputChange("status", null);
  };

  const handleUnmarkCompleted = () => {
    handleInputChange("status", "ready");
  };

  const handleCompleteClick = () => {
    const errors = [];

    if (formData.status !== "ready") {
      errors.push(
        "Project must be marked as ready on Step 4 (Resource Assessment) first.",
      );
      toast.error(
        "Project must be marked as ready on Step 4 (Resource Assessment) first.",
      );
    }
    if (!formData.actual_volunteers) {
      errors.push(
        "Please fill out the Number of Volunteers and the Actual Duration of Project (hours).",
      );
      toast.error(
        "Please fill out the Number of Volunteers and the Actual Duration of Project (hours).",
        {
          toastId: "cantComplete",
        },
      );
    }
    if (!formData.actual_project_duration) {
      errors.push(
        "Please fill out the Number of Volunteers and the Actual Duration of Project (hours).",
      );
      toast.error(
        "Please fill out the Number of Volunteers and the Actual Duration of Project (hours).",
        {
          toastId: "cantComplete",
        },
      );
    }
    if (errors.length > 0) {
      setCompletionError(errors[0]);
      return;
    }

    setCompletionError(null);
    setShowFinishDialog(true);
  };

  const handleFinish = () => {
    finishProject();
    router.push(getExitRoute());
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

            {activeStep === steps.length - 2 && (
              <Box sx={{ display: "flex", gap: 1 }}>
                {(formData.status === "ready" ||
                  formData.status === "completed") && (
                  <Button
                    variant="outlined"
                    color="warning"
                    disabled={formData.status === "completed"}
                    onClick={handleUnmarkReady}
                  >
                    Mark Not Ready
                  </Button>
                )}
                <Button
                  variant="contained"
                  color="primary"
                  disabled={
                    formData.status === "ready" ||
                    formData.status === "completed"
                  }
                  onClick={handleMarkReady}
                >
                  {formData.status === "ready" ||
                  formData.status === "completed"
                    ? "Project Marked Ready ✓"
                    : "Mark Project Ready For Day of Service"}
                </Button>
              </Box>
            )}
            {activeStep === steps.length - 1 ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: 1,
                }}
              >
                <Box sx={{ display: "flex", gap: 1 }}>
                  {formData.status === "completed" && (
                    <Button
                      variant="outlined"
                      color="warning"
                      onClick={handleUnmarkCompleted}
                    >
                      Mark Not Completed
                    </Button>
                  )}
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={formData.status === "completed"}
                    onClick={handleCompleteClick}
                  >
                    {formData.status === "completed"
                      ? "Project Completed ✓"
                      : "Complete Project"}
                  </Button>
                </Box>
              </Box>
            ) : (
              <Button
                variant="outlined"
                sx={{ mx: 1 }}
                color="primary"
                onClick={handleNext}
              >
                Next
              </Button>
            )}
          </Box>
          {completionError && (
            <Typography
              variant="body2"
              color="error"
              sx={{ mt: 0.5, textAlign: "right" }}
            >
              {completionError}
            </Typography>
          )}
        </CardContent>
      </Card>
      <CollaborationSection />

      <AskYesNoDialog
        // title, description, onConfirm, onCancel, onClose, open
        title="Are you sure?"
        description="Are you sure you want to mark this project as completed? This will finalize the project report."
        onConfirm={handleFinish}
        onCancel={() => setShowFinishDialog(false)}
        onClose={() => setShowFinishDialog(false)}
        open={showFinishDialog}
      />
    </>
  );
};

export default ProjectForm;
