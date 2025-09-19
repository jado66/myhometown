"use client";
import React, { Suspense } from "react";
import { Grid, Card } from "@mui/material";
import dynamic from "next/dynamic";

// Dynamically import the BulkMMSMessaging component
const DesignHub = dynamic(
  () => import("@/components/texting/send/BulkMmsMessaging"),
  {
    loading: () => <p>Loading messaging interface...</p>,
    ssr: false, // Set to false if the component uses browser-only APIs
  }
);

const DesignHubPage = () => {
  return (
    <Grid container item sm={12} display="flex" sx={{ position: "relative" }}>
      <DesignHub />
    </Grid>
  );
};

export default DesignHubPage;
