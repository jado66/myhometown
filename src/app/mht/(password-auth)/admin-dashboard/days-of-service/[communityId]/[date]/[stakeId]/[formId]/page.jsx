// pages/project-sheets/[id].js
"use client";
import { ProjectFormProvider } from "@/contexts/ProjectFormProvider";
import ProjectFormsPage from "./ProjectPage";
import { useDaysOfService } from "@/hooks/useDaysOfService";
import { useEffect, useState } from "react";

export default function ProjectPage({ params }) {
  const { formId, date, communityId } = params;

  const [dayOfService, setDayOfService] = useState();
  const { fetchDayOfServiceByShortId } = useDaysOfService();

  useEffect(() => {
    const fetchDays = async () => {
      try {
        const { data, error } = await fetchDayOfServiceByShortId(
          `${communityId}_${date}`
        );

        if (error) throw error;
        setDayOfService(data);
      } catch (error) {
        console.error("Error fetching days of service:", error);
      }
    };

    fetchDays();
  }, [communityId, date]);

  return (
    <>
      <ProjectFormProvider
        formId={formId}
        date={date}
        communityId={communityId}
        dayOfService={dayOfService}
      >
        <ProjectFormsPage
          formId={formId}
          date={date}
          communityId={communityId}
          dayOfService={dayOfService}
        />
      </ProjectFormProvider>
    </>
  );
}
