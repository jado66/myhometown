"use client";
import React from "react";
import { Grid, Card } from "@mui/material";
import BulkSimpleTexting from "./components/BulkSimpleTexting";

const SendSMS = () => {
  return (
    <Grid container item sm={12} display="flex" sx={{ position: "relative" }}>
      <BulkSimpleTexting />
    </Grid>
  );
};

export default SendSMS;
