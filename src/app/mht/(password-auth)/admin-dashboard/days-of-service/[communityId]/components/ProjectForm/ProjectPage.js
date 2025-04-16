"use client";
import React from "react";
import { Container, Box } from "@mui/material";

import { useProjectForm } from "@/contexts/ProjectFormProvider";
import ProjectForm from "./ProjectForm";
import SavingIndicator from "@/components/SavingIndicator";
import DosBreadcrumbs from "@/components/days-of-service/DosBreadcrumbs";

const ProjectPage = ({
  formId,
  date,
  communityId,
  dayOfService,
  communityData,
}) => {
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
            px: {
              xs: 0.5,
              sm: 3,
            },
          }}
        >
          <DosBreadcrumbs
            dayOfService={dayOfService}
            date={date}
            stakeId={formData?.partner_stake_id}
            projectName={formData?.project_name}
            sx={{
              bgcolor: "white",
              display: "flex",
              justifyContent: "center",
            }}
            communityData={communityData}
            isProjectView
          />
        </Container>
        <Container
          maxWidth="lg"
          sx={{
            px: {
              xs: 1,
              sm: 3,
            },
          }}
        >
          <ProjectForm formId={formId} date={date} communityId={communityId} />
        </Container>
      </Box>
    </>
  );
};

export default ProjectPage;
