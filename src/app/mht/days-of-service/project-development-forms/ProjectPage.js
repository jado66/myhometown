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
            mx: "auto",
          }}
        >
          <Gavel sx={{ fontSize: 40, mr: 2 }} />
          <Typography variant="h3" component="h1" sx={{ fontWeight: "bold" }}>
            Code Violation Resolution
          </Typography>
        </Box>

        <Box sx={{ ml: 6 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: "normal" }}>
            Days Of Service Enforcement Workflow System
          </Typography>

          <Typography variant="body1" sx={{ maxWidth: "800px" }}>
            This system manages the process of documenting, tracking, and
            resolving property code violations. Input from multiple stakeholders
            including enforcement officers, neighbors, and ward members helps
            ensure fair and effective resolution of violations while providing
            support to homeowners.
          </Typography>
        </Box>
      </Container>
    </Paper>
  );
};

export default ProjectFormPage;
