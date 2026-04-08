"use client";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { toast } from "react-toastify";
import { useProjectForm } from "@/contexts/ProjectFormProvider";
import ProjectTextField from "./ProjectTextField";
import EmailPreviewDialog from "@/components/days-of-service/EmailPreviewDialog";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { ExpandMore } from "@mui/icons-material";

const CollaborationSection = () => {
  const [collaboratorEmail, setCollaboratorEmail] = useState("");
  const [collaboratorMessage, setCollaboratorMessage] = useState("");
  const [fromName, setFromName] = useLocalStorage(
    "days-of-service-from-name",
    ""
  );
  const [isSending, setIsSending] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const { formData, addCollaborator } = useProjectForm();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const handleSendCollaborationEmail = async () => {
    if (!collaboratorEmail) return;
    setIsSending(true);
    try {
      const response = await fetch(
        "/api/communications/send-mail/send-dos-invite",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
        addCollaborator({
          email: collaboratorEmail,
          from: fromName,
          message: collaboratorMessage,
          date: new Date(),
        });
        setCollaboratorEmail("");
      } else throw new Error("Failed to send email");
    } catch (error) {
      console.error("Error sending collaboration email:", error);
      toast.error("Failed to send collaboration email. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card sx={{ margin: "auto", mt: 4, p: 1 }}>
      <CardContent>
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
            value={fromName}
            onChange={(e) => setFromName(e.target.value)}
          />
          <ProjectTextField
            label="Collaborator's Email"
            value={collaboratorEmail}
            onChange={(e) => setCollaboratorEmail(e.target.value)}
            helperText="Enter the email of the person, or persons, you want to collaborate with (separate multiple emails with a comma)"
          />
          <ProjectTextField
            label="Message"
            multiline
            rows={4}
            value={collaboratorMessage}
            onChange={(e) => setCollaboratorMessage(e.target.value)}
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
              onClick={() => setShowEmailDialog(true)}
            >
              {isSmallScreen ? "Preview Email" : "View Preview of Email"}
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
      </CardContent>
    </Card>
  );
};

export default CollaborationSection;
