"use client";
import React, { useState } from "react";
import {
  Typography,
  Box,
  Button,
  CircularProgress,
  Accordion,
  AccordionSummary,
  Grid,
  AccordionDetails,
  Paper,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { toast } from "react-toastify";
import { useProjectForm } from "@/contexts/ProjectFormProvider";
import ProjectTextField from "./ProjectTextField";
import { ExpandMore } from "@mui/icons-material";

const HomeOwnerEmailSection = () => {
  const [isSending, setIsSending] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState(""); // State for selected email
  const { formData, addCollaborator } = useProjectForm();

  // Build email options dynamically
  const emailOptions = [];
  if (formData.email) {
    emailOptions.push({
      value: formData.email,
      label: `Property Owner Email`,
    });
  }
  if (formData.email_2) {
    emailOptions.push({
      value: formData.email_2,
      label: `Property Owner 2 Email`,
    });
  }
  if (formData.project_development_couple_email1) {
    emailOptions.push({
      value: formData.project_development_couple_email1,
      label: `Project Developer Email`,
    });
  }
  if (formData.project_development_couple_email2) {
    emailOptions.push({
      value: formData.project_development_couple_email2,
      label: `Project Developer Email 2`,
    });
  }
  if (formData.project_development_couple_email1) {
    emailOptions.push({
      value: formData.project_development_couple_email1,
      label: `Resource Couple Email`,
    });
  }
  if (formData.project_development_couple_email2) {
    emailOptions.push({
      value: formData.project_development_couple_email2,
      label: `Resource Couple Email 2`,
    });
  }

  const handleSendHomeownerEmail = async () => {
    if (!selectedEmail || !formData.property_owner) {
      toast.error(
        "Please select an email and ensure Property Owner is filled."
      );
      return;
    }
    setIsSending(true);

    try {
      const response = await fetch(
        "/api/communications/send-mail/send-homeowner-invite",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            propertyOwner: formData.property_owner,
            to: selectedEmail, // Use selected email
            formId: formData.id,
          }),
        }
      );

      if (response.ok) {
        const { token } = await response.json();
        toast.success(`${formData.property_owner}'s email sent successfully.`);
        addCollaborator({
          email: selectedEmail,
          date: new Date(),
          type: "property-owner",
        });
        // Optionally reset selectedEmail if desired
        // setSelectedEmail("");
      } else {
        const { error } = await response.json();
        throw new Error(error || "Failed to send email");
      }
    } catch (error) {
      console.error("Error sending property owner email:", error);
      toast.error("Failed to send email. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Grid container spacing={1}>
          <Grid item xs={12} sm={4.5} sx={{ mb: { md: 0, xs: 1 } }}>
            <ProjectTextField
              label="Property Owner"
              value={formData.property_owner}
              key="property_owner"
              InputProps={{ readOnly: true }}
              disabled
              sx={{
                "& .MuiInputLabel-root.Mui-disabled": {
                  color: "text.primary",
                },
                "& .MuiInputBase-input.Mui-disabled": {
                  WebkitTextFillColor: "rgba(0, 0, 0, 0.5)",
                },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4.5}>
            <FormControl fullWidth disabled={emailOptions.length === 0}>
              <InputLabel id="email-select-label">
                Select Email Recipient
              </InputLabel>
              <Select
                labelId="email-select-label"
                value={selectedEmail}
                onChange={(e) => setSelectedEmail(e.target.value)}
                label="Select Email Recipient"
                disabled={emailOptions.length === 0}
                renderValue={(selected) => {
                  const option = emailOptions.find(
                    (opt) => opt.value === selected
                  );
                  return option ? option.value : "";
                }}
              >
                {emailOptions.length === 0 ? (
                  <MenuItem value="" disabled>
                    No emails available
                  </MenuItem>
                ) : (
                  emailOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label} ({option.value})
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ height: "100%" }}
              onClick={handleSendHomeownerEmail}
              disabled={isSending || !selectedEmail || !formData.property_owner}
            >
              {isSending ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Send Email"
              )}
            </Button>
          </Grid>
          {!formData.email &&
            !formData.project_development_couple_email1 &&
            !formData.project_development_couple_email2 && (
              <Grid item xs={12} sm={12}>
                <Typography variant="subtitle" color="error">
                  *Please fill out at least one email field (Property Owner, Dev
                  Couple 1, or Dev Couple 2) in Step 1 before sending an email.
                </Typography>
              </Grid>
            )}
        </Grid>
      </Box>

      {formData.collaborators &&
        formData.collaborators.some((c) => c.type === "property-owner") && (
          <Box sx={{}}>
            <Divider sx={{ my: 2 }} />
            <Accordion
              elevation={0}
              sx={{
                "&.MuiAccordion-root:before": { display: "none" },
                border: "1px solid #E0E0E0",
                px: 1,
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMore />}
                aria-controls="collaboration-history-content"
                id="collaboration-history-header"
              >
                <Typography variant="subtitle1" color="primary">
                  Property Owner Email History
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: { xs: 1, sm: 2 },
                  }}
                >
                  {formData.collaborators
                    .filter((c) => c.type === "property-owner")
                    .map((collaborator, index) => (
                      <React.Fragment key={index}>
                        <Box>
                          <Typography variant="body2">
                            <strong>Sent to:</strong> {collaborator.email}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Date:</strong>{" "}
                            {new Date(collaborator.date).toLocaleDateString()}
                          </Typography>
                        </Box>
                        {index !==
                          formData.collaborators.filter(
                            (c) => c.type === "property-owner"
                          ).length -
                            1 && <Divider />}
                      </React.Fragment>
                    ))}
                </Box>
              </AccordionDetails>
            </Accordion>
          </Box>
        )}
    </Box>
  );
};

export default HomeOwnerEmailSection;
