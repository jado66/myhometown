/* eslint-disable react/no-unescaped-entities */
import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

const Footer = () => {
  return (
    <Box>
      <Typography
        sx={{
          textTransform: "uppercase",
          fontWeight: "medium",
        }}
        gutterBottom
        color={"textSecondary"}
        align={"center"}
      >
        Get Started
      </Typography>
      <Box
        component={Typography}
        fontWeight={700}
        variant={"h3"}
        gutterBottom
        align={"center"}
      >
        Get started with myHometown today
      </Box>
      <Typography
        variant={"h6"}
        component={"p"}
        color={"textSecondary"}
        align={"center"}
      >
        Build a beautiful, modern website with flexible, fully customizable,
        atomic Material-UI components.
      </Typography>
    </Box>
  );
};

export default Footer;
