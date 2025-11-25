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
import { useCommunityList } from "@/hooks/useCommunityList";
import Link from "next/link";

const SidebarNav = ({ onClose }) => {
  const { communities } = useCommunityList();

  const [expandCities, setExpandCities] = useState(false);
  const [expandLogin, setExpandLogin] = useState(false);

  const toggleExpandCities = () => setExpandCities((p) => !p);
  const { groupedCityStrings } = useManageCities(null, true);

  const rootUrl = process.env.NEXT_PUBLIC_ENVIRONMENT === "dev" ? "/mht" : "";

  const theme = useTheme();
  const [activeLink, setActiveLink] = useState("");

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
              onClick={() => {
                scrollToWithOffset("maps");
              }}
              sx={{ textDecoration: "none", color: "#686868", px: 0 }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  marginBottom: 0,
                  display: "block",
                  textDecoration: "none",
                  color: "black",
                }}
              >
                Find My Nearest Center
              </Typography>
            </Button>
          </Box>
          <Box marginBottom={2}>
            <Button
              variant="link"
              onClick={toggleExpandCities}
              sx={{ ml: 0, pl: 0 }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  marginBottom: 1,
                  mb: 0,
                  display: "flex",
                  alignItems: "flex-start",
                  color: "black",
                }}
              >
                Communities
                {expandCities ? <ExpandLess /> : <ExpandMore />}
              </Typography>
            </Button>
            {expandCities &&
              communities.map((community, index) => (
                <Link
                  style={{
                    color: "black",
                    fontWeight: "bold",
                    textDecoration: "none",
                    "&:hover": {
                      color: "#3A3B3C",
                    },
                  }}
                  href={
                    rootUrl + "/utah/" + community.href.replace(/^\.\//, "")
                  }
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      marginBottom: 1,
                      my: 1,
                      display: "block",
                      color: "black",
                      marginLeft: 2,
                    }}
                  >
                    {community.title} Community
                  </Typography>
                </Link>
              ))}
          </Box>
        </Box>

        <Box marginBottom={2}>
          <Button
            variant="link"
            onClick={() => setExpandLogin((prev) => !prev)}
            sx={{ ml: 0, pl: 0 }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                marginBottom: 1,
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
              <NextLink
                href={rootUrl + "/admin-dashboard/log-hours"}
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
                  Missionary Login
                </Typography>
              </NextLink>
              <NextLink
                href={rootUrl + "/admin-dashboard/volunteer-hours"}
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
                  Volunteer Login
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
