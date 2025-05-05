"use client";
import React, { Suspense } from "react";
import { Grid, Card } from "@mui/material";
import TextLogViewer from "@/components/texting/logs/TextLogViewer";

const TextLogPage = () => {
  return (
    <Grid container item sm={12} display="flex" sx={{ position: "relative" }}>
      <TextLogViewer />
    </Grid>
  );
};

export default TextLogPage;
