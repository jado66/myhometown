"use client";

import React, { useCallback, useState, useTransition } from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Menu from "@mui/material/Menu";
import Link from "@mui/material/Link";
import { useTheme } from "@mui/material/styles";
import { MenuItem, TextField, Typography, Button } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Divider from "@mui/material/Divider";
import MyHometownLogo from "@/assets/svg/logos/MyHometown";
import useManageCities from "@/hooks/use-manage-cities";
import LanguageIcon from "@mui/icons-material/Language";
import { ExpandLess, Translate } from "@mui/icons-material";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { cityStrings } from "@/constants/cities";
import { toast } from "react-toastify";

const Topbar = ({ onSidebarOpen }) => {
  const { groupedCityStrings } = useManageCities(null, true);

  const pathname = usePathname();
  const isOnDaysOfServicePage =
    pathname && pathname.endsWith("/days-of-service");

  const [citiesAnchorEl, setCitiesAnchorEl] = useState(null);
  const [resourcesAnchorEl, setResourcesAnchorEl] = useState(null);

  const [search, setSearch] = useState("");

  const rootUrl = process.env.NEXT_PUBLIC_ENVIRONMENT === "dev" ? "/mht" : "";

  const handleCitiesClick = (event) => {
    setCitiesAnchorEl(event.currentTarget);
  };

  const handleResourcesClick = (event) => {
    setResourcesAnchorEl(event.currentTarget);
  };

  const handleCitiesClose = () => {
    setCitiesAnchorEl(null);
  };

  const handleResourcesClose = () => {
    setResourcesAnchorEl(null);
  };

  const handleSearch = (event) => {
    setSearch(event.target.value);
    event.stopPropagation();
  };

  const scrollToWithOffset = (id, yOffset = -100) => {
    const element = document.getElementById(id);

    if (!element) {
      toast.error("Could not find the element to scroll to.");
      return;
    }

    const y =
      element.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  const handleNavigation = (id, yOffset) => {
    if (isOnDaysOfServicePage) {
      // If on the days-of-service page, navigate to parent path with hash
      const parentPath = pathname.substring(0, pathname.lastIndexOf("/"));

      window.location.href = `${parentPath}/#${id}`;
    } else {
      // If not on days-of-service page, use scroll function
      scrollToWithOffset(id, yOffset);
      window.location.href = `#${id}`;
    }
  };

  const getDaysOfServiceUrl = () => {
    // Check if the current path already ends with /days-of-service
    if (pathname && pathname.endsWith("/days-of-service")) {
      return pathname;
    }

    // Otherwise, append /days-of-service to the current path
    return `${pathname || ""}${
      pathname && !pathname.endsWith("/") ? "/" : ""
    }days-of-service`;
  };

  let filteredGroupedCityStrings = Object.fromEntries(
    Object.entries(groupedCityStrings)
      .map(([state, cities]) => {
        return [
          state,
          cities
            .filter((city) => city.toLowerCase().includes(search.toLowerCase()))
            .sort(),
        ];
      })
      .filter(([state, cities]) => cities.length > 0)
  );

  const theme = useTheme();

  return (
    <Box
      display={"flex"}
      justifyContent={"space-between"}
      alignItems={"center"}
      width={"100%"}
      sx={{ position: "position" }}
    >
      <Box
        display={"flex"}
        alignItems={"center"}
        sx={{ flexGrow: 1, justifyContent: "space-between" }}
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
          sx={{ position: "relative", mb: "8px" }}
        >
          <MyHometownLogo
            // height="100%"
            sx={{ height: 36 }}
            type="full"
          />
        </Box>

        <Box
          marginRight={{ xs: -6, sm: 2 }}
          sx={{ display: { xs: "flex", md: "none" } }}
        >
          <IconButton aria-label="Menu" onClick={onSidebarOpen}>
            <MenuIcon />
          </IconButton>
        </Box>
      </Box>

      <Box display="flex" alignItems={"center"}>
        <Box sx={{ display: { xs: "none", md: "flex" } }} alignItems={"center"}>
          {/* <LanguageDropdown /> */}

          <Box marginX={2}>
            <Button
              variant="text"
              href={getDaysOfServiceUrl()}
              sx={{
                fontSize: "larger",
                color: "black",
                fontWeight: "bold",
              }}
            >
              Days of Service
            </Button>
          </Box>

          <Box marginX={2}>
            <Button
              variant="text"
              onClick={() => handleNavigation("events", -150)}
              sx={{
                fontSize: "larger",
                color: "black",
                fontWeight: "bold",
              }}
            >
              Events
            </Button>
          </Box>

          <Box marginX={2}>
            <Button
              variant="text"
              onClick={() => handleNavigation("crc-classes", -100)}
              sx={{
                fontSize: "larger",
                color: "black",
                fontWeight: "bold",
              }}
            >
              Classes
            </Button>
          </Box>

          <Box marginX={2}>
            <Button
              variant="text"
              onClick={() => handleNavigation("volunteer", -100)}
              sx={{
                fontSize: "larger",
                color: "black",
                fontWeight: "bold",
              }}
            >
              Volunteer
            </Button>
          </Box>

          <Box marginX={2}>
            <Link
              underline="none"
              component="a"
              href={rootUrl + "/login"}
              color="black"
              display="flex"
              fontWeight="bold"
              fontSize="larger"
              alignContent="center"
              sx={{
                "&:hover": {
                  color: "#3A3B3C",
                },
              }}
            >
              Login
            </Link>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

Topbar.propTypes = {
  onSidebarOpen: PropTypes.func,
  themeToggler: PropTypes.func.isRequired,
  themeMode: PropTypes.string.isRequired,
  setThemePalette: PropTypes.func.isRequired,
  paletteType: PropTypes.string.isRequired,
};

export default Topbar;

const LanguageDropdown = () => {
  const theme = useTheme();
  const router = useRouter();

  const changeLanguage = useCallback(
    async (language) => {
      // Set the locale cookie
      Cookies.set("locale", language);

      // Reload the page to enable the next/intl server module to detect new locale
      router.refresh();
    },
    [router]
  );

  const [anchorEl, setAnchorEl] = useState(null);

  const handleShowDropdown = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleLanguageClick = (language) => {
    // Do something
    changeLanguage(language);

    handleLanguageClose();
  };

  const handleLanguageClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box>
      <IconButton
        sx={{
          color: theme.palette.text.primary,
          fontSize: "1.25rem",
          marginRight: 2,
        }}
        onClick={handleShowDropdown}
      >
        <Translate fontSize="inherit" />
        {/* <LanguageIcon /> */}
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleLanguageClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        sx={{ marginTop: 1 }}
      >
        <MenuItem onClick={() => handleLanguageClick("en")}>
          languages.english
        </MenuItem>
        <MenuItem onClick={() => handleLanguageClick("es")}>
          languages.spanish
        </MenuItem>
      </Menu>
    </Box>
  );
};
