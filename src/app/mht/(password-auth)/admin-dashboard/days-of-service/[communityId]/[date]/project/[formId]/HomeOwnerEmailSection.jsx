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
} from "@mui/material";
import { toast } from "react-toastify";
import { useProjectForm } from "@/contexts/ProjectFormProvider";
import ProjectTextField from "./ProjectTextField";

import { ExpandMore } from "@mui/icons-material";

const HomeOwnerEmailSection = () => {
  const [isSending, setIsSending] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const { formData, addCollaborator } = useProjectForm();

  const handleSendHomeownerEmail = async () => {
    if (!formData.email || !formData.property_owner) {
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
            to: formData.email,
            formId: formData.id,
          }),
        }
      );

      if (response.ok) {
        const { token } = await response.json(); // Get token from API response
        toast.success(`${formData.property_owner}'s email sent successfully.`);
        addCollaborator({
          email: formData.email,
          date: new Date(),
          type: "property-owner",
        });
      } else {
        const { error } = await response.json();
        throw new Error(error || "Failed to send email");
      }
    } catch (error) {
      console.error("Error sending property owner email:", error);
      toast.error("Failed to send property owner email. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Box sx={{ mt: 2, mb: 4 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Grid container spacing={1}>
          <Grid item xs={12} sm={4.5}>
            <ProjectTextField
              label="Property Owner"
              value={formData.property_owner}
              key="property_owner"
              // readonly
              InputProps={{
                readOnly: true,
              }}
              disabled
              sx={{
                "& .MuiInputLabel-root.Mui-disabled": {
                  color: "text.primary", // Keeps the label text in the normal color
                },
                "& .MuiInputBase-input.Mui-disabled": {
                  WebkitTextFillColor: "rgba(0, 0, 0, 0.5)", // Makes the input text darker
                },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4.5}>
            <ProjectTextField
              label="Property Owner's Email"
              value={formData.email}
              InputProps={{
                readOnly: true,
              }}
              disabled
              sx={{
                "& .MuiInputLabel-root.Mui-disabled": {
                  color: "text.primary", // Keeps the label text in the normal color
                },
                "& .MuiInputBase-input.Mui-disabled": {
                  WebkitTextFillColor: "rgba(0, 0, 0, 0.5)", // Makes the input text darker
                },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ height: "100%" }}
              onClick={handleSendHomeownerEmail}
              disabled={
                isSending || !formData.email || !formData.property_owner
              }
            >
              {isSending ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Send Email"
              )}
            </Button>
          </Grid>
          {(!formData.email || !formData.property_owner) && (
            <Grid item xs={12} sm={12}>
              <Typography variant="subtitle" color="error">
                *Please fill out the Property Owner and Property Owner&apos;s
                Email fields in Step 1 before sending an email.
              </Typography>
            </Grid>
          )}
        </Grid>
      </Box>

      {formData.collaborators &&
        formData.collaborators.some((c) => c.type === "property-owner") && (
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ my: 2 }} />
            <Accordion
              elevation={0}
              sx={{
                "&.MuiAccordion-root:before": {
                  display: "none",
                },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMore />}
                aria-controls="collaboration-history-content"
                id="collaboration-history-header"
                sx={{ pl: 0, pr: 1 }}
              >
                <Typography variant="subtitle1" color="primary">
                  Property Owner Email History
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 0 }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {formData.collaborators
                    .filter(
                      (collaborator) => collaborator.type === "property-owner"
                    )
                    .map((collaborator, index) => (
                      <Paper key={index} variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="body2">
                          <strong>Sent to:</strong> {collaborator.email}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Date:</strong>{" "}
                          {new Date(collaborator.date).toLocaleDateString()}
                        </Typography>
                      </Paper>
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
