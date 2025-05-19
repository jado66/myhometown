"use client";
import React, { Suspense } from "react";
import { Grid, Card } from "@mui/material";
import dynamic from "next/dynamic";

const TextLogViewer = dynamic(
  () => import("@/components/texting/logs/TextLogViewer"),
  {
    loading: () => <p>Loading texting logs...</p>,
    ssr: false, // Set to false if the component uses browser-only APIs
  }
);

const TextLogPage = () => {
  return (
    <Grid container item sm={12} display="flex" sx={{ position: "relative" }}>
      <TextLogViewer />
    </Grid>
  );
};

export default TextLogPage;
