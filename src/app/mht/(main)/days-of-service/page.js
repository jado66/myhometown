"use client";
import React, { useState } from "react";
import { useTheme, Typography, Grid, Box } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";

const DaysOfServicePage = () => {
  return <DaysOfServiceContent />;
};

export default DaysOfServicePage;

const DaysOfServiceContent = () => {
  const theme = useTheme();
  const isMd = useMediaQuery(theme.breakpoints.up("md"));

  return (
    <>
      <Box sx={{ width: "100%" }}>
        <Typography
          variant="h2"
          textAlign={"center"}
          color="black"
          sx={{
            mt: 3,
            mb: { md: 0, xs: 3 },
            mx: "auto",
            fontWeight: 700,
          }}
        >
          Days of Service
        </Typography>
      </Box>
      <Grid
        item
        xs={12}
        sx={{
          padding: { md: 4, xs: 3 },
          pb: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          component="video"
          controls
          playsInline
          poster="https://myhometown-bucket.s3.us-west-1.amazonaws.com/videos/grad.webp"
          sx={{
            mx: "auto",
            width: "100%",
            height: "100%",
            borderRadius: "12px",
          }}
          src="https://myhometown-bucket.s3.us-west-1.amazonaws.com/videos/Days+of+Service+(Hey)+.webm"
          title="Video 1"
        />
      </Grid>
      <Grid
        item
        xs={12}
        sx={{ padding: 4, pt: 1, display: "flex", flexDirection: "column" }}
      >
        <Typography
          variant="body1"
          sx={{ flexGrow: 1, color: "black", mb: 3, fontSize: "larger" }}
        >
          Leaders from myHometown join with community residents and volunteers
          at large group events to re-landscape yards and parks, refurbish
          homes, address code violations, and more. It's not unusual to complete
          10-15 projects in a single day and to repeat these Days of Service
          monthly throughout the spring and summer.
        </Typography>
      </Grid>
    </>
  );
};
