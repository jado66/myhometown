"use client";
import React, { useState } from "react";
import {
  useTheme,
  Typography,
  Grid,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardMedia,
} from "@mui/material";
import { MyHometownHouse } from "@/assets/svg/logos/MyHometownHouse";
import { styled } from "@mui/system";
import useMediaQuery from "@mui/material/useMediaQuery";

const classes1 = [
  "English as a second language",
  "Computer literacy",
  "Mental health programs",
  "Children's literacy and life skills development",
];
const classes2 = [
  "Art in various forms",
  "Financial management",
  "Fitness and sport programs",
  "Piano, ukelele, and other instrument lessons",
];

const Home = () => {
  return <DaysOfService />;
};

export default Home;

const SvgIconWrapper = styled("div")(({ right }) => ({
  position: "absolute",
  bottom: "16px", // Adjust this value as necessary
  left: right ? "auto" : "16px", // Condition for left positioning
  right: right ? "16px" : "auto", // Condition for right positioning
}));

export const DaysOfService = () => {
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
          src="https://myhometown-bucket.s3.us-west-1.amazonaws.com/videos/CRC+logo.webm"
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
          Leader from myHometown join with community residents and volunteers,
          at large group events, to re-landscape yards and parks, refurbish
          homes, address code violations, and more. It’s common to complete
          10-15 projects in a single day and to repeat these Days of Service
          monthly throughout the spring and summer.n
        </Typography>
      </Grid>
    </>
  );
};
