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
  InputAdornment,
  Alert,
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import { toast } from "react-toastify";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { useProjectForm } from "@/contexts/ProjectFormProvider";
import Loading from "@/components/util/Loading";
import AddressFormFields from "@/components/days-of-service/form-components/AddressFormFields";
import CommunitySelect from "@/components/data-tables/selects/CommunitySelect";
import TaskTable from "@/components/days-of-service/form-components/TaskTable";
import { ExpandMore, Info } from "@mui/icons-material";
import EmailPreviewDialog from "@/components/days-of-service/EmailPreviewDialog";
import { useLocalStorage } from "@/hooks/use-local-storage";
import JsonViewer from "@/components/util/debug/DebugOutput";
import { ProjectResources } from "./ProjectResources";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import { useRouter } from "next/navigation";

const ProjectForm = ({ formId, date, communityId }) => {
  const router = useRouter();

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
    finishProject,
    community,
    saveProject,
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

  const saveAndExit = () => {
    // Save the form data
    saveProject();
    // Redirect to the dashboard

    router.push(
      process.env.NEXT_PUBLIC_DOMAIN +
        `/admin-dashboard/days-of-service/${communityId}/${date}`
    );
  };

  const handleFinish = () => {
    finishProject();
    router.push(
      process.env.NEXT_PUBLIC_DOMAIN +
        `/admin-dashboard/days-of-service/${communityId}/${date}`
    );
  };

  // Replace local handlers with context handlers
  const handleNext = () => {
    // scroll to top of page
    //  scroll to id="project-form-page"
    const projectFormPage = document.getElementById("project-form-page");
    if (projectFormPage) {
      projectFormPage.scrollIntoView({ behavior: "smooth" });
    }
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

            <JsonViewer data={formData} />

            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              Project Information
            </Typography>

            {/* Date for day of service */}

            <ProjectTextField
              fullWidth
              label="Project Name"
              value={formData.project_name}
              key="project_name"
              onChange={(e) =>
                handleInputChange("project_name", e.target.value)
              }
              helperText="Name of the project. This will be used to identify the project in the system."
            />

            <ProjectTextField
              type="date"
              fullWidth
              label="Day Of Service Date"
              value={date ? new Date(date).toISOString().split("T")[0] : null}
              InputProps={{
                readOnly: true,
              }}
            />

            <ProjectTextField
              label="Community"
              fullWidth
              value={`${community?.city_name || ""} - ${community?.name || ""}`}
              InputProps={{
                readOnly: true,
              }}
              sx={{
                color: "text.muted",
              }}
            />

            <Divider sx={{ my: 1 }} />

            <ProjectTextField
              label="Project Developer(s)"
              fullWidth
              value={formData.project_developer}
              onChange={(e) =>
                handleInputChange("project_developer", e.target.value)
              }
              helperText="Name of the person(s) is developing the project. They will be the main point of contact for the project."
            />
            <ProjectTextField
              label="Project Developer Phone Number 1"
              fullWidth
              value={formData.project_developer_phone1}
              onChange={(e) =>
                handleInputChange("project_developer_phone1", e.target.value)
              }
              helperText="Phone number of the first person who is developing the project."
            />
            <ProjectTextField
              label="Project Developer Email Address 1 "
              fullWidth
              key="project_developer_email1"
              value={formData.project_developer_email1}
              onChange={(e) =>
                handleInputChange("project_developer_email1", e.target.value)
              }
              helperText="Email address of the first person who is developing the project."
            />
            <ProjectTextField
              label="Project Developer Phone Number 2"
              fullWidth
              value={formData.project_developer_phone2}
              onChange={(e) =>
                handleInputChange("project_developer_phone2", e.target.value)
              }
              helperText="Phone number of the second person who is developing the project (optional)."
            />
            <ProjectTextField
              key="project_developer_email2"
              label="Project Developer Email Address 2"
              fullWidth
              value={formData.project_developer_email2}
              onChange={(e) =>
                handleInputChange("project_developer_email2", e.target.value)
              }
              helperText="Email address of the second person or couple who is developing the project (optional)."
            />
            <ProjectTextField
              fullWidth
              placeholder="Short description of the project"
              value={formData.project_id}
              onChange={(e) => handleInputChange("project_id", e.target.value)}
            />
            <Divider sx={{ my: 2 }} />
            <ProjectTextField
              label="Property Owner"
              fullWidth
              value={formData.property_owner}
              onChange={(e) =>
                handleInputChange("property_owner", e.target.value)
              }
            />
            <ProjectTextField
              label="Phone Number"
              fullWidth
              value={formData.phone_number}
              onChange={(e) =>
                handleInputChange("phone_number", e.target.value)
              }
            />
            <ProjectTextField
              label="Email"
              fullWidth
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
            />
            <Divider sx={{ my: 2 }} />
            <AddressFormFields />
            <Divider sx={{ my: 2 }} />
            <ProjectTextField
              label="Work Summary"
              fullWidth
              multiline
              rows={4}
              value={formData.work_summary}
              onChange={(e) =>
                handleInputChange("work_summary", e.target.value)
              }
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
            <ProjectTextField
              label="Resource Couple"
              fullWidth
              value={formData.project_development_couple}
              key="project_development_couple"
              onChange={(e) =>
                handleInputChange("project_development_couple", e.target.value)
              }
            />

            <ProjectTextField
              label="Resource Couple Phone Number (1)"
              key="project_development_couple_phone1"
              fullWidth
              value={formData.project_development_couple_phone1}
              onChange={(e) =>
                handleInputChange(
                  "project_development_couple_phone1",
                  e.target.value
                )
              }
            />

            <ProjectTextField
              label="Resource Couple Email (1)"
              key="project_development_couple_email1"
              fullWidth
              value={formData.project_development_couple_email1}
              onChange={(e) =>
                handleInputChange(
                  "project_development_couple_email1",
                  e.target.value
                )
              }
            />

            <ProjectTextField
              label="Resource Couple Phone Number (2)"
              fullWidth
              key="project_development_couple_phone2"
              value={formData.project_development_couple_phone2}
              onChange={(e) =>
                handleInputChange(
                  "project_development_couple_phone2",
                  e.target.value
                )
              }
            />

            <ProjectTextField
              label="Resource Couple Email (2)"
              fullWidth
              key={"project_development_couple_email2"}
              value={formData.project_development_couple_email2}
              onChange={(e) =>
                handleInputChange(
                  "project_development_couple_email2",
                  e.target.value
                )
              }
            />

            <ProjectTextField
              label="Preferred Remedies"
              fullWidth
              multiline
              rows={4}
              value={formData.preferred_remedies}
              onChange={(e) =>
                handleInputChange("preferred_remedies", e.target.value)
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

            {/* ProjectTextField number for manpower # of people needed */}
            <Box sx={{ mt: 3 }}>
              <ProjectTextField
                label="Number of Volunteers Needed"
                type="number"
                min={0}
                fullWidth
                value={formData.volunteers_needed}
                onChange={(e) =>
                  handleInputChange("volunteers_needed", e.target.value)
                }
                helperText="Enter the number of total volunteers needed for the entire project."
              />
            </Box>

            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              Budget Estimates
            </Typography>

            <Alert severity="info" sx={{ mb: 2 }}>
              {/* This will dissapear after navigating */}
              <Typography>
                Once you enter this budget information and navigate away from
                this step you will not be able to see this again. Talk to a
                Resource Developer, or Neighborhood Services Director if this
                needs to be changed after the fact.
              </Typography>
            </Alert>

            <ProjectTextField
              label="Resource Budget Description "
              fullWidth
              multiline
              rows={4}
              value={formData.budget}
              onChange={(e) => handleInputChange("budget", e.target.value)}
              helperText="Describe the budget for the project. Include any costs that will be incurred by the project developer or the homeowner."
            />
            <ProjectTextField
              label="Resource Budget Estimates"
              fullWidth
              value={formData.budget_estimates}
              onChange={(e) =>
                handleInputChange("budget_estimates", e.target.value)
              }
              type="number"
              helperText="Total estimate the cost of the project."
              hasInputAdornment
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
              }}
            />
            <Divider sx={{ my: 1 }} />

            <ProjectTextField
              label="Homeowner's Ability Description"
              fullWidth
              multiline
              rows={4}
              value={formData.homeowner_ability}
              onChange={(e) =>
                handleInputChange("homeowner_ability", e.target.value)
              }
              helperText="Describe the homeowner's ability to contribute to the project. Include monetary resources."
            />
            <ProjectTextField
              label="Homeowner's Ability Estimates"
              fullWidth
              value={formData.homeowner_ability_estimates}
              onChange={(e) =>
                handleInputChange("homeowner_ability_estimates", e.target.value)
              }
              hasInputAdornment
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
              }}
              type="number"
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
                      {formData.project_developer}
                    </Typography>
                    <Stack direction="row" spacing={2}>
                      <Tooltip title={formData.project_developer_phone} arrow>
                        <IconButton
                          color="primary"
                          aria-label="phone number"
                          size="small"
                          onClick={() => {
                            // copy to navigator clipboard
                            navigator.clipboard.writeText(
                              formData.project_developer_phone
                            );
                            toast.success("Phone number copied to clipboard");
                          }}
                        >
                          <PhoneIcon size="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title={formData.project_developer_email} arrow>
                        <IconButton
                          color="primary"
                          aria-label="email address"
                          size="small"
                          onClick={() => {
                            // copy to navigator clipboard
                            navigator.clipboard.writeText(
                              formData.project_developer_email
                            );
                            toast.success("Email copied to clipboard");
                          }}
                        >
                          <EmailIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Box>

                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography>
                      <strong>Resource Couple:</strong>{" "}
                      {formData.project_development_couple}
                    </Typography>
                    <Stack direction="row" spacing={2}>
                      <Tooltip
                        title={formData.project_development_couple_phone}
                        arrow
                      >
                        <IconButton
                          color="primary"
                          aria-label="phone number"
                          size="small"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              formData.project_development_couple_phone
                            );
                            toast.success("Phone number copied to clipboard");
                          }}
                        >
                          <PhoneIcon size="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip
                        title={formData.project_development_couple_email}
                        arrow
                      >
                        <IconButton
                          color="primary"
                          aria-label="email address"
                          size="small"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              formData.project_development_couple_email
                            );
                            toast.success("Email copied to clipboard");
                          }}
                        >
                          <EmailIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Box>

                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography>
                      <strong>Property Owner:</strong> {formData.property_owner}
                    </Typography>
                    <Stack direction="row" spacing={2}>
                      <Tooltip title={formData.phone_number} arrow>
                        <IconButton
                          color="primary"
                          aria-label="phone number"
                          size="small"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              formData.phone_number
                            );
                            toast.success("Phone number copied to clipboard");
                          }}
                        >
                          <PhoneIcon size="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={formData.email} arrow>
                        <IconButton
                          color="primary"
                          aria-label="email address"
                          size="small"
                          onClick={() => {
                            navigator.clipboard.writeText(formData.email);
                            toast.success("Email copied to clipboard");
                          }}
                        >
                          <EmailIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Box>
                </Box>
              </Box>

              {/* Address Review */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" color="primary">
                  Project Location
                </Typography>
                <Box sx={{ pl: 2 }}>
                  <Typography>
                    {formData.address_street1}
                    {formData.address_street2 &&
                      `, ${formData.address_street2}`}
                  </Typography>
                  <Typography>
                    {formData.address_city}, {formData.address_state}{" "}
                    {formData.address_zip_code}
                  </Typography>
                </Box>
              </Box>

              {/* Work Summary Review */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" color="primary">
                  Work Summary
                </Typography>
                <Box sx={{ pl: 2 }}>
                  <Typography>{formData.work_summary}</Typography>
                </Box>
              </Box>

              {/* Preferred Remedies Review */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" color="primary">
                  Preferred Remedies
                </Typography>
                <Box sx={{ pl: 2 }}>
                  <Typography>{formData.preferred_remedies}</Typography>
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

            {/* ProjectTextField for resource couple */}

            {/* Review Confirmation */}
            <FormControl component="fieldset" sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.review_completed_with_couple}
                    onChange={(e) =>
                      handleInputChange(
                        "review_completed_with_couple",
                        e.target.checked
                      )
                    }
                  />
                }
                label="I have reviewed the project information with the resource couple"
              />
            </FormControl>
            <FormControl component="fieldset">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.review_completed_with_homeowner}
                    onChange={(e) =>
                      handleInputChange(
                        "review_completed_with_homeowner",
                        e.target.checked
                      )
                    }
                  />
                }
                label="I have reviewed the project information with the homeowner"
              />
            </FormControl>

            {/* ProjectTextField or Concerns Section */}
            <ProjectTextField
              label="Issues or Concerns (Optional)"
              multiline
              rows={4}
              fullWidth
              value={formData.review_notes || ""}
              onChange={(e) =>
                handleInputChange("review_notes", e.target.value)
              }
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
                <ProjectTextField
                  label="Partner Stake"
                  fullWidth
                  value={formData.partner_stake}
                  onChange={(e) =>
                    handleInputChange("partner_stake", e.target.value)
                  }
                />

                <ProjectTextField
                  label="Partner Stake Liaison"
                  fullWidth
                  value={formData.partner_stake_liaison}
                  onChange={(e) =>
                    handleInputChange("partner_stake_liaison", e.target.value)
                  }
                />

                {/* Gather phone and email from partner stake liaison */}
                <Box sx={{ display: "flex", gap: 2 }}>
                  <ProjectTextField
                    label="Partner Stake Liaison Phone"
                    fullWidth
                    key="partner_stake_liaison_phone"
                    value={formData.partner_stake_liaison_phone}
                    onChange={(e) =>
                      handleInputChange(
                        "partner_stake_liaison_phone",
                        e.target.value
                      )
                    }
                  />

                  <ProjectTextField
                    label="Partner Stake Liaison Email"
                    fullWidth
                    key="partner_stake_liaison_email"
                    value={formData.partner_stake_liaison_email}
                    onChange={(e) =>
                      handleInputChange(
                        "partner_stake_liaison_email",
                        e.target.value
                      )
                    }
                  />
                </Box>

                <Divider sx={{ my: 2 }} />

                <ProjectTextField
                  // parnter ward
                  label="Partner Ward"
                  fullWidth
                  value={formData.partner_ward}
                  key="partner_ward"
                  onChange={(e) =>
                    handleInputChange("partner_ward", e.target.value)
                  }
                />

                <ProjectTextField
                  key="partner_ward_liaison"
                  label="Partner Ward Liaison(s)"
                  fullWidth
                  value={formData.partner_ward_liaison}
                  onChange={(e) =>
                    handleInputChange("partner_ward_liaison", e.target.value)
                  }
                />

                {/* Gather phone and email from partner ward liaison */}
                <Box sx={{ display: "flex", gap: 2 }}>
                  <ProjectTextField
                    key="partner_ward_liaison_phone1"
                    label="Partner Ward Liaison Phone"
                    fullWidth
                    value={formData.partner_ward_liaison_phone1}
                    onChange={(e) =>
                      handleInputChange(
                        "partner_ward_liaison_phone1",
                        e.target.value
                      )
                    }
                  />

                  <ProjectTextField
                    label="Partner Ward Liaison Email"
                    fullWidth
                    key="partner_ward_liaison_email1"
                    value={formData.partner_ward_liaison_email1}
                    onChange={(e) =>
                      handleInputChange(
                        "partner_ward_liaison_email1",
                        e.target.value
                      )
                    }
                  />
                </Box>

                <Box sx={{ display: "flex", gap: 2 }}>
                  <ProjectTextField
                    label="Partner Ward Liaison Phone 2 (Optional)"
                    fullWidth
                    key="partner_ward_liaison_phone2"
                    value={formData.partner_ward_liaison_phone2}
                    onChange={(e) =>
                      handleInputChange(
                        "partner_ward_liaison_phone2",
                        e.target.value
                      )
                    }
                  />

                  <ProjectTextField
                    label="Partner Ward Liaison Email 2 (Optional)"
                    fullWidth
                    key="partner_ward_liaison_email2"
                    value={formData.partner_ward_liaison_email2}
                    onChange={(e) =>
                      handleInputChange(
                        "partner_ward_liaison_email2",
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
                      checked={formData.partner_stake_contacted}
                      onChange={(e) =>
                        handleInputChange(
                          "partner_stake_contacted",
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
                      checked={formData.partner_ward_contacted}
                      onChange={(e) =>
                        handleInputChange(
                          "partner_ward_contacted",
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
                      checked={formData.site_visit_done_with_resource_couple}
                      onChange={(e) =>
                        handleInputChange(
                          "site_visit_done_with_resource_couple",
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
                      checked={formData.site_visit_done_with_host}
                      onChange={(e) =>
                        handleInputChange(
                          "site_visit_done_with_host",
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
                      checked={formData.site_visit_done_with_partner}
                      onChange={(e) =>
                        handleInputChange(
                          "site_visit_done_with_partner",
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
                        checked={formData.materials_procured}
                        onChange={(e) =>
                          handleInputChange(
                            "materials_procured",
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
                        checked={formData.tools_arranged}
                        onChange={(e) =>
                          handleInputChange("tools_arranged", e.target.checked)
                        }
                      />
                    }
                    label="Have arrangements been made for the tools and equipment?"
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.materials_on_site}
                        onChange={(e) =>
                          handleInputChange(
                            "materials_on_site",
                            e.target.checked
                          )
                        }
                      />
                    }
                    label="Are materials on site?"
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.called_811}
                        onChange={(e) =>
                          handleInputChange("called_811", e.target.checked)
                        }
                      />
                    }
                    label="Have we called 811 and ordered Blue Flags if needed?"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.dumpster_requested}
                        onChange={(e) =>
                          handleInputChange(
                            "dumpster_requested",
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
      <Card sx={{ margin: "auto", p: 1, position: "relative" }}>
        <CardContent>
          <Typography variant="h4" sx={{ mt: 1, mb: 3, textAlign: "center" }}>
            Days of Service Project Form
          </Typography>

          <Box
            sx={{
              position: "absolute",
              top: "0",
              right: "0",
              p: 1,
            }}
          >
            <Tooltip title={"ID:" + formData.id}>
              <IconButton color="primary" size="small">
                <Info />
              </IconButton>
            </Tooltip>
          </Box>

          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            {steps.map((step, index) => (
              <Step
                key={index}
                onClick={() => setActiveStep(index)}
                sx={{
                  cursor: "pointer",
                  "&:hover": {
                    // Add hover effects for the entire step
                    transition: "background-color 0.2s ease-in-out", // Smooth transition
                  },
                }}
              >
                <StepLabel
                  sx={{
                    cursor: "pointer",
                    "&:hover": {
                      "& .MuiStepIcon-root": {
                        color: "secondary.main", // Change to any color you want
                      },
                      // Add hover effects specifically for the label
                      color: "primary.main", // Changes text to your theme's primary color
                      "& .MuiStepLabel-label": {
                        fontWeight: 500, // Slightly bolder text
                      },
                    },
                    // Ensure smooth color transition
                    transition: "color 0.2s ease-in-out",
                  }}
                >
                  {step.label}
                </StepLabel>
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
      <Card sx={{ margin: "auto", mt: 4, p: 1 }}>
        <CardContent>
          <Box sx={{}}>
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
              <ProjectTextField
                label="Your Name"
                fullWidth
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
              />

              <ProjectTextField
                label="Collaborator's Email"
                helperText="Enter the email of the person, or persons, you want to collaborate with (separate multiple emails with a comma)"
                fullWidth
                value={collaboratorEmail}
                onChange={(e) => setCollaboratorEmail(e.target.value)}
                sx={{ flexGrow: 1 }}
              />
              <ProjectTextField
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
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                    >
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
        </CardContent>
      </Card>
    </>
  );
};

export default ProjectForm;

const ProjectTextField = ({
  label,
  value,
  onChange,
  hasInputAdornment,
  ...props
}) => {
  return (
    <TextField
      label={label}
      fullWidth
      value={value}
      onChange={onChange}
      {...props}
      variant="outlined"
      InputLabelProps={{
        shrink: value ? true : false,
        sx: { ml: hasInputAdornment ? 2 : 0 },
      }}
    />
  );
};
