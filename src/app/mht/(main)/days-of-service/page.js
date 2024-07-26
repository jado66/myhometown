"use client";
import React, { useState } from "react";
import { useTheme, Typography, Grid, Box } from "@mui/material";

const Home = () => {
  const theme = useTheme();

  return (
    <>
      <Box sx={{ width: "100%" }}>
        <Typography
          variant="h2"
          textAlign={"center"}
          color="black"
          sx={{
            mt: 3,
            mb: 0,
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
        sx={{ padding: 4, display: "flex", flexDirection: "column" }}
      >
        <Typography variant="body1" sx={{ flexGrow: 1, color: "black" }}>
          My Hometown leaders join with community residents and volunteers at
          large group events to re-landscape yards and parks, refurbish homes,
          address code violations and more. It’s common to do 10-15 projects in
          a single day and to repeat these 6 days each year.
        </Typography>
      </Grid>
    </>
  );
};

export default Home;
