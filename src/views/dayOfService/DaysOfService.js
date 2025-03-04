"use client";
import React, { useState } from "react";
import { useTheme, Typography, Grid, Box } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";

export const DaysOfServiceContent = () => {
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
          poster="https://myhometown-bucket.s3.us-west-1.amazonaws.com/uploads/DOS_Thumbnail.webp"
          sx={{
            mx: "auto",
            width: "50%",
            height: "50%",
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
          We're here to breathe new life into the community. We'll re-landscape
          yards and parks, refurbish homes, repaint fences, fix code violations
          and more. If there's a need, we're here to help.
        </Typography>
      </Grid>
    </>
  );
};
