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
  Checkbox,
  FormControlLabel,
  Radio,
  Paper,
  Chip,
  Typography,
  Box,
  Divider,
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import { toast } from "react-toastify";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { useProjectForm } from "@/contexts/ProjectFormProvider";
import Loading from "@/components/util/Loading";
import AddressFormFields from "./form-components/AddressFormFields";
import CommunitySelect from "@/components/data-tables/selects/CommunitySelect";
import TaskTable from "./form-components/TaskTable";

const ProjectForm = () => {
  const [collaboratorEmail, setCollaboratorEmail] = useState("");
  const [collaboratorMessage, setCollaboratorMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

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

  const handleSendCollaborationEmail = async () => {
    if (!collaboratorEmail) return;

    setIsSending(true);
    try {
      const response = await fetch("/api/send-request-form-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: "Collaboration Request: Project Form",
          html: {
            email: collaboratorEmail,
            message: `You have been invited to collaborate on a project form. Click the link below to access the form:\n\nhttps://myhometown.vercel.app/days-of-service/project-development-forms/${formData.id} + \n\n${collaboratorMessage}`,
            firstName: "Collaborator",
            lastName: "Invitation",
          },
        }),
      });

      if (response.ok) {
        toast.success(
          `${collaboratorEmail} has just received an email with a link to this form`
        );
        setCollaboratorEmail("");
      } else {
        throw new Error("Failed to send email");
      }
    } catch (error) {
      console.error("Error sending collaboration email:", error);
      toast.error("Failed to send collaboration email. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <CommunitySelect />
            <TextField
              label="Project Lead"
              fullWidth
              value={formData.projectLead}
              onChange={(e) => handleInputChange("projectLead", e.target.value)}
            />
            <TextField
              fullWidth
              placeholder="Short description of the project"
              value={formData.projectId}
              onChange={(e) => handleInputChange("projectId", e.target.value)}
            />
            <Divider sx={{ my: 2 }} />
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
              label="Email"
              fullWidth
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
            />
            <Divider sx={{ my: 2 }} />
            <AddressFormFields />
            <Divider sx={{ my: 2 }} />
            <TextField
              label="Work Summary"
              fullWidth
              multiline
              rows={4}
              value={formData.workSummary}
              onChange={(e) => handleInputChange("workSummary", e.target.value)}
            />
          </Box>
        );

      case 1:
        return (
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
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              Task Planning
            </Typography>
            <TaskTable
              value={formData.tasks}
              onChange={(newTasks) => handleInputChange("tasks", newTasks)}
              hideResources={true} // New prop to hide resources section
            />
          </Box>
        );

      case 2:
        return (
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

            {/* Resources Section */}
            <Paper sx={{ p: 3, mt: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Tools, Equipment, and Materials
              </Typography>

              {/* Volunteer Tools */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Volunteer Tools
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {formData.volunteerTools?.map((tool, index) => (
                    <Chip
                      key={index}
                      label={tool}
                      onDelete={() => {
                        const newTools = formData.volunteerTools.filter(
                          (_, i) => i !== index
                        );
                        handleInputChange("volunteerTools", newTools);
                      }}
                      size="small"
                    />
                  ))}
                  <TextField
                    size="small"
                    variant="standard"
                    placeholder="Add tool..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.target.value.trim()) {
                        const newTools = [
                          ...(formData.volunteerTools || []),
                          e.target.value.trim(),
                        ];
                        handleInputChange("volunteerTools", newTools);
                        e.target.value = "";
                      }
                    }}
                  />
                </Box>
              </Box>

              {/* Equipment */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Equipment
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {formData.equipment?.map((item, index) => (
                    <Chip
                      key={index}
                      label={item}
                      onDelete={() => {
                        const newEquipment = formData.equipment.filter(
                          (_, i) => i !== index
                        );
                        handleInputChange("equipment", newEquipment);
                      }}
                      size="small"
                    />
                  ))}
                  <TextField
                    size="small"
                    variant="standard"
                    placeholder="Add equipment..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.target.value.trim()) {
                        const newEquipment = [
                          ...(formData.equipment || []),
                          e.target.value.trim(),
                        ];
                        handleInputChange("equipment", newEquipment);
                        e.target.value = "";
                      }
                    }}
                  />
                </Box>
              </Box>

              {/* Materials */}
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Materials
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {formData.materials?.map((item, index) => (
                    <Chip
                      key={index}
                      label={item}
                      onDelete={() => {
                        const newMaterials = formData.materials.filter(
                          (_, i) => i !== index
                        );
                        handleInputChange("materials", newMaterials);
                      }}
                      size="small"
                    />
                  ))}
                  <TextField
                    size="small"
                    variant="standard"
                    placeholder="Add material..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.target.value.trim()) {
                        const newMaterials = [
                          ...(formData.materials || []),
                          e.target.value.trim(),
                        ];
                        handleInputChange("materials", newMaterials);
                        e.target.value = "";
                      }
                    }}
                  />
                </Box>
              </Box>

              <Box sx={{ mt: 3 }}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Project Status</FormLabel>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.materialsProcured}
                        onChange={(e) =>
                          handleInputChange(
                            "materialsProcured",
                            e.target.checked
                          )
                        }
                      />
                    }
                    label="Have the materials been procured?"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.toolsArranged}
                        onChange={(e) =>
                          handleInputChange("toolsArranged", e.target.checked)
                        }
                      />
                    }
                    label="Has arrangement been made for the tools and equipment?"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.called811}
                        onChange={(e) =>
                          handleInputChange("called811", e.target.checked)
                        }
                      />
                    }
                    label="Have we called 811 and gotten Blue Flags if needed?"
                  />
                </FormControl>
              </Box>
            </Paper>
          </Box>
        );

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
          {steps[activeStep]?.label}
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
        <Box sx={{ borderTop: 1, borderColor: "divider", mt: 4, pt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Email Collaborative Link
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              alignItems: "stretch",
            }}
          >
            <TextField
              label="Collaborator's Email"
              fullWidth
              value={collaboratorEmail}
              onChange={(e) => setCollaboratorEmail(e.target.value)}
              sx={{ flexGrow: 1 }}
            />
            <TextField
              label="Message"
              multiline
              rows={4} // Adjust the 'rows' property as needed
              fullWidth
              value={collaboratorMessage}
              onChange={(e) => setCollaboratorMessage(e.target.value)}
              sx={{ flexGrow: 1 }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleSendCollaborationEmail}
              disabled={!collaboratorEmail || isSending}
            >
              {isSending ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Send Link"
              )}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProjectForm;
