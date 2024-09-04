"use client";
import React, { useEffect } from "react";
import {
  Container,
  Typography,
  Grid,
  Box,
  Divider,
  useTheme,
} from "@mui/material";
import useGiveButterScripts from "@/hooks/use-give-butter-scripts";
import { WebsiteTestDonateForm } from "@/constants/give-butter/constants";
import "@/styles/givebutter.css";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { CheckBox } from "@mui/icons-material";
import CitiesStrongLogo from "@/assets/svg/logos/CitiesStrong";
import CitiesStrongShieldIcon from "@/assets/svg/logos/CitiesStrongShieldIcon";
import Link from "next/link";
import { Faq } from "@/views/supportingPages/CitiesStrongContact/components";

const items = [
  "Complete Transparency",
  "Dollars multiplied by thousands of volunteer hours",
  "Real results you can see and feel",
  "Many kinds of projects to fund",
  "Long term sustainability",
  "Able to build strong community relationships",
  "Easy to involve your staff in community projects",
];

const Donate = () => {
  const { isLoaded } = useGiveButterScripts();
  const theme = useTheme();

  return (
    <>
      <Container
        maxWidth="xl"
        sx={{
          mx: "auto",
          pb: "0 !important",
          pt: "50px !important",
        }}
      >
        {" "}
        <Typography
          sx={{
            textTransform: "uppercase",
            fontWeight: "medium",
          }}
          gutterBottom
          mt={2}
        >
          Donate
        </Typography>
        <Box marginBottom={2}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
            }}
          >
            Put your money <br />
            where your
            <Typography
              color={"primary"}
              component={"span"}
              variant={"inherit"}
            >
              {" "}
              heart
            </Typography>{" "}
            is.
          </Typography>
        </Box>
        <Grid
          container
          sx={{
            minHeight: "500px",
            mt: 3,
            justifyContent: "center",
            display: "flex",
            flexDirection: "row",
          }}
        >
          <Grid item xs={12} md={7}>
            <h2>Donating to Cities Strong is good business:</h2>
            <List>
              {items.map((item, index) => (
                <ListItem key={index}>
                  <ListItemIcon sx={{ minWidth: 30 }}>
                    <CitiesStrongShieldIcon size={20} />
                  </ListItemIcon>
                  <ListItemText primary={item} />
                </ListItem>
              ))}
            </List>
          </Grid>

          <Grid item md={5} xs={12}>
            <Grid
              item
              xs={12}
              sx={{
                backgroundColor: "grey",
                height: "350px",
                overflow: "hidden",
                position: "relative",
                boxShadow: "0px 2px 8px 0px rgba(0, 0, 0, 0.5)",
                my: { md: 0, xs: 5 },
              }}
            >
              <img
                src="/cities-strong/homepage/thank-you-girl.webp"
                alt="Thank you"
                // Lazy load the image
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover", // Ensures the image covers the entire area
                  position: "absolute",
                  objectPosition: "right", // Shifts the image to the left
                  top: "0",
                  left: "0px",
                }}
              />
            </Grid>
          </Grid>

          <Grid item xs={12} sx={{ display: { md: "block", xs: "none" } }}>
            <Divider
              sx={{ borderWidth: 3, borderColor: "black", my: 4, mx: 3 }}
            />
          </Grid>
          <Grid item xs={12} display="flex" flexDirection="column">
            <Typography
              sx={{
                maxWidth: "600px",
                textAlign: "center",
                mx: "auto",
                mb: 3,
              }}
            >
              Your tax-deductible donation will help revitalize more
              neighborhoods, provide more educational opportunities, and lift
              more lives.
            </Typography>
            <Box sx={{ mx: "auto" }}>
              <WebsiteTestDonateForm />
            </Box>
            <Typography
              sx={{
                maxWidth: "600px",
                textAlign: "center",
                mx: "auto",
                fontWeight: "bold",
                my: 3,
              }}
            >
              For donations greater than $1000 please contact{" "}
              <Link href="mailto:csffinance@citiesstrong.org">
                csffinance@citiesstrong.org
              </Link>
            </Typography>
          </Grid>
        </Grid>
        <Divider sx={{ borderWidth: 3, mx: 5, mb: 5, borderColor: "black" }} />
        <Box>
          <Container maxWidth={800} pb={"0 !important"}>
            <Faq />
          </Container>
        </Box>
      </Container>
    </>
  );
};

export default Donate;
