"use client";

import type React from "react";

import { useState, useRef } from "react";
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
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const hardcodedOptions = {
    size: 400,
    foregroundColor: "#318d43", // Dark green for brand
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

      // Get QR code module count for pixel-perfect overlay
      const qrObj = QRCode.create(text, {
        errorCorrectionLevel: hardcodedOptions.errorCorrectionLevel,
      });
      const moduleCount = qrObj.modules.size;
      const moduleSize = hardcodedOptions.size / moduleCount;

      const qrOptions = {
        width: hardcodedOptions.size,
        margin: hardcodedOptions.margin,
        color: {
          dark: hardcodedOptions.foregroundColor,
          light: hardcodedOptions.backgroundColor,
        },
        errorCorrectionLevel: hardcodedOptions.errorCorrectionLevel,
      };

      const qrDataUrl = await QRCode.toDataURL(text, qrOptions);
      console.log("QR code base generated successfully");

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Could not get canvas context");
      }

      canvas.width = hardcodedOptions.size;
      canvas.height = hardcodedOptions.size;

      // Load QR code image
      const qrImage = new Image();
      qrImage.crossOrigin = "anonymous";

      await new Promise((resolve, reject) => {
        qrImage.onload = resolve;
        qrImage.onerror = reject;
        qrImage.src = qrDataUrl;
      });

      // Draw QR code
      ctx.drawImage(
        qrImage,
        0,
        0,
        hardcodedOptions.size,
        hardcodedOptions.size
      );
      console.log("QR code drawn on canvas");

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

      // Pixel-perfect overlay: make overlay size and margin integer multiples of moduleSize
      const logoModules = Math.floor(moduleCount * 0.18); // logo covers ~18% of QR width
      const marginModules = 2; // margin of 2 modules around logo
      const overlayModules = logoModules + marginModules * 2;
      const overlaySize = overlayModules * moduleSize;
      const overlayX = (hardcodedOptions.size - overlaySize) / 2;
      const overlayY = (hardcodedOptions.size - overlaySize) / 2;
      const logoSize = logoModules * moduleSize;
      const logoX = (hardcodedOptions.size - logoSize) / 2;
      const logoY = (hardcodedOptions.size - logoSize) / 2;

      // Draw white square background for logo (pixel-perfect)
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(overlayX, overlayY, overlaySize, overlaySize);

      // Draw logo
      ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);
      console.log("Logo overlay completed (pixel-perfect)");
      // Set the qrCodeUrl to the canvas data URL so it shows in the preview
      setQrCodeUrl(canvas.toDataURL());
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
        Branded QR Code Generator
      </Typography>

      <Grid container spacing={4} justifyContent="center">
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom align="center">
              Create Your Branded QR Code
            </Typography>

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
                  label="Text or URL"
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
                  Download Branded QR Code
                </Button>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          Generate custom branded QR codes with your logo automatically
          centered. Perfect for business cards, marketing materials, and digital
          campaigns.
        </Typography>
      </Box>
    </Container>
  );
}
