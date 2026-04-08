"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Card,
  CardHeader,
  CardContent,
  Divider,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { Close, Download } from "@mui/icons-material";
import { supabase } from "@/util/supabase";
import jsPDF from "jspdf";

// Variable interpolation — same as signature page
function interpolate(text, vars, blankFallback = false) {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const val = vars[key];
    if (val !== undefined && val !== "") return val;
    return blankFallback ? "____" : `{{${key}}}`;
  });
}

// Read-only paragraph renderer with bold, line breaks, and variable substitution
function ReadOnlyParagraph({ text, vars }) {
  const rendered = interpolate(text, vars);
  const lines = rendered.split("\n");

  return (
    <Typography variant="body2" paragraph component="div">
      {lines.map((line, lineIdx) => {
        const boldParts = line.split(/\*\*([^*]+)\*\*/g);
        return (
          <React.Fragment key={lineIdx}>
            {lineIdx > 0 && <br />}
            {boldParts.map((p, i) =>
              i % 2 === 1 ? (
                <strong key={i}>{p}</strong>
              ) : (
                <React.Fragment key={i}>{p}</React.Fragment>
              ),
            )}
          </React.Fragment>
        );
      })}
    </Typography>
  );
}

export default function ReleaseFormViewDialog({
  open,
  onClose,
  formData,
  community,
}) {
  const [releaseForm, setReleaseForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [cityName, setCityName] = useState("");
  const contentRef = useRef(null);

  const cityId = community?.city_id ?? null;

  // Fetch release form template
  const fetchReleaseForm = useCallback(async () => {
    setLoading(true);
    try {
      if (cityId) {
        const { data: cityForm } = await supabase
          .from("property_release_forms")
          .select("title, partner_name, content, custom_fields")
          .eq("city_id", cityId)
          .eq("is_active", true)
          .maybeSingle();

        if (cityForm) {
          setReleaseForm(parseForm(cityForm));

          const { data: cityData } = await supabase
            .from("cities")
            .select("name")
            .eq("id", cityId)
            .maybeSingle();
          if (cityData) setCityName(cityData.name);

          return;
        }
      }

      // Fallback to default
      const { data: defaultForm } = await supabase
        .from("property_release_forms")
        .select("title, partner_name, content, custom_fields")
        .is("city_id", null)
        .eq("is_active", true)
        .maybeSingle();

      if (defaultForm) {
        setReleaseForm(parseForm(defaultForm));
      }
    } catch (err) {
      console.error("Error fetching release form:", err);
    } finally {
      setLoading(false);
    }
  }, [cityId]);

  useEffect(() => {
    if (open) fetchReleaseForm();
  }, [open, fetchReleaseForm]);

  // Build full address string
  const projectAddress = [
    formData?.address_street1,
    formData?.address_street2,
    formData?.address_city,
    formData?.address_state,
    formData?.address_zip_code,
  ]
    .filter(Boolean)
    .join(", ");

  // Build template vars — all fields resolved to their values
  const signedDate = formData?.terms_agreed_at
    ? new Date(formData.terms_agreed_at).toLocaleDateString()
    : "";
  const partnerName = cityName || releaseForm?.partner_name || "myHometown";

  const templateVars = {
    name: formData?.signature_text || "",
    date: signedDate,
    address: projectAddress,
    organization: "myHometown",
    partner: partnerName,
    // Merge custom field values
    ...(formData?.custom_field_values || {}),
  };

  // Add checkbox custom fields as ☑ / ☐
  for (const f of releaseForm?.custom_fields || []) {
    if (f.type === "checkbox") {
      templateVars[f.key] = formData?.custom_field_values?.[f.key] ? "☑" : "☐";
    }
  }

  const formTitle = releaseForm?.title ?? "Property Owner Release Form";
  const paragraphs = Array.isArray(releaseForm?.content)
    ? releaseForm.content
    : [];

  // Default content when no custom paragraphs
  const defaultParagraphs = [
    `{{organization}} aims to strengthen our community by assisting in the cleaning, repair, beautification, and rehabilitation of existing owner-occupied housing. As a property owner, I agree to accept the volunteer services of {{partner}}, its volunteers, and partners in connection with this program.`,
    `**Name:** {{name}}\n**Date:** {{date}}\n**Address:** {{address}}`,
    `I further agree to hold harmless the volunteers, {{partner}}, and its partners (together with all their employees, members, officers, partners and directors) in connection with any services or work performed by them relating to this program.`,
    `I recognize that all services and work are provided "as is," with NO WARRANTIES WHATSOEVER except as expressly agreed by the service provider in writing.`,
    `Photographic Release. I understand and agree that before, during and after the services and work provided as stated herein, I or my home and property may be photographed and/or videotaped by {{partner}} or its representatives and partners for internal and/or promotional use.`,
  ];

  const displayParagraphs =
    paragraphs.length > 0 ? paragraphs : defaultParagraphs;

  // Convert SVG data URL to PNG data URL via canvas
  const svgToPng = (svgDataUrl, width = 400, height = 130) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = () => resolve(null);
      img.src = svgDataUrl;
    });
  };

  // PDF download
  const handleDownloadPdf = async () => {
    const doc = new jsPDF({ unit: "mm", format: "letter" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const usableWidth = pageWidth - margin * 2;
    let y = margin;

    const ensureSpace = (needed) => {
      if (y + needed > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
    };

    // Build a checkbox lookup for quick reference
    const checkboxKeys = new Set();
    for (const f of releaseForm?.custom_fields || []) {
      if (f.type === "checkbox") checkboxKeys.add(f.key);
    }

    // Resolve template vars for PDF — use [X] / [ ] for checkboxes
    const pdfVars = { ...templateVars };
    for (const key of checkboxKeys) {
      pdfVars[key] = formData?.custom_field_values?.[key] ? "[X]" : "[ ]";
    }

    // Title
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    const titleLines = doc.splitTextToSize(
      formTitle.toUpperCase(),
      usableWidth,
    );
    doc.text(titleLines, pageWidth / 2, y, { align: "center" });
    y += titleLines.length * 6 + 4;

    // Subtitle
    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    doc.text("myHometown", pageWidth / 2, y, { align: "center" });
    y += 8;

    // Paragraphs
    doc.setFontSize(10);
    const lineHeight = 4.5;
    for (const para of displayParagraphs) {
      const resolved = interpolate(para.replace(/\*\*/g, ""), pdfVars, true);
      const subParagraphs = resolved.split("\n");
      for (const sub of subParagraphs) {
        const lines = doc.splitTextToSize(sub, usableWidth);
        ensureSpace(lines.length * lineHeight + 2);
        doc.text(lines, margin, y);
        y += lines.length * lineHeight + 2;
      }
      y += 2;
    }

    // Signature section
    ensureSpace(40);
    y += 4;

    doc.setFont(undefined, "bold");
    doc.text("Signed by:", margin, y);
    doc.setFont(undefined, "normal");
    doc.text(formData?.signature_text || "", margin + 25, y);
    y += 6;
    doc.text(`Date: ${signedDate}`, margin, y);
    y += 10;

    // Signature image — convert SVG to PNG first
    if (formData?.signature_image) {
      try {
        let imgData = formData.signature_image;
        if (imgData.includes("image/svg+xml")) {
          imgData = await svgToPng(imgData);
        }
        if (imgData) {
          ensureSpace(25);
          doc.addImage(imgData, "PNG", margin, y, 60, 20);
          y += 22;
        }
      } catch (err) {
        console.error("Failed to add signature image to PDF:", err);
      }
    }

    const safeName = (formData?.signature_text || "release-form").replace(
      /[^a-zA-Z0-9]/g,
      "_",
    );
    doc.save(`${safeName}_release_form.pdf`);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="h6" component="span">
          Release Form — View
        </Typography>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box ref={contentRef}>
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardHeader
                title={`myHometown\n${formTitle.toUpperCase()}`}
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
              <CardContent sx={{ px: { xs: 2, sm: 3 } }}>
                {displayParagraphs.map((para, idx) => (
                  <ReadOnlyParagraph
                    key={idx}
                    text={para}
                    vars={templateVars}
                  />
                ))}
              </CardContent>
            </Card>

            {/* Signature display */}
            {formData?.signature_text && (
              <Card variant="outlined" sx={{ mt: 2 }}>
                <CardContent>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700, mb: 1 }}
                  >
                    Signature
                  </Typography>
                  <Divider sx={{ mb: 1.5 }} />
                  <Typography variant="body2" gutterBottom>
                    <strong>Signed by:</strong> {formData.signature_text}
                  </Typography>
                  {signedDate && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      <strong>Date:</strong> {signedDate}
                    </Typography>
                  )}
                  {formData.signature_image && (
                    <Box
                      sx={{
                        mt: 1.5,
                        border: "1px solid",
                        borderColor: "grey.300",
                        borderRadius: 1,
                        p: 1.5,
                        display: "inline-block",
                        bgcolor: "#fff",
                      }}
                    >
                      <img
                        src={formData.signature_image}
                        alt="Signature"
                        style={{
                          maxWidth: 300,
                          height: "auto",
                          display: "block",
                        }}
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button
          variant="contained"
          startIcon={<Download />}
          onClick={async () => {
            setDownloading(true);
            try {
              await handleDownloadPdf();
            } finally {
              setDownloading(false);
            }
          }}
          disabled={loading || downloading}
        >
          {downloading ? "Generating..." : "Download PDF"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function parseForm(raw) {
  return {
    ...raw,
    content:
      typeof raw.content === "string" ? JSON.parse(raw.content) : raw.content,
    custom_fields:
      typeof raw.custom_fields === "string"
        ? JSON.parse(raw.custom_fields)
        : raw.custom_fields || [],
  };
}
