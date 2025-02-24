"use client";

import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useRouter, useSearchParams } from "next/navigation";
import { CircularProgress, Box, Typography } from "@mui/material";
import { useDaysOfServiceProjectForm } from "@/hooks/useDaysOfServiceProjectForms";
import { useDaysOfServiceProjects } from "@/hooks/useDaysOfServiceProjects";
import { useUser } from "@/hooks/use-user";
import { useDaysOfService } from "@/hooks/useDaysOfService";
import { toast } from "react-toastify";

interface NewProjectPageProps {
  params: {
    date: string;
    communityId: string;
  };
}

export default function NewProjectPage({ params }: NewProjectPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rootUrl = process.env.NEXT_PUBLIC_DOMAIN;

  const { user } = useUser();

  const { date, communityId: community_id } = params;
  const city_id = searchParams.get("cityId");

  const days_of_service_id = `${community_id}_${date}`;

  const { addProject } = useDaysOfServiceProjects();
  const { fetchDayOfServiceByShortId } = useDaysOfService();

  useEffect(() => {
    const createAndRedirect = async () => {
      let daysOfService = await fetchDayOfServiceByShortId(days_of_service_id);

      if (daysOfService.error) {
        console.error("Error fetching days of service:", daysOfService.error);
        toast.error("Failed to fetch days of service");
        return;
      }

      try {
        if (!city_id) {
          throw new Error("City ID is required");
        }

        const newId = uuidv4();
        await addProject(
          newId,
          community_id,
          city_id,
          days_of_service_id,
          user
        );

        // Wait for 1.5 seconds
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Redirect to the project form page with all necessary IDs
        router.push(
          `${rootUrl}/admin-dashboard/days-of-service/${community_id}/${date}/${newId}`
        );
      } catch (error) {
        console.error("Error creating new project:", error);
      }
    };

    createAndRedirect();
  }, [router, days_of_service_id, community_id, city_id, rootUrl]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      p={4}
      mx="auto"
      gap={2}
    >
      <CircularProgress size={40} />
      <Typography variant="h6" sx={{ textAlign: "center" }}>
        Creating new project...
      </Typography>
    </Box>
  );
}
