"use client";
import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Container,
  Divider,
} from "@mui/material";
import {
  PictureAsPdf,
  Download,
  Visibility,
  Close,
  Description,
} from "@mui/icons-material";

const Financials = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  const documents = [
    {
      id: 1,
      title: "2024 Financial Statement and Auditors Report",
      description:
        "Comprehensive financial statements and independent auditor's report for the fiscal year 2024.",
      pages: 9,
      type: "Financial Statement",
      pdfUrl: "/documents/2024-financial-statement.pdf", // Replace with actual URL
      color: "primary",
    },
    {
      id: 2,
      title: "2024 Tax Return",
      description:
        "Complete tax return filing for the Cities Strong Foundation for tax year 2024.",
      pages: 29,
      type: "Tax Return",
      pdfUrl: "/documents/2024-tax-return.pdf", // Replace with actual URL
      color: "success",
    },
    {
      id: 3,
      title: "IRS Acknowledgment Letter",
      description:
        "Official acknowledgment letter from the Internal Revenue Service confirming tax-exempt status.",
      pages: 1,
      type: "IRS Letter",
      pdfUrl: "/documents/irs-acknowledgment-letter.pdf", // Replace with actual URL
      color: "success",
    },
  ];

  const handleViewDocument = (document) => {
    setSelectedDocument(document);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedDocument(null);
  };

  const handleDownload = (doc) => {
    // Create a temporary link element and trigger download
    const link = document.createElement("a");
    link.href = doc.pdfUrl;
    link.download = `${doc.title.replace(/\s+/g, "-").toLowerCase()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: "bold",
            color: "primary.main",
            textTransform: "uppercase",
          }}
        >
          Financial Documents
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
          Cities Strong Foundation - Transparency & Accountability
        </Typography>
        <Divider sx={{ maxWidth: 200, mx: "auto" }} />
      </Box>

      {/* Documents Grid */}
      <Grid container spacing={3}>
        {documents.map((document) => (
          <Grid item xs={12} md={4} key={document.id}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition:
                  "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 4,
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <PictureAsPdf
                    sx={{
                      fontSize: 40,
                      color: `${document.color}.main`,
                      mr: 1,
                    }}
                  />
                  <Box>
                    <Chip
                      label={document.type}
                      color={document.color}
                      size="small"
                      sx={{ mb: 1 }}
                    />
                    <Typography
                      variant="caption"
                      display="block"
                      color="text.secondary"
                    >
                      {document.pages} page{document.pages > 1 ? "s" : ""}
                    </Typography>
                  </Box>
                </Box>

                <Typography
                  variant="h6"
                  component="h2"
                  gutterBottom
                  sx={{ fontWeight: "bold", lineHeight: 1.3 }}
                >
                  {document.title}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {document.description}
                </Typography>
              </CardContent>

              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                  size="small"
                  variant="contained"
                  color={document.color}
                  startIcon={<Visibility />}
                  onClick={() => handleViewDocument(document)}
                  sx={{ mr: 1 }}
                >
                  View
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color={document.color}
                  startIcon={<Download />}
                  onClick={() => handleDownload(document)}
                >
                  Download
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Document Viewer Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="lg"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            height: "90vh",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pb: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Description sx={{ mr: 1, color: "primary.main" }} />
            <Typography variant="h6" component="span">
              {selectedDocument?.title}
            </Typography>
          </Box>
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{ color: "grey.500" }}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0, height: "100%" }}>
          {selectedDocument && (
            <Box
              sx={{
                width: "100%",
                height: "100%",
                border: "none",
                overflow: "hidden",
              }}
            >
              <iframe
                src={selectedDocument.pdfUrl}
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                }}
                title={selectedDocument.title}
              />
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Footer Note */}
      <Box sx={{ mt: 6, textAlign: "center" }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontStyle: "italic" }}
        >
          All financial documents are provided for transparency and public
          accountability.
          <br />
          For questions regarding these documents, please contact us through our{" "}
          <Box
            component="span"
            sx={{ color: "primary.main", fontWeight: "bold" }}
          >
            Contact
          </Box>{" "}
          page.
        </Typography>
      </Box>
    </Container>
  );
};

export default Financials;
