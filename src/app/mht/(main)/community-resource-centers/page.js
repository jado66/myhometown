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

const CommunityResourceCenterPage = () => {
  return <CommunityResourceContent />;
};

export default CommunityResourceCenterPage;

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

const CommunityResourceContent = () => {
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
          Community Resource Centers
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
          Our Community Resource Centers use church meetinghouses or other
          public buildings to provide ongoing educational opportunities— at no
          cost.
        </Typography>

        <Typography variant="h3" sx={{ color: "black", fontWeight: "bold" }}>
          Weekly classes often include:
        </Typography>

        {/* Add a container Grid here */}
        <Grid container spacing={2}>
          {isMd ? (
            <>
              <Grid item xs={12} sm={6}>
                <List sx={{ mb: 0 }}>
                  {classes1.map((item, index) => (
                    <ListItem
                      key={index}
                      sx={{ py: 0, display: "flex", alignItems: "flex-start" }}
                    >
                      <ListItemIcon sx={{ minWidth: 30, pt: 1 }}>
                        <MyHometownHouse
                          fill="#318D43"
                          sx={{ height: "15px" }}
                        />
                      </ListItemIcon>
                      <ListItemText primary={item} />
                    </ListItem>
                  ))}
                </List>
              </Grid>
              <Grid item xs={12} sm={6}>
                <List>
                  {classes2.map((item, index) => (
                    <ListItem
                      key={index}
                      sx={{ py: 0, display: "flex", alignItems: "flex-start" }}
                    >
                      <ListItemIcon sx={{ minWidth: 30, pt: 1 }}>
                        <MyHometownHouse
                          fill="#318D43"
                          sx={{ height: "15px" }}
                        />
                      </ListItemIcon>
                      <ListItemText primary={item} />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </>
          ) : (
            <Grid item xs={12} sm={6}>
              <List sx={{ mb: 0 }}>
                {[...classes1, ...classes2].map((item, index) => (
                  <ListItem
                    key={index}
                    sx={{ py: 0, display: "flex", alignItems: "flex-start" }}
                  >
                    <ListItemIcon sx={{ minWidth: 30, pt: 1 }}>
                      <MyHometownHouse fill="#318D43" sx={{ height: "15px" }} />
                    </ListItemIcon>
                    <ListItemText primary={item} />
                  </ListItem>
                ))}
              </List>
            </Grid>
          )}
        </Grid>
      </Grid>
    </>
  );
};
