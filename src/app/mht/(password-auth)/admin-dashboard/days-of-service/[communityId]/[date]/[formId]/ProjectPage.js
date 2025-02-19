"use client";
import React from "react";
import { Container, Box } from "@mui/material";
import { Typography, Paper } from "@mui/material";
import { Gavel } from "@mui/icons-material";
import { ProjectFormProvider } from "@/contexts/ProjectFormProvider";
import ProjectForm from "./ProjectForm";
import SavingIndicator from "@/components/SavingIndicator";
import JsonViewer from "@/components/util/debug/DebugOutput";

const ProjectFormPage = ({ formId, date, communityId }) => {
  return (
    <>
      <SavingIndicator />

      <Box
        id="project-form-page"
        sx={{
          bgcolor: "#f5f5f5",
          pt: 8,
          pb: 4,
          width: "100% !important",
        }}
      >
        <Container maxWidth="lg" sx={{}}>
          <ProjectForm formId={formId} date={date} communityId={communityId} />
        </Container>
      </Box>
    </>
  );
};

export default ProjectFormPage;
