"use client";
import React from "react";
import { Button, Card, Container, Typography, IconButton } from "@mui/material";

import { Divider } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { toast } from "react-toastify";

const BugReportPage = () => {
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
          Having Trouble?
        </Typography>
        <Typography variant="subtitle1" sx={{ mb: 5 }}>
          Thank you for your patience. Our website is currently evolving, and we
          are committed to improving your experience as we continue to grow and
          enhance our features. Your feedback and support are invaluable during
          this exciting journey!{" "}
        </Typography>

        <Divider sx={{ my: 3 }} />
        <Typography variant="h5" component="h1" gutterBottom>
          How to Report a Bug
        </Typography>
        <Typography variant="subtitle1">
          Please send an email to{" "}
          <span style={{ fontWeight: "bold" }}>JD@PlatinumProgramming.com</span>
          <IconButton
            sx={{ p: 0.5 }}
            onClick={() => copyToClipboard("JD@PlatinumProgramming.com")}
          >
            <ContentCopyIcon fontSize="small" />
          </IconButton>{" "}
          with a detailed description of the issue you are experiencing
          including any error messages you may have received.
        </Typography>

        <Divider sx={{ mt: 3, mb: 1, mx: 4 }}>
          <Typography variant="body1" sx={{ px: 2 }}>
            OR
          </Typography>
        </Divider>

        <Button
          variant="contained"
          color="primary"
          href="mailto:jd@platinumprogramming.com?subject=MyHometown%20Bug%20Report&body=Hi%20Development%20team,%0A%0AI%20would%20like%20to%20report%20a%20bug%20on%20the%20myhometownut.com%20website....%0A%0A(Please%20describe%20what%20is%20going%20on.)"
          sx={{ mt: 3 }}
        >
          Click Here
        </Button>
      </Card>
    </Container>
  );
};

export default BugReportPage;
