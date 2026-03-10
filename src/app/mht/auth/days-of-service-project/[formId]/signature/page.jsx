"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  Button,
  Container,
  Paper,
  Card,
  CardContent,
  CardHeader,
  Divider,
  CircularProgress,
} from "@mui/material";
import Signature from "@uiw/react-signature";
import { supabase } from "@/util/supabase";
import { CheckCircleOutline } from "@mui/icons-material";

//  Variable interpolation
// Supported variables: {{name}}, {{date}}, {{address}}, {{organization}}, {{partner}}
function interpolate(text, vars) {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
}

// Render a paragraph string that may contain **bold**, \n, and {{variables}}.
// Built-in vars are interpolated as text. Custom fields render as inline inputs.
function RichParagraph({
  text,
  vars,
  customFieldMap,
  customFieldValues,
  onFieldChange,
  ...typographyProps
}) {
  // Replace a text segment's {{key}} placeholders with values or inline inputs
  const renderSegment = (segment, segKey) => {
    const parts = segment.split(/\{\{(\w+)\}\}/g);
    return parts.map((part, i) => {
      if (i % 2 === 0) return part; // plain text
      const cf = customFieldMap?.[part];
      if (cf && onFieldChange) {
        if ((cf.type || "text") === "checkbox") {
          return (
            <input
              key={`${segKey}-${part}-${i}`}
              type="checkbox"
              checked={!!customFieldValues?.[part]}
              onChange={(e) => onFieldChange(part, e.target.checked)}
              style={{
                verticalAlign: "middle",
                width: 16,
                height: 16,
                margin: "0 4px",
                cursor: "pointer",
              }}
            />
          );
        }
        return (
          <input
            key={`${segKey}-${part}-${i}`}
            type="text"
            value={customFieldValues?.[part] || ""}
            onChange={(e) => onFieldChange(part, e.target.value)}
            placeholder={cf.label || part}
            style={{
              border: "none",
              borderBottom: "1px solid #999",
              outline: "none",
              fontFamily: "inherit",
              fontSize: "inherit",
              padding: "0 2px",
              minWidth: 100,
              background: "transparent",
            }}
          />
        );
      }
      // Built-in var or unknown — substitute as text
      return vars[part] ?? `{{${part}}}`;
    });
  };

  const lines = text.split("\n");
  return (
    <Typography variant="body2" paragraph component="div" {...typographyProps}>
      {lines.map((line, lineIdx) => {
        const boldParts = line.split(/\*\*([^*]+)\*\*/g);
        return (
          <React.Fragment key={lineIdx}>
            {lineIdx > 0 && <br />}
            {boldParts.map((p, i) =>
              i % 2 === 1 ? (
                <strong key={i}>{renderSegment(p, `${lineIdx}-${i}`)}</strong>
              ) : (
                <React.Fragment key={i}>
                  {renderSegment(p, `${lineIdx}-${i}`)}
                </React.Fragment>
              ),
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
  const [customFieldValues, setCustomFieldValues] = useState({});

  // Signature ref
  const sigRef = useRef(null);
  const sigWrapperRef = useRef(null);
  const [signatureImage, setSignatureImage] = useState(null);
  const signatureImageRef = useRef(null);

  const searchParams = useSearchParams();

  // Capture signature from the SVG on pointer events
  const captureSignature = useCallback(() => {
    if (!sigRef.current) return;
    let svgEl = sigRef.current.svg?.current;
    if (!svgEl && sigWrapperRef.current) {
      svgEl = sigWrapperRef.current.querySelector("svg");
    }
    if (svgEl) {
      const paths = svgEl.querySelectorAll("path");
      const hasContent =
        paths.length > 0 &&
        Array.from(paths).some((path) => path.getAttribute("d"));
      if (hasContent) {
        const svgData = new XMLSerializer().serializeToString(svgEl);
        const dataUrl = `data:image/svg+xml;base64,${btoa(svgData)}`;
        signatureImageRef.current = dataUrl;
        setSignatureImage(dataUrl);
      }
    }
  }, []);

  useEffect(() => {
    const wrapper = sigWrapperRef.current;
    if (!wrapper) return;
    const handlePointerUp = () => setTimeout(captureSignature, 50);
    wrapper.addEventListener("pointerup", handlePointerUp);
    wrapper.addEventListener("pointerleave", handlePointerUp);
    return () => {
      wrapper.removeEventListener("pointerup", handlePointerUp);
      wrapper.removeEventListener("pointerleave", handlePointerUp);
    };
  }, [captureSignature]);

  //  Fetch release form for this project city (with default fallback)
  const fetchReleaseForm = useCallback(async (cityId) => {
    if (cityId) {
      const { data: cityForm } = await supabase
        .from("property_release_forms")
        .select("title, partner_name, content, custom_fields")
        .eq("city_id", cityId)
        .eq("is_active", true)
        .maybeSingle();

      if (cityForm) {
        // Parse content if it's a JSON string
        const parsedForm = {
          ...cityForm,
          content:
            typeof cityForm.content === "string"
              ? JSON.parse(cityForm.content)
              : cityForm.content,
          custom_fields:
            typeof cityForm.custom_fields === "string"
              ? JSON.parse(cityForm.custom_fields)
              : cityForm.custom_fields || [],
        };
        setReleaseForm(parsedForm);
        return;
      }
    }

    // Fallback to default form (city_id is null)
    const { data: defaultForm } = await supabase
      .from("property_release_forms")
      .select("title, partner_name, content, custom_fields")
      .is("city_id", null)
      .eq("is_active", true)
      .maybeSingle();

    if (defaultForm) {
      // Parse content if it's a JSON string
      const parsedForm = {
        ...defaultForm,
        content:
          typeof defaultForm.content === "string"
            ? JSON.parse(defaultForm.content)
            : defaultForm.content,
        custom_fields:
          typeof defaultForm.custom_fields === "string"
            ? JSON.parse(defaultForm.custom_fields)
            : defaultForm.custom_fields || [],
      };
      setReleaseForm(parsedForm);
    }
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

    // Try one final capture in case pointerup was missed
    captureSignature();

    // Read from ref (synchronous) since setState is async
    const capturedImage = signatureImageRef.current;

    if (!signature.trim() && !capturedImage) {
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
          signature_image: capturedImage,
          terms_agreed_at: timestamp,
          is_waiver_signed: true,
          custom_field_values: {
            ...customFieldValues,
            name: signature.trim(),
            address: projectAddress,
          },
          // Save the (possibly edited) address back
          address_street1: projectAddress,
          address_street2: null,
          address_city: null,
          address_state: null,
          address_zip_code: null,
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
    if (sigRef.current) sigRef.current.clear();
    signatureImageRef.current = null;
    setSignatureImage(null);
  };

  //  Template variables (only non-editable built-ins get text substitution)
  const templateVars = {
    date: new Date().toLocaleDateString(),
    organization: "myHometown",
    partner: cityName || releaseForm?.partner_name || "myHometown",
  };

  // Build a lookup map for inline-editable fields (custom + name/address)
  const inlineFieldMap = {};
  for (const f of releaseForm?.custom_fields || []) {
    if (f.key) inlineFieldMap[f.key] = f;
  }
  inlineFieldMap.name = { key: "name", label: "Full Name", type: "text" };
  inlineFieldMap.address = {
    key: "address",
    label: "Property Address",
    type: "text",
  };

  const inlineFieldValues = {
    ...customFieldValues,
    name: signature,
    address: projectAddress,
  };

  const handleInlineFieldChange = (key, value) => {
    if (key === "name") {
      setSignature(value);
    } else if (key === "address") {
      setProjectAddress(value);
    } else {
      setCustomFieldValues((prev) => ({ ...prev, [key]: value }));
    }
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
              px: { xs: 2, sm: 3 },
            }}
          >
            {paragraphs.length > 0 ? (
              paragraphs.map((para, idx) => (
                <RichParagraph
                  key={idx}
                  text={para}
                  vars={templateVars}
                  customFieldMap={inlineFieldMap}
                  customFieldValues={inlineFieldValues}
                  onFieldChange={handleInlineFieldChange}
                />
              ))
            ) : (
              <>
                <Typography variant="body2" paragraph>
                  {interpolate(
                    "{{organization}} aims to strengthen our community by assisting in the cleaning, repair, beautification, and rehabilitation of existing owner-occupied housing. As a property owner, I agree to accept the volunteer services of {{partner}}, its volunteers, and partners in connection with this program.",
                    templateVars,
                  )}
                </Typography>
                <RichParagraph
                  text={
                    "**Name:** {{name}}\n**Date:** {{date}}\n**Address:** {{address}}"
                  }
                  vars={templateVars}
                  customFieldMap={inlineFieldMap}
                  customFieldValues={inlineFieldValues}
                  onFieldChange={handleInlineFieldChange}
                />
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
          ref={sigWrapperRef}
          sx={{
            border: "1px solid",
            borderColor: hasReadTerms ? "grey.400" : "grey.300",
            borderRadius: "4px",
            bgcolor: hasReadTerms ? "#fff" : "#fafafa",
            overflow: "hidden",
            transition: "border-color 0.2s",
            touchAction: "none",
            "& svg": {
              display: "block",
              width: "100%",
              height: 160,
            },
          }}
        >
          <Signature ref={sigRef} />
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
