"use client";
import React, { Suspense } from "react";
import { Grid, Card } from "@mui/material";
import { TextBatchViewer } from "@/components/texting/logs/SimplifiedTextLogViewer";

const TextLogPage = () => {
  return (
    <Grid container item sm={12} display="flex" sx={{ position: "relative" }}>
      <TextBatchViewer />
    </Grid>
  );
};

export default TextLogPage;
