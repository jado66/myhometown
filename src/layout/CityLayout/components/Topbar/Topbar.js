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
import { Translate } from "@mui/icons-material";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { useCommunityList } from "@/hooks/useCommunityList";
import { Expand } from "@mui/icons-material";
import { ExpandLess } from "@mui/icons-material";
import { ExpandMore } from "@mui/icons-material";

const Topbar = ({ onSidebarOpen }) => {
  const { communities } = useCommunityList();

  const { groupedCityStrings } = useManageCities(null, true);

  const [citiesAnchorEl, setCitiesAnchorEl] = useState(null);
  const [resourcesAnchorEl, setResourcesAnchorEl] = useState(null);

  const pathname = usePathname();
  const router = useRouter();
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

  const getNavigationPath = (basePath, newSection) => {
    const parts = basePath.split("/").filter(Boolean);
    const knownSections = ["days-of-service", "community-resource-centers"];

    // Remove the last part if it's a known section
    if (knownSections.includes(parts[parts.length - 1])) {
      parts.pop();
    }

    // Add the new section
    parts.push(newSection);

    return "/" + parts.join("/");
  };

  const handleNavigation = (section) => {
    const newPath = getNavigationPath(pathname, section);
    router.push(newPath);
  };

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
          marginRight={{ xs: 1, sm: 2 }}
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
              sx={{
                fontSize: "larger",
                color: "black",
                fontWeight: "bold",
              }}
              onClick={handleCitiesClick}
            >
              Communities
              {!citiesAnchorEl ? <ExpandMore /> : <ExpandLess />}
            </Button>
            <Menu
              id="cities-menu"
              anchorEl={citiesAnchorEl}
              open={Boolean(citiesAnchorEl)}
              onClose={handleCitiesClose}
              keepMounted
              sx={{
                maxHeight: 500,
                display: "flex",
                flexDirection: "column",
              }}
              PaperProps={{
                sx: {
                  backgroundColor: "#a16faf",
                },
              }}
            >
              {/* <pre>{JSON.stringify(communities, null, 2)}</pre> */}
              {communities.map((community, index) => (
                <MenuItem
                  key={index}
                  onClick={handleCitiesClose}
                  component="a"
                  sx={{
                    color: "black",
                    fontWeight: "bold",
                    "&:hover": {
                      color: "#3A3B3C",
                    },
                  }}
                  href={
                    rootUrl + "/utah/" + community.href.replace(/^\.\//, "")
                  }
                >
                  {community.title} Community
                </MenuItem>
              ))}
              {/* <MenuItem
                onClick={handleCitiesClose}
                component="a"
                sx={{
                  color: "black",
                  fontWeight: "bold",
                  "&:hover": {
                    color: "#3A3B3C",
                  },
                }}
                href={rootUrl + `/utah/provo/pioneer-park`}
              >
                Pioneer Park
              </MenuItem> */}

              {/* <MenuItem
                onClick={handleCitiesClose}
                component="a"
                sx={{
                  color: "black",
                  fontWeight: "bold",
                  "&:hover": {
                    color: "#3A3B3C",
                  },
                }}
                href={rootUrl + `/utah/provo/south-freedom`}
              >
                South Freedom
              </MenuItem> */}
              {/* <MenuItem
                onClick={handleCitiesClose}
                component="a"
                sx={{
                  color: "black",
                  fontWeight: "bold",
                  "&:hover": {
                    color: "#3A3B3C",
                  },
                }}
                href={rootUrl + `/utah/provo/dixon`}
              >
                Dixon
              </MenuItem> */}
            </Menu>
          </Box>

          <Box marginX={2}>
            <Button
              variant="text"
              onClick={(event) => setResourcesAnchorEl(event.currentTarget)}
              sx={{
                fontSize: "larger",
                color: "black",
                fontWeight: "bold",
              }}
            >
              Login
              {!resourcesAnchorEl ? <ExpandMore /> : <ExpandLess />}
            </Button>
            <Menu
              id="login-menu"
              anchorEl={resourcesAnchorEl}
              open={Boolean(resourcesAnchorEl)}
              onClose={handleResourcesClose}
              keepMounted
              sx={{
                display: "flex",
                flexDirection: "column",
              }}
              PaperProps={{
                sx: {
                  backgroundColor: "#a16faf",
                },
              }}
            >
              <MenuItem
                onClick={handleResourcesClose}
                component="a"
                sx={{
                  color: "black",
                  fontWeight: "bold",
                  "&:hover": {
                    color: "#3A3B3C",
                  },
                }}
                href={rootUrl + `/admin-dashboard`}
              >
                Admin Login
              </MenuItem>
              <MenuItem
                onClick={handleResourcesClose}
                component="a"
                sx={{
                  color: "black",
                  fontWeight: "bold",
                  "&:hover": {
                    color: "#3A3B3C",
                  },
                }}
                href={rootUrl + `/admin-dashboard/classes`}
              >
                Teacher Login
              </MenuItem>
            </Menu>
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
