"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
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
  CircularProgress,
} from "@mui/material";
import SignatureCanvas from "react-signature-canvas";
import { supabase } from "@/util/supabase";
import { CheckCircleOutline } from "@mui/icons-material";

//  Variable interpolation
// Supported variables: {{name}}, {{date}}, {{address}}, {{organization}}, {{partner}}
function interpolate(text, vars) {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
}

// Render a paragraph string that may contain **bold** and \n characters
function RichParagraph({ text, vars, ...typographyProps }) {
  const resolved = interpolate(text, vars);
  const lines = resolved.split("\n");
  return (
    <Typography variant="body2" paragraph {...typographyProps}>
      {lines.map((line, lineIdx) => {
        const parts = line.split(/\*\*([^*]+)\*\*/g);
        return (
          <React.Fragment key={lineIdx}>
            {lineIdx > 0 && <br />}
            {parts.map((part, i) =>
              i % 2 === 1 ? <strong key={i}>{part}</strong> : part,
            )}
          </React.Fragment>
        );
      })}
    </Typography>
  );
}

//  Component
const TermsOfServicePage = ({ params }) => {
  const projectId = params.formId;

  // Token / form state
  const [tokenStatus, setTokenStatus] = useState("validating");
  const [isValidToken, setIsValidToken] = useState(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Signature state
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [signature, setSignature] = useState("");

  // Release form content fetched from DB
  const [releaseForm, setReleaseForm] = useState(null);
  const [projectAddress, setProjectAddress] = useState("");
  const [cityName, setCityName] = useState("");

  // Responsive canvas
  const sigCanvas = useRef(null);
  const canvasContainerRef = useRef(null);
  const [canvasWidth, setCanvasWidth] = useState(500);

  const searchParams = useSearchParams();

  //  Resize canvas to container width
  useEffect(() => {
    if (!canvasContainerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = Math.floor(entry.contentRect.width);
        if (w > 0) setCanvasWidth(w);
      }
    });
    observer.observe(canvasContainerRef.current);
    return () => observer.disconnect();
  }, []);

  //  Fetch release form for this project city (with default fallback)
  const fetchReleaseForm = useCallback(async (cityId) => {
    if (cityId) {
      const { data: cityForm } = await supabase
        .from("property_release_forms")
        .select("title, partner_name, content")
        .eq("is_active", true)
        .maybeSingle();

      if (cityForm) {
        setReleaseForm(cityForm);
        return;
      }
    }

    const { data: defaultForm } = await supabase
      .from("property_release_forms")
      .select("title, partner_name, content")
      .is("city_id", null)
      .eq("is_active", true)
      .maybeSingle();

    if (defaultForm) setReleaseForm(defaultForm);
  }, []);

  //  Validate token + bootstrap data
  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setIsValidToken(false);
      setTokenStatus("invalid");
      return;
    }

    const bootstrap = async () => {
      try {
        const { data: tokenData, error: tokenError } = await supabase
          .from("tokens")
          .select("is_used, used_at")
          .eq("token", token)
          .single();

        if (tokenError || !tokenData) {
          setIsValidToken(false);
          setTokenStatus("invalid");
          return;
        }

        if (tokenData.is_used) {
          setIsValidToken(false);
          setTokenStatus("used");
          setFormSubmitted(true);
          return;
        }

        if (projectId) {
          const { data: projectForm } = await supabase
            .from("days_of_service_project_forms")
            .select(
              "city_id, address_street1, address_street2, address_city, address_state, address_zip_code",
            )
            .eq("id", projectId)
            .maybeSingle();

          if (projectForm) {
            const parts = [
              projectForm.address_street1,
              projectForm.address_street2,
              projectForm.address_city,
              projectForm.address_state,
              projectForm.address_zip_code,
            ].filter(Boolean);
            setProjectAddress(parts.join(", "));

            // Fetch city name if city_id exists
            if (projectForm.city_id) {
              const { data: cityData } = await supabase
                .from("cities")
                .select("name")
                .eq("id", projectForm.city_id)
                .maybeSingle();

              if (cityData) {
                setCityName(cityData.name);
              }
            }

            await fetchReleaseForm(projectForm.city_id);
          } else {
            await fetchReleaseForm(null);
          }
        } else {
          await fetchReleaseForm(null);
        }

        setIsValidToken(true);
        setTokenStatus("valid");
      } catch (err) {
        console.error("Error during bootstrap:", err);
        setIsValidToken(false);
        setTokenStatus("invalid");
      }
    };

    bootstrap();
  }, [searchParams, projectId, fetchReleaseForm]);

  //  Submit
  const handleSubmit = async () => {
    if (!hasReadTerms) {
      alert("Please read and agree to the Terms of Service.");
      return;
    }

    const canvasSignature =
      sigCanvas.current && !sigCanvas.current.isEmpty()
        ? sigCanvas.current.getTrimmedCanvas().toDataURL("image/png")
        : null;

    if (!signature.trim() && !canvasSignature) {
      alert("Please provide a signature.");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = searchParams.get("token");
      const timestamp = new Date().toISOString();

      if (token) {
        const { error: tokenError } = await supabase
          .from("tokens")
          .update({ is_used: true, used_at: timestamp })
          .eq("token", token);

        if (tokenError) {
          console.error("Failed to revoke token:", tokenError);
          alert("There was an issue with your submission. Please try again.");
          return;
        }
      }

      if (!projectId) {
        console.error("Project ID not found");
        alert("There was an issue with your submission. Please try again.");
        return;
      }

      const { error: projectError } = await supabase
        .from("days_of_service_project_forms")
        .update({
          signature_text: signature.trim(),
          signature_image: canvasSignature,
          terms_agreed_at: timestamp,
          is_waiver_signed: true,
        })
        .eq("id", projectId);

      if (projectError) {
        console.error("Failed to update project with signature:", projectError);
        alert("There was an issue saving your signature. Please try again.");
        return;
      }

      setFormSubmitted(true);
      setTokenStatus("used");
      setIsValidToken(false);
    } catch (err) {
      console.error("Error in form submission:", err);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearSignature = () => {
    if (sigCanvas.current) sigCanvas.current.clear();
  };

  //  Template variables
  const templateVars = {
    name: signature.trim() || "__________________________",
    date: new Date().toLocaleDateString(),
    address: projectAddress || "__________________________",
    organization: "myHometown",
    partner: cityName || releaseForm?.partner_name || "myHometown",
  };

  //  Render: loading
  if (tokenStatus === "validating") {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, px: { xs: 1, sm: 3 } }}>
        <Paper elevation={3} sx={{ p: 3, textAlign: "center" }}>
          <CircularProgress size={32} sx={{ mb: 2 }} />
          <Typography variant="h6">Validating access</Typography>
        </Paper>
      </Container>
    );
  }

  //  Render: thank you
  if (formSubmitted) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, px: { xs: 1, sm: 3 } }}>
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, sm: 4 },
            textAlign: "center",
            borderRadius: 2,
            background: "linear-gradient(to bottom, #ffffff, #f9f9f9)",
          }}
        >
          <CheckCircleOutline
            sx={{ fontSize: 72, color: "success.main", mb: 2 }}
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

  //  Render: access denied
  if (!isValidToken) {
    const isUsed = tokenStatus === "used";
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, px: { xs: 1, sm: 3 } }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom align="center">
            {isUsed ? "Form Already Submitted" : "Access Denied"}
          </Typography>
          <Typography variant="body1" color="error" align="center">
            {isUsed
              ? "This form has already been submitted. The link has been deactivated."
              : "You do not have valid access to this page. The link may be invalid or expired. Please request a new invitation from the project coordinator."}
          </Typography>
        </Paper>
      </Container>
    );
  }

  //  Render: main form
  const formTitle = releaseForm?.title ?? "Property Owner Release Form";
  const orgName = "myHometown";
  const paragraphs = Array.isArray(releaseForm?.content)
    ? releaseForm.content
    : [];

  return (
    <Container
      maxWidth="lg"
      sx={{ mt: { xs: 2, sm: 4 }, mb: 4, px: { xs: 1, sm: 3 } }}
    >
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography
          variant="h5"
          gutterBottom
          align="center"
          sx={{ fontWeight: 700 }}
        >
          {formTitle}
        </Typography>

        <Typography variant="body2" paragraph color="text.secondary">
          Please review the release form below. You must agree to the terms and
          provide your signature to proceed.
        </Typography>

        <TextField
          label="Type Your Full Name"
          value={signature}
          onChange={(e) => setSignature(e.target.value)}
          fullWidth
          margin="normal"
          placeholder="Your full name"
          variant="outlined"
          size="small"
          inputProps={{ autoComplete: "name" }}
        />

        <Card variant="outlined" sx={{ mb: 3, mt: 2 }}>
          <CardHeader
            title={`${orgName}\n${formTitle.toUpperCase()}`}
            titleTypographyProps={{
              variant: "subtitle2",
              sx: {
                whiteSpace: "pre-line",
                fontWeight: 700,
                fontSize: "0.8rem",
              },
            }}
            sx={{ bgcolor: "#f5f5f5", pb: 1 }}
          />
          <Divider />
          <CardContent
            sx={{
              maxHeight: { xs: "200px", sm: "260px" },
              overflowY: "auto",
              px: { xs: 2, sm: 3 },
              "&::-webkit-scrollbar": { width: "6px" },
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
            {paragraphs.length > 0 ? (
              paragraphs.map((para, idx) => (
                <RichParagraph key={idx} text={para} vars={templateVars} />
              ))
            ) : (
              <>
                <Typography variant="body2" paragraph>
                  {interpolate(
                    "{{organization}} aims to strengthen our community by assisting in the cleaning, repair, beautification, and rehabilitation of existing owner-occupied housing. As a property owner, I agree to accept the volunteer services of {{partner}}, its volunteers, and partners in connection with this program.",
                    templateVars,
                  )}
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Name:</strong> {templateVars.name}
                  <br />
                  <strong>Date:</strong> {templateVars.date}
                  {projectAddress && (
                    <>
                      <br />
                      <strong>Address:</strong> {projectAddress}
                    </>
                  )}
                </Typography>
                <Typography variant="body2" paragraph>
                  {interpolate(
                    "I further agree to hold harmless the volunteers, {{partner}}, and its partners (together with all their employees, members, officers, partners and directors) in connection with any services or work performed by them relating to this program.",
                    templateVars,
                  )}
                </Typography>
                <Typography variant="body2" paragraph>
                  I recognize that all services and work are provided &quot;as
                  is,&quot; with NO WARRANTIES WHATSOEVER except as expressly
                  agreed by the service provider in writing.
                </Typography>
                <Typography variant="body2">
                  {interpolate(
                    "Photographic Release. I understand and agree that before, during and after the services and work provided as stated herein, I or my home and property may be photographed and/or videotaped by {{partner}} or its representatives and partners for internal and/or promotional use.",
                    templateVars,
                  )}
                </Typography>
              </>
            )}
          </CardContent>
        </Card>

        <FormControlLabel
          control={
            <Checkbox
              checked={hasReadTerms}
              onChange={(e) => setHasReadTerms(e.target.checked)}
              color="primary"
            />
          }
          label={
            <Typography variant="body2">
              I have read and agree to the Release Form
            </Typography>
          }
          sx={{ mb: 1 }}
        />

        <Typography variant="body2" sx={{ mt: 1, mb: 0.5 }}>
          Draw your signature below:
        </Typography>
        <Box
          ref={canvasContainerRef}
          sx={{
            border: "1px solid",
            borderColor: hasReadTerms ? "grey.400" : "grey.300",
            borderRadius: "4px",
            bgcolor: hasReadTerms ? "#fff" : "#fafafa",
            overflow: "hidden",
            transition: "border-color 0.2s",
            touchAction: "none",
          }}
        >
          <SignatureCanvas
            ref={sigCanvas}
            penColor="black"
            canvasProps={{
              width: canvasWidth,
              height: 160,
              style: { display: "block" },
            }}
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 1,
            mt: 2,
          }}
        >
          <Button
            variant="outlined"
            color="secondary"
            onClick={clearSignature}
            disabled={!hasReadTerms}
            fullWidth
          >
            Clear Signature
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={!hasReadTerms || isSubmitting}
            fullWidth
          >
            {isSubmitting ? "Submitting" : "Submit"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default TermsOfServicePage;
