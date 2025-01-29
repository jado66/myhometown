"use client";
import React from "react";
import { Container, Box } from "@mui/material";
import { Typography, Paper } from "@mui/material";
import { Gavel } from "@mui/icons-material";
import { ProjectFormProvider } from "@/contexts/ProjectFormProvider";
import ProjectForm from "./ProjectForm";
import SavingIndicator from "@/components/SavingIndicator";

const ProjectFormPage = () => {
  return (
    <>
      <SavingIndicator />
      <Box
        sx={{
          bgcolor: "#f5f5f5",
          minHeight: "100vh",
          pb: 4,
          width: "100% !important",
        }}
      >
        <Header />
        <Container maxWidth="lg">
          <ProjectForm />
        </Container>
      </Box>
    </>
  );
};

const Header = () => {
  return (
    <Paper
      elevation={3}
      sx={{
        bgcolor: "#1976d2",
        color: "white",
        py: 4,
        mb: 4,
        borderRadius: 0,
        background: "linear-gradient(45deg, #1976d2 30%, #1565c0 90%)",
      }}
    >
      <Container maxWidth="xl" sx={{ mx: "auto" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mb: 2,
            textAlign: "center",
            mx: "auto",
          }}
        >
          <Typography
            variant="h3"
            component="h1"
            sx={{ fontWeight: "bold", width: "100%", textAlign: "center" }}
          >
            Day of Service Project Tracking
          </Typography>
        </Box>

        <Typography variant="body1" sx={{ maxWidth: "800px" }}>
          This system manages the process of documenting, tracking, and
          reporting the progress of a Days of Service Project. Input from
          multiple Days of Service Leaders are compiled to track progress and
          facilitate communication and enable accurate reporting.
        </Typography>
      </Container>
    </Paper>
  );
};

export default ProjectFormPage;
