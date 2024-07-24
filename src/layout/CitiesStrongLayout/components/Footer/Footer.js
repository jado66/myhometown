import React from "react";
import Grid from "@mui/material/Grid";
import { Box, Divider, Typography, useTheme } from "@mui/material";
import Link from "next/link";
import { Instagram, LinkedIn, YouTube } from "@mui/icons-material";
import Twitter from "@mui/icons-material/Twitter";
import { styled } from "@mui/system";
import CitiesStrongShieldIcon from "@/assets/svg/logos/CitiesStrongShieldIcon";
import CitiesStrongHorizontalLogo from "@/assets/svg/logos/CitiesStrongHorizontalLogo";
import useMediaQuery from "@mui/material/useMediaQuery";
import dynamic from "next/dynamic";

const Footer = () => {
  const theme = useTheme();

  return (
    <Grid xs={12}>
      <DynamicFooterContent />
      <Grid container spacing={2} mt={0.5} mb={5} px={4}>
        <CitiesStrongHorizontalLogo />
      </Grid>
      <Checkerboard />
    </Grid>
  );
};

const FooterContent = () => {
  const theme = useTheme();
  const isMd = useMediaQuery(theme.breakpoints.up("md"));

  return (
    <Grid container spacing={2} mt={3} px={4}>
      {isMd ? (
        <>
          <DesktopColumn
            href1="/contact"
            text1="Contact"
            href2="/donate"
            text2="Donate"
          />
          <DesktopColumn
            href1="/about"
            text1="About"
            href2="/testimonials"
            text2="Testimonials"
          />
          <DesktopColumn
            href1="/terms-of-use"
            text1="Terms Of Use"
            href2="/privacy-policy"
            text2="Privacy Policy"
          />
        </>
      ) : (
        <>
          <MobileColumn
            href1="/contact"
            text1="Contact"
            href2="/donate"
            text2="Donate"
            href3="/about"
            text3="About"
          />
          <MobileColumn
            href1="/testimonials"
            text1="Testimonials"
            href2="/terms-of-use"
            text2="Terms Of Use"
            href3="/privacy-policy"
            text3="Privacy Policy"
          />
        </>
      )}
    </Grid>
  );
};

const DynamicFooterContent = dynamic(() => Promise.resolve(FooterContent), {
  ssr: false,
});

const DesktopColumn = ({ href1, text1, href2, text2 }) => (
  <Grid item xs={4} sx={{ pX: 0 }} display="flex" flexDirection="column">
    <Divider sx={{ borderWidth: 3, borderColor: "black", mb: 2 }} />
    <FooterLink href={href1}>
      <Typography sx={{ textTransform: "uppercase" }}>{text1}</Typography>
    </FooterLink>
    <FooterLink href={href2}>
      <Typography sx={{ textTransform: "uppercase" }}>{text2}</Typography>
    </FooterLink>
    <Grid sx={{ flex: 1 }} />
    <Divider sx={{ borderWidth: 3, borderColor: "black", my: 2 }} />
  </Grid>
);

const MobileColumn = ({ href1, text1, href2, text2, href3, text3 }) => (
  <Grid item xs={6} sx={{ pX: 0 }} display="flex" flexDirection="column">
    <Divider sx={{ borderWidth: 3, borderColor: "black", mb: 2 }} />
    <FooterLink href={href1}>
      <Typography sx={{ textTransform: "uppercase" }}>{text1}</Typography>
    </FooterLink>
    <FooterLink href={href2}>
      <Typography sx={{ textTransform: "uppercase" }}>{text2}</Typography>
    </FooterLink>
    <FooterLink href={href3}>
      <Typography sx={{ textTransform: "uppercase" }}>{text3}</Typography>
    </FooterLink>
    <Grid sx={{ flex: 1 }} />
    <Divider sx={{ borderWidth: 3, borderColor: "black", my: 2 }} />
  </Grid>
);

export default Footer;

const FooterLink = styled(Link)({
  textTransform: "uppercase",
  color: "black",
  textDecoration: "none",
});

const Checkerboard = () => {
  const rows = 5;
  const cols = 6;

  return (
    <Grid container sx={{ height: "200px" }}>
      {[...Array(rows * cols)].map((_, i) => (
        <Grid
          item
          xs={2}
          key={i}
          sx={{
            height: "40px",
            backgroundColor:
              (i + Math.floor(i / cols)) % 2 === 0 ? "green" : "darkgreen",
          }}
        />
      ))}
    </Grid>
  );
};
