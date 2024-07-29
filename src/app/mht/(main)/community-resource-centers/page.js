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

const classes = [
  "English as a second language",
  "Computer literacy",
  "Children's literacy and life skills development",
  "Piano, ukelele, and other instrument lessons",
  "Art in various forms",
  "Financial management",
  "Fitness and sport programs",
  "Mental health programs",
];

const Home = () => {
  return <CommunityResourceContent />;
};

export default Home;

const SvgIconWrapper = styled("div")(({ right }) => ({
  position: "absolute",
  bottom: "16px", // Adjust this value as necessary
  left: right ? "auto" : "16px", // Condition for left positioning
  right: right ? "16px" : "auto", // Condition for right positioning
}));

export const CommunityResourceContent = () => {
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
          Community Resource Centers
        </Typography>
      </Box>
      <Grid
        item
        xs={12}
        sx={{ padding: 4, pb: 0, display: "flex", flexDirection: "column" }}
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
          src="https://myhometown-bucket.s3.us-west-1.amazonaws.com/videos/CRC+overview+1.webm"
          title="Video 1"
        />
      </Grid>
      <Grid
        item
        xs={12}
        sx={{ padding: 4, display: "flex", flexDirection: "column" }}
      >
        <Typography
          variant="body1"
          sx={{ flexGrow: 1, color: "black", mb: 3, fontSize: "larger" }}
        >
          Our community resource center program uses church meetinghouses or
          other public buildings to provide ongoing educational opportunities—at
          no cost.
        </Typography>

        <Grid item xs={12}>
          <Typography variant="h3" sx={{ color: "black", fontWeight: "bold" }}>
            Weekly classes often include:
          </Typography>
          <List>
            {classes.map((item, index) => (
              <ListItem key={index} sx={{ py: 0 }}>
                <ListItemIcon sx={{ minWidth: 30 }}>
                  <MyHometownHouse fill="#318D43" sx={{ height: "15px" }} />
                </ListItemIcon>
                <ListItemText primary={item} />
              </ListItem>
            ))}
          </List>
        </Grid>
      </Grid>
    </>
  );
};
