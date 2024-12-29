"use client";

import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import {
  CircularProgress,
  Alert,
  AlertTitle,
  Box,
  Typography,
} from "@mui/material";

const API_BASE_URL = "/api/database/project-forms";

export default function NewProjectPage() {
  const router = useRouter();
  const rootUrl = process.env.NEXT_PUBLIC_ENVIRONMENT === "dev" ? "/mht" : "";

  useEffect(() => {
    const createAndRedirect = async () => {
      try {
        const newId = uuidv4();

        // Wait for 1.5 seconds
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Redirect to the project form page
        router.push(rootUrl + `/days-of-service/project-forms/${newId}`);
      } catch (error) {
        console.error("Error creating new project:", error);
      }
    };

    createAndRedirect();
  }, [router]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      p={4}
      mx="auto"
    >
      <Typography
        variant="h6"
        fullWidth
        sx={{ textAlign: "center", width: "100%" }}
      >
        Creating new project...
      </Typography>
    </Box>
  );
}
