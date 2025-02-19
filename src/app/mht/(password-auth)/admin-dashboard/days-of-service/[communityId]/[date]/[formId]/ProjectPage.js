"use client";
import React, { useEffect, useState } from "react";
import { Container, Box } from "@mui/material";
import { Typography, Paper } from "@mui/material";
import { Gavel } from "@mui/icons-material";
import {
  ProjectFormProvider,
  useProjectForm,
} from "@/contexts/ProjectFormProvider";
import ProjectForm from "./ProjectForm";
import SavingIndicator from "@/components/SavingIndicator";
import JsonViewer from "@/components/util/debug/DebugOutput";
import { useDaysOfService } from "@/hooks/useDaysOfService";
import DosBreadcrumbs from "@/components/days-of-service/DosBreadcrumbs";

const ProjectFormPage = ({ formId, date, communityId }) => {
  const [dayOfService, setDayOfService] = useState(null);
  const { fetchDayOfService } = useDaysOfService();

  const { formData } = useProjectForm();

  useEffect(() => {
    const fetchDays = async () => {
      try {
        const { data, error } = await fetchDayOfService(
          `${communityId}_${date}`
        );

        if (error) throw error;
        setDayOfService(data);

        setDaysOfServiceLoading(false);
      } catch (error) {
        console.error("Error fetching days of service:", error);
      }
    };

    fetchDays();
  }, [communityId, date]);

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
            date="03-31-2025"
            projectName={formData?.project_name}
            sx={{
              bgcolor: "white",
              display: "flex",
              justifyContent: "center",
            }}
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
