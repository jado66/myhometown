"use client";
import React from "react";
import { Container, Box } from "@mui/material";

import { useProjectForm } from "@/contexts/ProjectFormProvider";
import ProjectForm from "./ProjectForm";
import SavingIndicator from "@/components/SavingIndicator";
import DosBreadcrumbs from "@/components/days-of-service/DosBreadcrumbs";
import JsonViewer from "@/components/util/debug/DebugOutput";

const ProjectFormPage = ({ formId, date, communityId, dayOfService }) => {
  const { formData } = useProjectForm();

  return (
    <>
      <SavingIndicator />

      <Box
        id="project-form-page"
        sx={{
          bgcolor: "#f5f5f5",

          pb: 4,
          width: "100% !important",
        }}
      >
        <Container
          maxWidth="lg"
          sx={{
            pt: 6,
          }}
        >
          <DosBreadcrumbs
            dayOfService={dayOfService}
            date={date}
            projectName={formData?.project_name}
            sx={{
              bgcolor: "white",
              display: "flex",
              justifyContent: "center",
            }}
            isProjectView
          />
        </Container>
        <Container maxWidth="lg" sx={{}}>
          <ProjectForm formId={formId} date={date} communityId={communityId} />
        </Container>
      </Box>
    </>
  );
};

export default ProjectFormPage;
