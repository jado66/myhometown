"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Container, Paper, Grid } from "@mui/material";
import { useEdit } from "@/hooks/use-edit";

const DaysOfServicePage = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { saveData, isDirty, isSaving } = useEdit();
  const [isAtDaysOfService, setIsAtDaysOfService] = useState(false);
  const [isCommunityLevel, setIsCommunityLevel] = useState(false);

  const rootUrl = process.env.NEXT_PUBLIC_ENVIRONMENT === "dev" ? "/mht" : "";

  useEffect(() => {
    // Check if we're at the days-of-service level
    setIsAtDaysOfService(pathname.endsWith("/days-of-service"));

    // Get the part of the path after "edit"
    const editIndex = pathname.indexOf("/edit/");

    if (editIndex !== -1) {
      // Get just the part after "/edit/"
      const pathAfterEdit = pathname.substring(editIndex + 6); // +6 to skip "/edit/"

      // Split the remaining path
      const pathParts = pathAfterEdit.split("/");

      // For debugging - you can remove this later
      console.log("Path parts after edit:", pathParts);

      // If we have exactly 3 parts after edit (state/city/community), we're at community level
      // Example: /edit/utah/dev/dev → pathParts would be ["utah", "dev", "dev"]
      setIsCommunityLevel(pathParts.length === 3);
    } else {
      setIsCommunityLevel(false);
    }
  }, [pathname]);

  const handleBackToCommunity = () => {
    // Go up one level from days-of-service
    router.push(pathname.substring(0, pathname.lastIndexOf("/")));
  };

  const handleGoToDaysOfService = () => {
    // Navigate to days-of-service from community level
    router.push(`${pathname}/days-of-service`);
  };

  return (
    <Box
      display={"flex"}
      justifyContent={"space-between"}
      alignItems={"center"}
      width={"100%"}
      sx={{ flexDirection: { xs: "column", sm: "row" } }}
    >
      <Box display={"flex"} alignItems={"center"} sx={{ flexGrow: 1 }}>
        {isAtDaysOfService && (
          <Button
            startIcon={<ArrowBackIcon />}
            variant="outlined"
            onClick={handleBackToCommunity}
          >
            Back to Community
          </Button>
        )}
      </Box>

      <Box
        display={"flex"}
        alignItems={"center"}
        sx={{
          flexGrow: 1,
          display: {
            xs: "none",
            sm: "block",
          },
        }}
      >
        <Box display={"flex"} justifyContent="center" width="100%">
          <Typography variant="h4" color="primary">
            {isAtDaysOfService ? "Days of Service" : "You Are In Editing Mode"}
          </Typography>
        </Box>
      </Box>

      <Box display="flex" alignItems={"center"}>
        <Box sx={{ display: "flex" }} alignItems={"center"}>
          <Box>
            <Button
              variant="outlined"
              component="a"
              href={rootUrl + "/admin-dashboard"}
              sx={{
                mt: {
                  xs: 1,
                  sm: 0,
                },
              }}
            >
              Admin Dashboard
            </Button>
          </Box>

          {isCommunityLevel ? (
            <Box
              sx={{
                ml: 2,
              }}
            >
              <Button variant="outlined" onClick={handleGoToDaysOfService}>
                Days of Service
              </Button>
            </Box>
          ) : null}

          {!isAtDaysOfService ? (
            <>
              <Box marginX={2}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={saveData}
                  disabled={!isDirty || isSaving}
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </Box>
            </>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
};

export default DaysOfServicePage;
