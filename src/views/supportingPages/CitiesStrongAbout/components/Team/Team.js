"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import ListItemText from "@mui/material/ListItemText";
import Avatar from "@mui/material/Avatar";

import {
  boardOfDirectors,
  executiveCommittee,
} from "@/constants/boardOfDirectors";
import { Divider } from "@mui/material";
import { useRouter } from "next/navigation";

const Team = () => {
  const theme = useTheme();
  const router = useRouter();

  const goToBios = (name) => {
    const rootUrl = process.env.NEXT_PUBLIC_ENVIRONMENT === "dev" ? "/cs" : "";

    const url = `${rootUrl}/bios#bio-${name
      .replace(/\s+/g, "-")
      .toLowerCase()}`;
    router.push(url);
  };

  return (
    <Box>
      {/* <Divider sx = {{width:"100%", mb:4}} /> */}
      <Divider sx={{ borderWidth: 3, mb: 4, borderColor: "black" }} />

      <Box marginBottom={4}>
        <Typography
          sx={{
            textTransform: "uppercase",
            fontWeight: "medium",
          }}
          gutterBottom
          align={"center"}
        >
          Our team
        </Typography>
        <Box
          component={Typography}
          fontWeight={700}
          variant={"h3"}
          align={"center"}
        >
          Executive Committee
        </Box>
      </Box>

      <Grid container spacing={1} justifyContent="center">
        {executiveCommittee.map((item, i) => (
          <Grid item sm={6} md={3} key={i}>
            <Box
              component={Card}
              borderRadius={3}
              boxShadow={2}
              onClick={() => goToBios(item.name)}
              sx={{
                cursor: "pointer",
                // border:'1px solid lightgrey',
                backgroundColor: "#fafafa", //theme.palette.background.level2,
                boxShadow: "none",
                textDecoration: "none",
                transition: "all .2s ease-in-out",
                "&:hover": {
                  transform: `translateY(-${theme.spacing(1 / 2)})`,
                },
              }}
            >
              <CardContent
                sx={{ display: "flex", flexDirection: "column", p: 1 }}
              >
                <Box
                  component="img"
                  src={item.avatar}
                  height={160}
                  width={160}
                  variant="square"
                  sx={{
                    mx: "auto",
                    borderRadius: 1.5,
                    boxShadow: "0px 2px 8px 0px rgba(0, 0, 0, 0.5)",
                  }}
                />
                <Box marginTop={1}>
                  <ListItemText
                    primaryTypographyProps={{ textAlign: "center" }}
                    secondaryTypographyProps={{
                      color: "black",
                      textAlign: "center",
                    }}
                    primary={item.name}
                    secondary={item.position}
                  />
                </Box>
              </CardContent>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Divider
        sx={{
          width: { sm: "60%", xs: "80%" },
          borderWidth: 2,
          mt: 0,
          mb: 0,
          mx: "auto",
          borderColor: "black",
        }}
      />

      <Box marginBottom={4}>
        <Box
          component={Typography}
          fontWeight={700}
          sx={{ mt: 4 }}
          variant={"h3"}
          align={"center"}
        >
          Board of Directors
        </Box>
      </Box>

      <Grid container spacing={1} justifyContent="center">
        {boardOfDirectors.map((item, i) => (
          <Grid item sm={6} md={3} key={i}>
            <Box
              component={Card}
              borderRadius={3}
              boxShadow={2}
              onClick={() => goToBios(item.name)}
              sx={{
                cursor: "pointer",

                // border:'1px solid lightgrey',
                backgroundColor: "#fafafa", //theme.palette.background.level2,
                boxShadow: "none",
                textDecoration: "none",
                transition: "all .2s ease-in-out",
                "&:hover": {
                  transform: `translateY(-${theme.spacing(1 / 2)})`,
                },
              }}
            >
              <CardContent
                sx={{ display: "flex", flexDirection: "column", p: 1 }}
              >
                <Box
                  component="img"
                  src={item.avatar}
                  height={160}
                  width={160}
                  variant="square"
                  sx={{
                    mx: "auto",
                    borderRadius: 1.5,
                    boxShadow: "0px 2px 8px 0px rgba(0, 0, 0, 0.5)",
                  }}
                />
                <Box marginTop={1}>
                  <ListItemText
                    primaryTypographyProps={{ textAlign: "center" }}
                    secondaryTypographyProps={{
                      color: "black",
                      textAlign: "center",
                    }}
                    primary={item.name}
                  />
                </Box>
              </CardContent>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Team;
