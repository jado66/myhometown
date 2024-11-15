"use client";
import React from "react";
import { Divider } from "@mui/material";
import { Button, Card, Container, Typography, IconButton } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { toast } from "react-toastify";

const FeatureRequestPage = () => {
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Email copied to clipboard!");
    });
  };

  return (
    <Container sx={{ p: 5 }}>
      <Card
        sx={{ py: 5, px: 3, textAlign: "center", maxWidth: "md", mx: "auto" }}
      >
        <Typography variant="h2" component="h1" gutterBottom>
          Have a Feature Request?
        </Typography>
        <Typography variant="subtitle1" sx={{ mb: 5 }}>
          We are always looking to improve our website and your experience. If
          you have any suggestions or feature requests, we would love to hear
          from you!
        </Typography>

        <Divider sx={{ my: 3 }} />
        <Typography variant="h5" component="h1" gutterBottom>
          How to Request a Feature
        </Typography>
        <Typography variant="subtitle1">
          Please send an email to{" "}
          <span style={{ fontWeight: "bold" }}>kcraven10@gmail.com</span>
          <IconButton
            onClick={() => copyToClipboard("kcraven10@gmail.com")}
            sx={{ p: 0.5 }}
          >
            <ContentCopyIcon fontSize="small" />
          </IconButton>
          with a detailed description of the feature you would like to see.
        </Typography>

        <Divider sx={{ mt: 3, mb: 1, mx: 4 }}>
          <Typography variant="body1" sx={{ px: 2 }}>
            OR
          </Typography>
        </Divider>

        <Button
          variant="contained"
          color="primary"
          href="mailto:kcraven10@gmail.com?subject=Website%20Feature%20Request&body=Hi%20Development%20team,%0A%0AI%20would%20like%20to%20request%20a%20feature%20on%20the%20myhometownut.com%20website....%0A%0A(Please%20describe%20the%20feature%20you%20would%20like%20to%20see.)"
          sx={{ mt: 3 }}
        >
          Click Here
        </Button>
      </Card>
    </Container>
  );
};

export default FeatureRequestPage;
