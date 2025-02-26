"use client";
import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  TextField,
  Button,
  Container,
  Paper,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Alert,
  CheckCircleOutline,
} from "@mui/material";
import SignatureCanvas from "react-signature-canvas";
import { supabase } from "@/util/supabase";

const TermsOfServicePage = ({ params }) => {
  const projectId = params.formId;
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [signature, setSignature] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isValidToken, setIsValidToken] = useState(null); // null = loading, true = valid, false = invalid
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tokenStatus, setTokenStatus] = useState("validating"); // validating, valid, invalid, used
  const sigCanvas = useRef(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setIsValidToken(false);
      setTokenStatus("invalid");
      return;
    }

    const verifyToken = async () => {
      try {
        const { data, error } = await supabase
          .from("tokens")
          .select("is_used, used_at")
          .eq("token", token)
          .single();

        if (error || !data) {
          setIsValidToken(false);
          setTokenStatus("invalid");
        } else if (data.is_used) {
          setIsValidToken(false);
          setTokenStatus("used");
          // If the token was used by this user to submit the form, show thank you card
          setFormSubmitted(true);
        } else {
          setIsValidToken(true);
          setTokenStatus("valid");
        }
      } catch (error) {
        console.error("Error verifying token:", error);
        setIsValidToken(false);
        setTokenStatus("invalid");
      }
    };

    verifyToken();
  }, [searchParams]);

  const handleSubmit = async () => {
    if (!hasReadTerms) {
      alert("Please read and agree to the Terms of Service.");
      return;
    }

    const canvasSignature = sigCanvas.current.isEmpty()
      ? null
      : sigCanvas.current.getTrimmedCanvas().toDataURL("image/png");

    if (!signature.trim() && !canvasSignature) {
      alert("Please provide a signature.");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = searchParams.get("token");
      const timestamp = new Date().toISOString();

      // 1. Update the token to mark it as used
      if (token) {
        const { error: tokenError } = await supabase
          .from("tokens")
          .update({ is_used: true, used_at: timestamp })
          .eq("token", token);

        if (tokenError) {
          console.error("Failed to revoke token:", tokenError);
          alert("There was an issue with your submission. Please try again.");
          setIsSubmitting(false);
          return;
        }
      }

      // 2. Update the project form with the signature data
      if (projectId) {
        const { error: projectError } = await supabase
          .from("days_of_service_project_forms")
          .update({
            signature_text: signature.trim(),
            signature_image: canvasSignature,
            terms_agreed_at: timestamp,
          })
          .eq("id", projectId);

        if (projectError) {
          console.error(
            "Failed to update project with signature:",
            projectError
          );
          alert("There was an issue saving your signature. Please try again.");
          setIsSubmitting(false);
          return;
        }
      } else {
        console.error("Project ID not found");
        alert("There was an issue with your submission. Please try again.");
        setIsSubmitting(false);
        return;
      }

      setFormSubmitted(true);
      setTokenStatus("used");
      setIsValidToken(false); // Prevent further access to the form
      console.log("Signature data saved successfully");
    } catch (error) {
      console.error("Error in form submission:", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearSignature = () => {
    if (sigCanvas.current) sigCanvas.current.clear();
  };

  // Loading state while validating token
  if (tokenStatus === "validating") {
    return (
      <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" align="center">
            Validating access...
          </Typography>
        </Paper>
      </Container>
    );
  }

  // Show thank you card if form was submitted
  if (formSubmitted) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            textAlign: "center",
            borderRadius: 2,
            background: "linear-gradient(to bottom, #ffffff, #f9f9f9)",
          }}
        >
          <CheckCircleOutline
            sx={{
              fontSize: 80,
              color: "success.main",
              mb: 2,
            }}
          />
          <Typography variant="h4" gutterBottom color="primary.main">
            Thank You!
          </Typography>
          <Typography variant="h6" gutterBottom>
            Your Release Form Has Been Submitted
          </Typography>
          <Typography variant="body1" paragraph sx={{ mt: 2 }}>
            We've successfully received your signed release form for the Days of
            Service project.
          </Typography>
          <Typography variant="body1" paragraph>
            A project coordinator will contact you with additional information
            about the upcoming service day.
          </Typography>
          <Typography variant="body2" sx={{ mt: 3, color: "text.secondary" }}>
            This link has now been deactivated and cannot be used again.
          </Typography>
        </Paper>
      </Container>
    );
  }

  // Show access denied message if token is invalid or used
  if (!isValidToken) {
    const message =
      tokenStatus === "used"
        ? "This form has already been submitted. The link has been deactivated."
        : "You do not have valid access to this page. The link may be invalid or expired. Please request a new invitation from the project coordinator.";

    return (
      <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom align="center">
            {tokenStatus === "used"
              ? "Form Already Submitted"
              : "Access Denied"}
          </Typography>
          <Typography variant="body1" color="error" align="center">
            {message}
          </Typography>
        </Paper>
      </Container>
    );
  }

  // Render the form if token is valid
  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom align="center">
          Volunteer Release Form
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1" paragraph>
            Please review our Volunteer Release Form below. You must agree to
            the terms and provide your signature to proceed.
          </Typography>

          <TextField
            label="Type Name"
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            fullWidth
            margin="normal"
            // disabled={!hasReadTerms}
            placeholder="Type your full name"
            variant="outlined"
          />

          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardHeader
              title="Sample Volunteer Release Form"
              titleTypographyProps={{ variant: "h6" }}
              sx={{ bgcolor: "#f5f5f5", pb: 1, color: "error" }}
            />
            <Divider />
            <CardContent
              sx={{
                maxHeight: "250px",
                overflowY: "auto",
                px: 3,
                "&::-webkit-scrollbar": {
                  width: "8px",
                },
                "&::-webkit-scrollbar-track": {
                  backgroundColor: "#f1f1f1",
                  borderRadius: "4px",
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "#bdbdbd",
                  borderRadius: "4px",
                },
              }}
            >
              <Typography variant="body2" paragraph>
                <strong>Name:</strong>{" "}
                {signature || "__________________________"}
                <br />
                <strong>Date:</strong> {new Date().toLocaleDateString()}
              </Typography>

              <Typography variant="body2" paragraph>
                I, {signature || "__________________________"}, certify that I
                am the owner of the property described herein. I hereby give
                permission to volunteers to work on my property for the purpose
                of yard maintenance, gardening, landscaping, and related outdoor
                activities.
              </Typography>

              <Typography variant="body2" paragraph>
                I understand that these volunteers are not professional
                landscapers or contractors working for profit, and no warranty
                is made as to the quality of work done. The volunteers will
                perform tasks such as lawn mowing, weeding, planting, tree/shrub
                trimming, leaf removal, and general yard cleanup.
              </Typography>

              <Typography variant="body2" paragraph>
                In consideration of the volunteer services to be rendered to me
                or on my property by the volunteers, I, the undersigned, release
                and agree to indemnify and hold harmless volunteers, whether
                separately incorporated or not, including but not limited to
                Annual Conferences, and their members, officers, directors,
                executives, administrators, pastors, clergy, faculty,
                administrators, employees, representative, insurers, reinsurers
                and/or self-insurance administrators, assigns and/or
                representatives (hereafter collectively referred to as "the
                Releasees") from any and all claims, liability, damages, injury
                (including but not limited to physical and/or mental injury
                and/or death and/or property damage), delay or irregularity
                related to the aforementioned volunteer yard work services.
              </Typography>

              <Typography variant="body2">
                This release covers all rights and causes of action of every
                kind, nature and description, which the undersigned ever had,
                now has, and, but for this release, may have. This release binds
                the undersigned and their heirs, representatives and assignees.
              </Typography>
            </CardContent>
          </Card>

          <Typography variant="body2" sx={{ mt: 2 }}>
            Draw your signature below:
          </Typography>
          <Box
            sx={{
              border: "1px solid #ccc",
              borderRadius: "4px",
              mt: 1,
              bgcolor: "#fff",
            }}
          >
            <SignatureCanvas
              ref={sigCanvas}
              penColor="black"
              canvasProps={{
                width: 500,
                height: 200,
                className: "signature-canvas",
              }}
              disabled={!hasReadTerms}
            />
          </Box>
          <FormControlLabel
            control={
              <Checkbox
                checked={hasReadTerms}
                onChange={(e) => setHasReadTerms(e.target.checked)}
                color="primary"
              />
            }
            label="I have read and agree to the Release Form"
          />
          <Button
            variant="outlined"
            color="secondary"
            onClick={clearSignature}
            sx={{ mt: 1 }}
            disabled={!hasReadTerms}
          >
            Clear Signature
          </Button>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            onClick={handleSubmit}
            disabled={!hasReadTerms || isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default TermsOfServicePage;
