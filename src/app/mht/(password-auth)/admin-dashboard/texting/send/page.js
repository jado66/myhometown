"use client";
import React, { Suspense } from "react";
import { Grid, Card } from "@mui/material";
import dynamic from "next/dynamic";

// Dynamically import the BulkMMSMessaging component
const BulkMMSMessaging = dynamic(
  () => import("@/components/texting/send/BulkMmsMessaging"),
  {
    loading: () => <p>Loading messaging interface...</p>,
    ssr: false, // Set to false if the component uses browser-only APIs
  }
);

const SendSMS = () => {
  return (
    <Grid container item sm={12} display="flex" sx={{ position: "relative" }}>
      <BulkMMSMessaging />
    </Grid>
  );
};

export default SendSMS;
