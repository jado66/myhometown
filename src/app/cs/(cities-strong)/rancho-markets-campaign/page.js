"use client";
import React from "react";
import {
  Container,
  Typography,
  useTheme,
  useMediaQuery,
  Box,
  Grid,
  Divider,
} from "@mui/material";

import Link from "next/link";
import LoadingImage from "@/components/util/LoadingImage";
import { DonationForm } from "@/components/stripe-components/DonationForm";

const amountOptions = [
  { value: 2.5, label: "$2.50" },
  { value: 5, label: "$5" },
  { value: 10, label: "$10" },
  { value: 25, label: "$25" },
  { value: 50, label: "$50" },

  { value: "custom", label: "Otro" },
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
        <Box marginBottom={2}>
          <Typography
            variant={isMd ? "h2" : "h4"}
            sx={{
              fontWeight: 700,
            }}
            textAlign="center"
          >
            <Typography
              color={"primary"}
              component={"span"}
              variant={"inherit"}
            >
              CITIES STRONG
            </Typography>{" "}
            FOUNDATION{" "}
          </Typography>

          <Typography
            variant={isMd ? "h2" : "h4"}
            sx={{
              fontWeight: 700,
            }}
            textAlign="center"
          >
            <Typography
              color={"primary"}
              component={"span"}
              variant={"inherit"}
            >
              &amp;
            </Typography>{" "}
            <Box
              sx={{
                position: "relative",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Typography
                variant={"inherit"}
                component={"span"}
                sx={{ ml: isMd ? 6 : 2.5 }}
              >
                RANCHO
              </Typography>

              <CustomPngIcon isMd={isMd} />
              <Box sx={{ width: isMd ? "65px" : "35px" }} />
              <Typography variant={"inherit"} component={"span"}>
                MARKETS
              </Typography>
            </Box>
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
          <Typography
            variant={isMd ? "h3" : "h5"}
            sx={{
              fontWeight: 700,
            }}
            textAlign="center"
            mb={3}
          >
            <Typography
              color={"primary"}
              component={"span"}
              variant={"inherit"}
            >
              CONSTRUYENDO
            </Typography>{" "}
            COMUNIDADES JUNTOS
          </Typography>

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
                src="/cities-strong/homepage/thank-you-girl-spanish.webp"
                alt="Thank you"
                height="350px"
                objectPosition={isMd ? "right center" : "center"}
              />
            </Box>
          </Grid>

          <Grid item xs={12} display="flex" flexDirection="column">
            <Typography
              sx={{
                maxWidth: "600px",
                textAlign: "center",
                mx: "auto",
                my: 3,
              }}
            >
              Ayúdanos a construir un futuro mejor para nuestra comunidad.
              Puedes contribuir y apoyar esta gran labor.
            </Typography>
            <DonationForm amountOptions={amountOptions} isMd={isMd} spanish />

            <Typography
              sx={{
                maxWidth: "600px",
                textAlign: "center",
                mx: "auto",
                fontWeight: "bold",
                my: 3,
              }}
            >
              Para donaciones superiores a $1000, por favor contacta a{" "}
              <Link href="mailto:csffinance@citiesstrong.org">
                csffinance@citiesstrong.org
              </Link>
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default Continue;

// CSF REGISTER SIGN
// CITIES STRONG FOUNDATION
// &

// CONSTRUYENDO COMUNIDADES JUNTOS
// Ayudanos a nuestro construyendo mejores para nuestra comunidad, puedes aportar y redondeando el total de tu compra
// Y asi apoyar a esta gran labor
// Más info en
// WWW.CITIESSTRONG.ORG
// BUILDING COMMUNITIES TOGETHER
// DONATION
// Imagine Sign & Graphics
// © 2015 Imagine Sign & Graphics

function CustomPngIcon({ src, isMd, ...props }) {
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        position: "absolute",
        left: "50%", // Position at 50% of the parent container
        transform: "translateX(-50%)", // Shift back by 50% of the element's width
        top: isMd ? "-9px" : "-4px",
        width: isMd ? 85 : 35,
        height: isMd ? 85 : 35,
        backgroundImage: `url("/cities-strong/homepage/shopping-cart.png")`,
        backgroundSize: "contain",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
      {...props}
    />
  );
}
