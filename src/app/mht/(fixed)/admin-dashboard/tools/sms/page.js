"use client";
import React from "react";
import { Grid, Card } from "@mui/material";
import BulkMMSMessaging from "./components/BulkMmsMessaging";

const SendSMS = () => {
  return (
    <Grid container item sm={12} display="flex" sx={{ position: "relative" }}>
      <BulkMMSMessaging />
    </Grid>
  );
};

export default SendSMS;
