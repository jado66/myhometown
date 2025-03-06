"use client";
import React from "react";
import {
  Container,
  Typography,
  Grid,
  Box,
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import CitiesStrongShieldIcon from "@/assets/svg/logos/CitiesStrongShieldIcon";
import Link from "next/link";
import { Faq } from "@/views/supportingPages/CitiesStrongContact/components";
import LoadingImage from "@/components/util/LoadingImage";
import { DonationForm } from "./DonationForm";

const items = [
  "Complete Transparency",
  "Dollars multiplied by thousands of volunteer hours",
  "Real results you can see and feel",
  "A wide range of projects to fund",
  "Organizations carefully chosen for effectiveness",
  "Long term sustainability",
  "Able to build strong community relationships",
  "Easy to involve your staff or family in community projects",
];

const Continue = () => {
  const theme = useTheme();
  const isMd = useMediaQuery(theme.breakpoints.up("md"));

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
        <Typography
          sx={{
            textTransform: "uppercase",
            fontWeight: "medium",
          }}
          gutterBottom
          mt={2}
        >
          Continue
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
            <Box
              sx={{
                height: "350px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                my: { md: 0, xs: 5 },
              }}
            >
              <LoadingImage
                src="/cities-strong/homepage/thank-you-girl.webp"
                alt="Thank you"
                height="350px"
                objectPosition={isMd ? "right center" : "center"}
              />
            </Box>
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

            {/* Stripe Elements wrapper */}
            <DonationForm />

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

export default Continue;
