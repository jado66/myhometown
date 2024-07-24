"use client";

import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useTheme } from "@mui/material/styles";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import NextLink from "next/link";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { ExpandLess } from "@mui/icons-material";
import useManageCities from "@/hooks/use-manage-cities";
import { usePathname } from "next/navigation";
import { Divider } from "@mui/material";

const SidebarNav = ({ onClose }) => {
  const theme = useTheme();

  const pathname = usePathname();

  const [activeLink, setActiveLink] = useState(null);

  useEffect(() => {
    if (pathname) {
      if (activeLink === null) {
        setActiveLink(pathname);
      } else if (activeLink !== pathname) {
        setActiveLink(pathname);
        onClose();
      }
    }
  }, [pathname]);

  useEffect(() => {
    setActiveLink(window && window.location ? window.location.pathname : "");
  }, []);

  const rootUrl = process.env.NEXT_PUBLIC_ENVIRONMENT === "dev" ? "/cs" : "";

  return (
    <Box sx={{ position: "relative", textAlign: "center" }}>
      <Box paddingX={2} paddingBottom={1}>
        <Box>
          <Box marginBottom={2}>
            <NextLink
              href={rootUrl + "/"}
              style={{ textDecoration: "none", color: "#686868" }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  mt: 1,
                  display: "block",
                  textDecoration: "none",
                  color: "white",
                  textTransform: "uppercase",
                  pt: "2px",
                }}
              >
                Cities Strong Foundation
              </Typography>
            </NextLink>
          </Box>
          <Divider sx={{ backgroundColor: "white", borderWidth: "3px" }} />
          <Box marginBottom={2}>
            <NextLink
              href={rootUrl + "/about"}
              style={{ textDecoration: "none", color: "#686868" }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  marginTop: 3,
                  display: "block",
                  textDecoration: "none",
                  color: "white",
                }}
              >
                About
              </Typography>
            </NextLink>
          </Box>
          <Box marginBottom={2}>
            <NextLink
              href={rootUrl + "/testimonials"}
              style={{ textDecoration: "none", color: "#686868" }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,

                  display: "block",
                  textDecoration: "none",
                  color: "white",
                }}
              >
                Testimonials
              </Typography>
            </NextLink>
          </Box>
          <Box marginBottom={2}>
            <NextLink
              href={rootUrl + "/contact"}
              style={{ textDecoration: "none", color: "#686868" }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,

                  display: "block",
                  color: "white",
                }}
              >
                Contact
              </Typography>
            </NextLink>
          </Box>
          <Box marginBottom={1}>
            <NextLink
              href={rootUrl + "/donate"}
              style={{ textDecoration: "none", color: "#686868" }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,

                  display: "block",
                  color: "white",
                }}
              >
                Donate
              </Typography>
            </NextLink>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

SidebarNav.propTypes = {
  pages: PropTypes.array.isRequired,
  onClose: PropTypes.func,
};

export default SidebarNav;
