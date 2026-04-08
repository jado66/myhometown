// pages/project-sheets/[id].js
"use client";
import { ProjectFormProvider } from "@/contexts/ProjectFormProvider";
import { useDaysOfService } from "@/hooks/useDaysOfService";
import { useEffect, useState } from "react";
import ProjectPage from "../../../components/ProjectForm/ProjectPage"; // Adjust the import path as necessary

export default function Page({ params }) {
  const { formId, date, communityId } = params;
  console.log("Params date:", date);

  const [dayOfService, setDayOfService] = useState();
  const { fetchDayOfServiceByShortId } = useDaysOfService();

  useEffect(() => {
    const fetchDays = async () => {
      try {
        const { data, error } = await fetchDayOfServiceByShortId(
          `${communityId}_${date}`
        );

        const parsedData = {
          ...data,
          partner_stakes: data.partner_stakes
            .map((stake) => {
              try {
                return JSON.parse(stake);
              } catch (e) {
                console.error("Error parsing stake:", stake, e);
                return null;
              }
            })
            .filter(Boolean), // Remove any null values from parsing errors
        };

        if (error) throw error;
        setDayOfService(parsedData);
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
        <ProjectPage
          formId={formId}
          date={date}
          communityId={communityId}
          dayOfService={dayOfService}
        />
      </ProjectFormProvider>
    </>
  );
}
