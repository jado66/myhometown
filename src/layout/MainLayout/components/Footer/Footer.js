import React from "react";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import MyHometownLogo from "@/assets/svg/logos/MyHometown";

const Footer = () => {
  const rootUrl = process.env.NEXT_PUBLIC_ENVIRONMENT === "dev" ? "/mht" : "";

  return (
    <Grid
      container
      spacing={2}
      display="flex"
      alignItems="center"
      textAlign="center"
      sx={{ px: { md: 5, sx: 0 } }}
    >
      <Grid item md={4} xs={12} sx={{ order: { md: 1, xs: 1 } }}>
        <MyHometownLogo height={"100%"} width={"100%"} type="dark-full" />
      </Grid>
      <Grid item md={4} xs={12} sx={{ order: { md: 2, xs: 3 } }}>
        <Typography
          align={"center"}
          variant={"subtitle2"}
          color="textSecondary"
        >
          Copyright ©{` 2023 - ${new Date().getFullYear()}`} myHometown Utah
        </Typography>
      </Grid>
      <Grid item md={4} xs={12} sx={{ order: { md: 2, xs: 3 } }}>
        <Typography align={"center"} variant={"subtitle2"}>
          <a
            href="https://www.platinumprogramming.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            Powered by Platinum Programming
          </a>
        </Typography>
      </Grid>
    </Grid>
  );
};

export default Footer;
