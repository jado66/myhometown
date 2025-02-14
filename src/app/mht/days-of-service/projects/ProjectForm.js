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
  IconButton,
  Tooltip,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
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
import { ExpandMore, Info } from "@mui/icons-material";
import EmailPreviewDialog from "./EmailPreviewDialog";
import { useLocalStorage } from "@/hooks/use-local-storage";
import JsonViewer from "@/components/util/debug/DebugOutput";
import { ProjectResources } from "./ProjectResources";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import { date } from "yup/lib/locale";

const ProjectForm = () => {
  const [collaboratorEmail, setCollaboratorEmail] = useState("");
  const [collaboratorMessage, setCollaboratorMessage] = useState("");
  const [fromName, setFromName] = useLocalStorage(
    "days-of-service-from-name",
    ""
  );
  const [isSending, setIsSending] = useState(false);

  const [showEmailDialog, setShowEmailDialog] = useState(false);

  // Replace useState with context
  const {
    activeStep,
    setActiveStep,
    formData,
    handleInputChange,
    isInitialLoading,
    addCollaborator,
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
      label: "Review Project Assignment",
      fields: [
        "volunteerTools",
        "equipment",
        "materials",
        "materialsProcured",
        "toolsArranged",
        "called811",
      ],
    },
    {
      label: "Partner Stake & Ward Participation",
    },
    {
      label: "Resource Assessment",
      fields: ["budget", "homeownerAbility"],
    },
  ];

  const handleToolAdd = (e, category) => {
    if (e.key === "Enter" && e.target.value.trim()) {
      e.preventDefault();
      const value = e.target.value.trim();

      // Map the category to the correct form field name
      const categoryMap = {
        tools: "volunteerTools",
        equipment: "equipment",
        homeownerMaterials: "homeownerMaterials",
        otherMaterials: "otherMaterials",
      };

      // Get the correct field name from the map
      const fieldName = categoryMap[category];

      // Get current items (or empty array if none exist)
      const currentItems = formData[fieldName] || [];

      // Create new array with the new item
      const newItems = [...currentItems, value];

      // Update the form data
      handleInputChange(fieldName, newItems);

      // Clear the input
      e.target.value = "";
    }
  };

  // Replace local handlers with context handlers
  const handleNext = () => {
    // scroll to top of page
    window.scrollTo(0, 0);

    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleCommunityChange = (community) => {
    handleInputChange("community", community?.value || null);
  };

  const handleSendCollaborationEmail = async () => {
    if (!collaboratorEmail) return;

    setIsSending(true);
    try {
      const response = await fetch(
        "/api/communications/send-mail/send-dos-invite",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: collaboratorEmail,
            from: fromName,
            message: collaboratorMessage,
          }),
        }
      );

      if (response.ok) {
        toast.success(
          `${collaboratorEmail} has just received an email with a link to this form`
        );

        // add to history
        addCollaborator({
          email: collaboratorEmail,
          from: fromName,
          message: collaboratorMessage,
          date: new Date(),
        });

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
            <Typography variant="h4" sx={{ mt: 2, mb: 1, textAlign: "center" }}>
              This step of the form is typically filled out by the Project
              Developer(s)
            </Typography>
            <Divider sx={{ mt: 2 }} />

            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              Project Information
            </Typography>

            {/* Date for day of service */}
            <FormControl component="fieldset" sx={{ mt: 2 }}>
              <FormLabel component="legend">Date of Service</FormLabel>

              <TextField
                type="date"
                fullWidth
                value={formData.dateOfService}
                onChange={(e) =>
                  handleInputChange("dateOfService", e.target.value)
                }
              />
            </FormControl>

            <CommunitySelect
              value={formData.community}
              onChange={handleCommunityChange}
              isMulti={false}
            />
            <TextField
              label="Project Developer"
              fullWidth
              value={formData.projectDeveloper}
              onChange={(e) =>
                handleInputChange("projectDeveloper", e.target.value)
              }
              helperText="Name of the person or couple who is developing the project. They will be the main point of contact for the project."
            />
            <TextField
              label="Project Developer Phone Number"
              fullWidth
              value={formData.projectDeveloperPhone}
              onChange={(e) =>
                handleInputChange("projectDeveloperPhone", e.target.value)
              }
              helperText="Phone number of the person or couple who is developing the project."
            />
            <TextField
              label="Project Developer Email Address"
              fullWidth
              value={formData.projectDeveloperEmail}
              onChange={(e) =>
                handleInputChange("projectDeveloperEmail", e.target.value)
              }
              helperText="Email address of the person or couple who is developing the project."
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
            <Typography variant="h4" sx={{ mt: 2, mb: 1, textAlign: "center" }}>
              This step of the form is typically filled out by the Resource
              Couple
            </Typography>
            <Divider sx={{ mt: 2 }} />
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              Detailed Planning
            </Typography>
            <TextField
              label="Project Development Couple"
              fullWidth
              value={formData.projectDevelopmentCouple}
              onChange={(e) =>
                handleInputChange("projectDevelopmentCouple", e.target.value)
              }
            />

            <TextField
              label="Project Development Couple Phone Number (1)"
              fullWidth
              value={formData.projectDevelopmentCouplePhone1}
              onChange={(e) =>
                handleInputChange(
                  "projectDevelopmentCouplePhone1",
                  e.target.value
                )
              }
            />

            <TextField
              label="Project Development Couple Email (1)"
              fullWidth
              value={formData.projectDevelopmentCoupleEmail1}
              onChange={(e) =>
                handleInputChange(
                  "projectDevelopmentCoupleEmail1",
                  e.target.value
                )
              }
            />

            <TextField
              label="Project Development Couple Phone Number (2)"
              fullWidth
              value={formData.projectDevelopmentCouplePhone2}
              onChange={(e) =>
                handleInputChange(
                  "projectDevelopmentCouplePhone2",
                  e.target.value
                )
              }
            />

            <TextField
              label="Project Development Couple Email (2)"
              fullWidth
              value={formData.projectDevelopmentCoupleEmail2}
              onChange={(e) =>
                handleInputChange(
                  "projectDevelopmentCoupleEmail2",
                  e.target.value
                )
              }
            />

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

            <Typography variant="h4" component="h1" gutterBottom>
              Project Setup
            </Typography>
            <ProjectResources
              formData={formData}
              handleInputChange={handleInputChange}
              handleToolAdd={handleToolAdd}
            />

            <Divider sx={{ my: 1 }} />

            {/* Textfield number for manpower # of people needed */}
            <Box sx={{ mt: 3 }}>
              <TextField
                label="Number of Volunteers Needed"
                type="number"
                min={0}
                fullWidth
                value={formData.volunteersNeeded}
                onChange={(e) =>
                  handleInputChange("volunteersNeeded", e.target.value)
                }
                helperText="Enter the number of total volunteers needed for the entire project."
              />
            </Box>

            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              Budget Estimates
            </Typography>

            <TextField
              label="Resource Budget Description"
              fullWidth
              multiline
              rows={4}
              value={formData.budget}
              onChange={(e) => handleInputChange("budget", e.target.value)}
              helperText="Describe the budget for the project. Include any costs that will be incurred by the project developer or the homeowner."
            />
            <TextField
              label="Resource Budget Estimates"
              fullWidth
              value={formData.budgetEstimates}
              onChange={(e) =>
                handleInputChange("budgetEstimates", e.target.value)
              }
              helperText="Total estimate the cost of the project."
            />
            <Divider sx={{ my: 1 }} />

            <TextField
              label="Homeowner's Ability Description"
              fullWidth
              multiline
              rows={4}
              value={formData.homeownerAbility}
              onChange={(e) =>
                handleInputChange("homeownerAbility", e.target.value)
              }
              helperText="Describe the homeowner's ability to contribute to the project. Include monetary resources."
            />
            <TextField
              label="Homeowner's Ability Estimates"
              fullWidth
              value={formData.homeownerAbilityEstimates}
              onChange={(e) =>
                handleInputChange("homeownerAbilityEstimates", e.target.value)
              }
              helperText="Total estimate the homeowner's ability to contribute to the project."
            />
          </Box>
        );

      case 2:
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Paper sx={{ p: 3 }}>
              {/* Project Details Review */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" color="primary">
                  Basic Information
                </Typography>
                <Box sx={{ pl: 2 }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography>
                      <strong>Project Developer:</strong>{" "}
                      {formData.projectDeveloper}
                    </Typography>
                    <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                      <Tooltip title={formData.projectDeveloperPhone} arrow>
                        <IconButton
                          color="primary"
                          aria-label="phone number"
                          size="small"
                          sx={{ border: 1, borderColor: "primary.main" }}
                          onClick={() => {
                            // copy to navigator clipboard
                            navigator.clipboard.writeText(
                              formData.projectDeveloperPhone
                            );
                            toast.success("Phone number copied to clipboard");
                          }}
                        >
                          <PhoneIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title={formData.projectDeveloperEmail} arrow>
                        <IconButton
                          color="primary"
                          aria-label="email address"
                          size="small"
                          sx={{ border: 1, borderColor: "primary.main" }}
                          onClick={() => {
                            // copy to navigator clipboard
                            navigator.clipboard.writeText(
                              formData.projectDeveloperEmail
                            );
                            toast.success("Email copied to clipboard");
                          }}
                        >
                          <EmailIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Box>

                  <Typography>
                    <strong>Project Development Couple:</strong>{" "}
                    {formData.projectDevelopmentCouple}
                  </Typography>

                  <Typography>
                    <strong>Property Owner:</strong> {formData.propertyOwner}
                  </Typography>
                </Box>
              </Box>

              {/* Address Review */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" color="primary">
                  Project Location
                </Typography>
                <Box sx={{ pl: 2 }}>
                  <Typography>
                    {formData.addressStreet1}
                    {formData.addressStreet2 && `, ${formData.addressStreet2}`}
                  </Typography>
                  <Typography>
                    {formData.addressCity}, {formData.addressState}{" "}
                    {formData.addressZipCode}
                  </Typography>
                </Box>
              </Box>

              {/* Work Summary Review */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" color="primary">
                  Work Summary
                </Typography>
                <Box sx={{ pl: 2 }}>
                  <Typography>{formData.workSummary}</Typography>
                </Box>
              </Box>

              {/* Preferred Remedies Review */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" color="primary">
                  Preferred Remedies
                </Typography>
                <Box sx={{ pl: 2 }}>
                  <Typography>{formData.preferredRemedies}</Typography>
                </Box>
              </Box>

              {/* Tasks Review */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" color="primary">
                  Planned Tasks
                </Typography>
                <Box sx={{ pl: 2 }}>
                  {
                    // check if is array
                    formData.tasks &&
                      formData.tasks.tasks &&
                      Array.isArray(formData.tasks.tasks) &&
                      formData.tasks.tasks?.map((task, index) => (
                        <Box key={index} sx={{ mb: 1 }}>
                          <Typography>
                            <strong>Task {index + 1}:</strong>{" "}
                            {task.description}
                          </Typography>
                          {task.todos &&
                            task.todos.map((todo, i) => (
                              <Box key={i} sx={{ pl: 2 }}>
                                <Typography>
                                  <strong>- </strong> {todo}
                                </Typography>
                              </Box>
                            ))}
                        </Box>
                      ))
                  }
                </Box>
              </Box>
            </Paper>

            {/* Textfield for project development couple */}

            {/* Review Confirmation */}
            <FormControl component="fieldset" sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.reviewCompletedWithCouple}
                    onChange={(e) =>
                      handleInputChange(
                        "reviewCompletedWithCouple",
                        e.target.checked
                      )
                    }
                  />
                }
                label="I have reviewed the project information with the project development couple"
              />
            </FormControl>
            <FormControl component="fieldset">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.reviewCompletedWithHomeowner}
                    onChange={(e) =>
                      handleInputChange(
                        "reviewCompletedWithHomeowner",
                        e.target.checked
                      )
                    }
                  />
                }
                label="I have reviewed the project information with the homeowner"
              />
            </FormControl>

            {/* Issues or Concerns Section */}
            <TextField
              label="Issues or Concerns (Optional)"
              multiline
              rows={4}
              fullWidth
              value={formData.reviewNotes || ""}
              onChange={(e) => handleInputChange("reviewNotes", e.target.value)}
              placeholder="Note any issues or concerns that need to be addressed"
            />
          </Box>
        );

      case 3:
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {/* Input Stake */}
                <TextField
                  label="Partner Stake"
                  fullWidth
                  value={formData.partnerStake}
                  onChange={(e) =>
                    handleInputChange("partnerStake", e.target.value)
                  }
                />

                <TextField
                  label="Partner Stake Liaison"
                  fullWidth
                  value={formData.partnerStakeLiaison}
                  onChange={(e) =>
                    handleInputChange("partnerStakeLiaison", e.target.value)
                  }
                />

                {/* Gather phone and email from partner stake liaison */}
                <Box sx={{ display: "flex", gap: 2 }}>
                  <TextField
                    label="Partner Stake Liaison Phone"
                    fullWidth
                    value={formData.partnerStakeLiaisonPhone}
                    onChange={(e) =>
                      handleInputChange(
                        "partnerStakeLiaisonPhone",
                        e.target.value
                      )
                    }
                  />

                  <TextField
                    label="Partner Stake Liaison Email"
                    fullWidth
                    value={formData.partnerStakeLiaisonEmail}
                    onChange={(e) =>
                      handleInputChange(
                        "partnerStakeLiaisonEmail",
                        e.target.value
                      )
                    }
                  />
                </Box>

                <Divider sx={{ my: 2 }} />

                <TextField
                  // parnter ward
                  label="Partner Ward"
                  fullWidth
                  value={formData.partnerWard}
                  onChange={(e) =>
                    handleInputChange("partnerWard", e.target.value)
                  }
                />

                <TextField
                  label="Partner Ward Liaison(s)"
                  fullWidth
                  value={formData.partnerWardLiaison}
                  onChange={(e) =>
                    handleInputChange("partnerWardLiaison", e.target.value)
                  }
                />

                {/* Gather phone and email from partner ward liaison */}
                <Box sx={{ display: "flex", gap: 2 }}>
                  <TextField
                    label="Partner Ward Liaison Phone"
                    fullWidth
                    value={formData.partnerWardLiaisonPhone}
                    onChange={(e) =>
                      handleInputChange(
                        "partnerWardLiaisonPhone1",
                        e.target.value
                      )
                    }
                  />

                  <TextField
                    label="Partner Ward Liaison Email"
                    fullWidth
                    value={formData.partnerWardLiaisonEmail}
                    onChange={(e) =>
                      handleInputChange(
                        "partnerWardLiaisonEmail1",
                        e.target.value
                      )
                    }
                  />
                </Box>

                <Box sx={{ display: "flex", gap: 2 }}>
                  <TextField
                    label="Partner Ward Liaison Phone 2 (Optional)"
                    fullWidth
                    value={formData.partnerWardLiaisonPhone2}
                    onChange={(e) =>
                      handleInputChange(
                        "partnerWardLiaisonPhone2",
                        e.target.value
                      )
                    }
                  />

                  <TextField
                    label="Partner Ward Liaison Email 2 (Optional)"
                    fullWidth
                    value={formData.partnerWardLiaisonEmail2}
                    onChange={(e) =>
                      handleInputChange(
                        "partnerWardLiaisonEmail2",
                        e.target.value
                      )
                    }
                  />
                </Box>
              </Box>
              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <FormControlLabel
                  fullWidth
                  control={
                    <Checkbox
                      checked={formData.partnerStakeContacted}
                      onChange={(e) =>
                        handleInputChange(
                          "partnerStakeContacted",
                          e.target.checked
                        )
                      }
                    />
                  }
                  label="Has the Partner Stake been contacted?"
                />

                <FormControlLabel
                  fullWidth
                  control={
                    <Checkbox
                      checked={formData.partnerWardContacted}
                      onChange={(e) =>
                        handleInputChange(
                          "partnerWardContacted",
                          e.target.checked
                        )
                      }
                    />
                  }
                  label="Has the Partner Ward been contacted?"
                />

                {/* Was the site visit done with resource couple? */}

                <Divider sx={{ my: 2 }} />

                <FormControlLabel
                  fullWidth
                  control={
                    <Checkbox
                      checked={formData.siteVisitDoneWithResourceCouple}
                      onChange={(e) =>
                        handleInputChange(
                          "siteVisitDoneWithResourceCouple",
                          e.target.checked
                        )
                      }
                    />
                  }
                  label="Was the site visit done with the Resource Couple?"
                />

                {/* Was the site visit done with Host?
                 Was the site visit done with Partner ward leader? */}
                <FormControlLabel
                  fullWidth
                  control={
                    <Checkbox
                      checked={formData.siteVisitDoneWithHost}
                      onChange={(e) =>
                        handleInputChange(
                          "siteVisitDoneWithHost",
                          e.target.checked
                        )
                      }
                    />
                  }
                  label="Was the site visit done with the Host?"
                />

                <FormControlLabel
                  fullWidth
                  control={
                    <Checkbox
                      checked={formData.siteVisitDoneWithPartner}
                      onChange={(e) =>
                        handleInputChange(
                          "siteVisitDoneWithPartner",
                          e.target.checked
                        )
                      }
                    />
                  }
                  label="Was the site visit done with the Partner Ward Leader?"
                />
              </Box>
              {/* Partner stake and partner ward have been contacted  */}
            </Paper>
          </Box>
        );

      case 4:
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Resources Section */}
            <Paper sx={{ p: 3, mt: 2 }}>
              <Box sx={{ mt: 3 }}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Procurement Status</FormLabel>
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
                    label="Have the materials been procured (i.e. materials, dumpster)?"
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
                    label="Have arrangements been made for the tools and equipment?"
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.materialsOnSite}
                        onChange={(e) =>
                          handleInputChange("materialsOnSite", e.target.checked)
                        }
                      />
                    }
                    label="Are materials on site?"
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
                    label="Have we called 811 and ordered Blue Flags if needed?"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.dumpsterRequested}
                        onChange={(e) =>
                          handleInputChange(
                            "dumpsterRequested",
                            e.target.checked
                          )
                        }
                      />
                    }
                    label="Has a dumpster been requested from the city?"
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
    <>
      <Card sx={{ margin: "auto" }}>
        <CardContent>
          <Typography variant="h4" sx={{ mt: 1, mb: 3, textAlign: "center" }}>
            Days of Service Project Form
          </Typography>

          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            {steps.map((step, index) => (
              <Step key={index}>
                <StepLabel>{step.label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* <Typography variant="h6" gutterBottom>
            {steps[activeStep]?.label}
          </Typography> */}

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
      <Box sx={{ borderTop: 1, borderColor: "divider", mt: 4, pt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Email Invitation to Collaborate
        </Typography>

        <EmailPreviewDialog
          open={showEmailDialog}
          onClose={() => setShowEmailDialog(false)}
          email={collaboratorEmail}
          message={collaboratorMessage}
          fromName={fromName}
        />

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            alignItems: "stretch",
          }}
        >
          <TextField
            label="Your Name"
            fullWidth
            value={fromName}
            onChange={(e) => setFromName(e.target.value)}
          />

          <TextField
            label="Collaborator's Email"
            helperText="Enter the email of the person, or persons, you want to collaborate with (separate multiple emails with a comma)"
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
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Button
              color="primary"
              variant="outlined"
              fullWidth
              onClick={(e) => {
                e.preventDefault();
                setShowEmailDialog(true);
              }}
            >
              View Preview of Email
            </Button>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleSendCollaborationEmail}
              disabled={
                !collaboratorEmail ||
                isSending ||
                !fromName ||
                !collaboratorMessage
              }
            >
              {isSending ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Send Link"
              )}
            </Button>
          </Box>
        </Box>

        {formData.collaborators && (
          <Box sx={{ mt: 4 }}>
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMore />}
                aria-controls="collaboration-history-content"
                id="collaboration-history-header"
              >
                <Typography variant="h6">Collaboration History</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {formData.collaborators.map((collaborator, index) => (
                    <Paper key={index} sx={{ p: 2 }}>
                      <Typography variant="subtitle1">
                        {collaborator.email} -{" "}
                        {new Date(collaborator.date).toLocaleDateString()}
                      </Typography>
                      <Typography>{collaborator.message}</Typography>
                    </Paper>
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>
          </Box>
        )}
      </Box>
    </>
  );
};

export default ProjectForm;
