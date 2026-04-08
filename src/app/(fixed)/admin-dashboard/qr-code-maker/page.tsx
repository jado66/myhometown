"use client";

import type React from "react";

import { useState } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Alert,
  CircularProgress,
} from "@mui/material";
import QRCode from "qrcode";

export default function QRCodeGenerator() {
  const [text, setText] = useState<string>("");
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>("");

  const hardcodedOptions = {
    size: 400,
    foregroundColor: "#000000", // Dark green for brand
    backgroundColor: "#ffffff",
    errorCorrectionLevel: "H" as const, // High error correction for logo overlay
    margin: 2,
  };

  const generateQRCode = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!text.trim()) {
      setError("Please enter text or URL to generate QR code");
      return;
    }

    setIsGenerating(true);
    setError("");

    try {
      console.log("Starting QR code generation with text:", text);

      const options = hardcodedOptions;
      const desiredSize = options.size;

      // Create QR object to get module info
      const qr = QRCode.create(text, {
        errorCorrectionLevel: options.errorCorrectionLevel,
      });
      const moduleCount = qr.modules.size;

      // Calculate integer scale for pixel-perfect rendering
      const margin = options.margin;
      const totalUnits = moduleCount + margin * 2;
      let scale = Math.floor(desiredSize / totalUnits);
      if (scale < 1) scale = 1;
      const size = scale * totalUnits;

      console.log(
        `Module count: ${moduleCount}, Scale: ${scale}, Actual size: ${size}`
      );

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Could not get canvas context");
      }

      canvas.width = size;
      canvas.height = size;

      // Fill background
      ctx.fillStyle = options.backgroundColor;
      ctx.fillRect(0, 0, size, size);

      // Draw QR modules with integer pixels
      ctx.fillStyle = options.foregroundColor;
      for (let row = 0; row < moduleCount; row++) {
        for (let col = 0; col < moduleCount; col++) {
          if (qr.modules.data[row * moduleCount + col]) {
            const x = (margin + col) * scale;
            const y = (margin + row) * scale;
            ctx.fillRect(x, y, scale, scale);
          }
        }
      }
      console.log("QR code modules drawn pixel-perfect");

      // Load logo
      const logoImage = new Image();
      logoImage.crossOrigin = "anonymous";

      await new Promise((resolve, reject) => {
        logoImage.onload = () => {
          console.log("Logo loaded successfully");
          resolve(undefined);
        };
        logoImage.onerror = (err) => {
          console.log("Logo failed to load:", err);
          reject(err);
        };
        // Use root-relative path for public assets
        logoImage.src = `/svgs/MHT_H_Icon_Green.svg`;
      });

      // Pixel-perfect overlay calculations (all integer)
      let logoModules = Math.floor(moduleCount * 0.18);
      const marginModules = 2;
      let overlayModules = logoModules + marginModules * 2;

      // Prevent overlay from being too large for small QRs
      const minEdgeModules = 4; // Leave at least this many modules on edges
      if (overlayModules > moduleCount - minEdgeModules * 2) {
        overlayModules = moduleCount - minEdgeModules * 2;
        logoModules = overlayModules - marginModules * 2;
        if (logoModules < 0) logoModules = 0;
      }

      const overlayStartModule = Math.floor((moduleCount - overlayModules) / 2);
      const overlayX = (margin + overlayStartModule) * scale;
      const overlaySize = overlayModules * scale;

      // Draw white square background for logo (covers whole modules)
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(overlayX, overlayX, overlaySize, overlaySize);

      // Draw logo if possible
      if (logoModules > 0) {
        const logoStartModule = overlayStartModule + marginModules;
        const logoX = (margin + logoStartModule) * scale;
        const logoSize = logoModules * scale;
        ctx.drawImage(logoImage, logoX, logoX, logoSize, logoSize);
        console.log("Logo overlay completed (pixel-perfect)");
      } else {
        console.log("Skipping logo overlay (too small)");
      }

      // Set the qrCodeUrl to the canvas data URL so it shows in the preview
      setQrCodeUrl(canvas.toDataURL());
    } catch (err) {
      console.error("QR generation error:", err);
      setError("Failed to generate QR code. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement("a");
    link.download = "branded-qr-code.png";
    link.href = qrCodeUrl;
    link.click();
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography
        variant="h3"
        component="h1"
        gutterBottom
        align="center"
        sx={{ mb: 4 }}
      >
        myHometown QR Code Generator
      </Typography>

      <Grid container spacing={4} justifyContent="center">
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 3,
                alignItems: "center",
              }}
            >
              <form
                onSubmit={generateQRCode}
                style={{ width: "100%", maxWidth: 500 }}
              >
                <TextField
                  fullWidth
                  label="URL"
                  placeholder="Enter text, URL, or any content..."
                  multiline
                  rows={3}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  variant="outlined"
                  sx={{ mb: 2 }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={isGenerating || !text.trim()}
                  startIcon={
                    isGenerating ? <CircularProgress size={20} /> : null
                  }
                  sx={{ px: 4, width: "100%" }}
                >
                  {isGenerating ? "Generating..." : "Generate Branded QR Code"}
                </Button>
              </form>

              {error && (
                <Alert
                  severity="error"
                  sx={{ mt: 2, width: "100%", maxWidth: 500 }}
                >
                  {error}
                </Alert>
              )}

              <Box
                sx={{
                  minHeight: 300,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px dashed #ccc",
                  borderRadius: 2,
                  mt: 3,
                  p: 3,
                  width: "100%",
                  maxWidth: 450,
                }}
              >
                {qrCodeUrl ? (
                  <img
                    src={qrCodeUrl || "/placeholder.svg"}
                    alt="Generated Branded QR Code"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "100%",
                      borderRadius: "8px",
                    }}
                  />
                ) : (
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    align="center"
                  >
                    {text.trim()
                      ? 'Click "Generate Branded QR Code" to see preview'
                      : "Enter text to generate your branded QR code"}
                  </Typography>
                )}
              </Box>

              {qrCodeUrl && (
                <Button
                  variant="outlined"
                  size="large"
                  onClick={downloadQRCode}
                  sx={{ mt: 2 }}
                >
                  Download QR Code
                </Button>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
