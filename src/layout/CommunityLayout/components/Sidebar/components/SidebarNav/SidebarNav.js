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
import MyHometownLogo from "@/assets/svg/logos/MyHometown";

const SidebarNav = ({ onClose }) => {
  const [expandCities, setExpandCities] = useState(false);
  const [expandLogin, setExpandLogin] = useState(false);
  const toggleExpandCities = () => setExpandCities((p) => !p);
  const { groupedCityStrings } = useManageCities(null, true);

  const rootUrl = process.env.NEXT_PUBLIC_ENVIRONMENT === "dev" ? "/mht" : "";

  const theme = useTheme();
  const [activeLink, setActiveLink] = useState("");
  useEffect(() => {
    setActiveLink(window && window.location ? window.location.pathname : "");
  }, []);

  let filteredGroupedCityStrings = Object.fromEntries(
    Object.entries(groupedCityStrings)
      .map(([state, cities]) => {
        return [state, cities.sort()];
      })
      .filter(([state, cities]) => cities.length > 0)
  );

  const scrollToWithOffset = (id, yOffset = -100) => {
    const element = document.getElementById(id);

    if (!element) {
      toast.error("Could not find the element to scroll to.");
      return;
    }

    const y =
      element.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: "smooth" });

    setTimeout(() => {
      onClose();
    }, 500);
  };

  return (
    <Box>
      <Box
        display={"flex"}
        justifyContent={"space-between"}
        onClick={() => onClose()}
      >
        <Box
          display={"flex"}
          alignItems="baseline"
          component="a"
          underline="none"
          href={rootUrl + "/"}
          title="myhometown"
          height={{ xs: 28, md: 32 }}
          width={10}
          sx={{ position: "relative", pt: 0, pl: 2 }}
        >
          <MyHometownLogo
            // height="100%"
            sx={{ height: 36 }}
            type="full"
          />
        </Box>
        <IconButton>
          <CloseIcon fontSize="small" color="black" />
        </IconButton>
      </Box>
      <Box paddingX={2} paddingBottom={1} paddingTop={3}>
        <Box>
          <Box marginBottom={2}>
            <Button
              variant="link"
              onClick={(e) => scrollToWithOffset("events", -150)}
              sx={{ ml: 0, pl: 0, my: 0, py: 0 }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  marginBottom: 1,
                  display: "block",
                  textDecoration: "none",
                  color: "black",
                }}
              >
                Events
              </Typography>
            </Button>
          </Box>
          <Box marginBottom={2}>
            <Button
              variant="link"
              onClick={(e) => scrollToWithOffset("crc-classes")}
              sx={{ ml: 0, pl: 0, my: 0, py: 0 }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  marginBottom: 1,
                  display: "block",
                  color: "black",
                }}
              >
                Classes
              </Typography>
            </Button>
          </Box>
        </Box>
        <Box marginBottom={2}>
          <Button
            variant="link"
            onClick={(e) => scrollToWithOffset("volunteer")}
            sx={{ ml: 0, pl: 0, my: 0, py: 0 }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                marginBottom: 1,
                display: "block",
                color: "black",
              }}
            >
              Volunteer
            </Typography>
          </Button>
        </Box>
        <Box marginBottom={2}>
          <Button
            variant="link"
            onClick={() => setExpandLogin((prev) => !prev)}
            sx={{ ml: 0, pl: 0, my: 0, py: 0 }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                marginY: 0,
                mb: 0,
                display: "flex",
                alignItems: "flex-start",
                color: "black",
              }}
            >
              Login
              {expandLogin ? <ExpandLess /> : <ExpandMore />}
            </Typography>
          </Button>
          {expandLogin && (
            <div style={{ marginLeft: "2em" }}>
              <NextLink
                href={rootUrl + "/admin-dashboard"}
                style={{ textDecoration: "none", color: "#686868" }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    marginY: 1,
                    display: "block",
                    color: "black",
                  }}
                >
                  Admin Login
                </Typography>
              </NextLink>
              <NextLink
                href={rootUrl + "/admin-dashboard/classes"}
                style={{ textDecoration: "none", color: "#686868" }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    marginBottom: 1,
                    mt: 1,
                    display: "block",
                    color: "black",
                  }}
                >
                  Teacher Login
                </Typography>
              </NextLink>
            </div>
          )}
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
