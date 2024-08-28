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
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { cityStrings } from "@/constants/cities";

const Topbar = ({ onSidebarOpen }) => {
  const { groupedCityStrings } = useManageCities(null, true);

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
            <Link
              underline="none"
              component="a"
              href="#"
              onClick={handleCitiesClick}
              color="black"
              fontWeight="bold"
              display="flex"
              alignContent="center"
              fontSize="larger"
              sx={{
                "&:hover": {
                  color: "#3A3B3C",
                },
              }}
            >
              Cities
              {/* {
                !citiesAnchorEl ?
                <ExpandMore/>
                :
                <ExpandLess/>
              } */}
            </Link>
            <Menu
              id="cities-menu"
              anchorEl={citiesAnchorEl}
              open={Boolean(citiesAnchorEl)}
              onClose={handleCitiesClose}
              keepMounted
              sx={{
                maxHeight: 500,
                mt: 1.5,
                display: "flex",
                flexDirection: "column",
              }}
              PaperProps={{
                sx: {
                  backgroundColor: "#1bc7bc",
                },
              }}
            >
              <MenuItem
                onClick={handleCitiesClose}
                component="a"
                sx={{
                  color: "black",
                  fontWeight: "bold",
                  "&:hover": {
                    color: "#3A3B3C",
                  },
                }}
                href={rootUrl + `/maintenance`}
              >
                Ogden
              </MenuItem>

              <MenuItem
                onClick={handleCitiesClose}
                component="a"
                sx={{
                  color: "black",
                  fontWeight: "bold",
                  "&:hover": {
                    color: "#3A3B3C",
                  },
                }}
                href={rootUrl + `/utah/orem/geneva-heights`}
              >
                Orem
              </MenuItem>
              <MenuItem
                onClick={handleCitiesClose}
                component="a"
                sx={{
                  color: "black",
                  fontWeight: "bold",
                  "&:hover": {
                    color: "#3A3B3C",
                  },
                }}
                href={rootUrl + `/maintenance`}
              >
                Provo
              </MenuItem>
              <MenuItem
                onClick={handleCitiesClose}
                component="a"
                sx={{
                  color: "black",
                  fontWeight: "bold",
                  "&:hover": {
                    color: "#3A3B3C",
                  },
                }}
                href={rootUrl + `/maintenance`}
              >
                Salt Lake City
              </MenuItem>
              <MenuItem
                onClick={handleCitiesClose}
                component="a"
                sx={{
                  color: "black",
                  fontWeight: "bold",
                  "&:hover": {
                    color: "#3A3B3C",
                  },
                }}
                href={rootUrl + `/utah/west-valley-city`}
              >
                West Valley City
              </MenuItem>
              {/* {
                // if filteredGroupedCityStrings is empty, display a message
                Object.entries(filteredGroupedCityStrings).length === 0 ? (
                  <MenuItem disabled>Nothing found.</MenuItem>
                ) : (
                  <>
                    {Object.entries(filteredGroupedCityStrings).map(
                      ([state, cities], index) => (
                        <React.Fragment key={state}>
                          {index > 0 && <Divider />}
                          <MenuItem disabled>
                            <Typography variant="h6" color="textSecondary">
                              {state}
                            </Typography>
                          </MenuItem>
                          {cities.map((city) => (
                            <MenuItem
                              key={city}
                              onClick={handleCitiesClose}
                              component="a"
                              href={
                                rootUrl +
                                `/${state.toLowerCase()}/${city
                                  .toLowerCase()
                                  .replaceAll(" ", "-")}`
                              }
                            >
                              {city}
                            </MenuItem>
                          ))}
                        </React.Fragment>
                      )
                    )}
                  </>
                )
              } */}
            </Menu>
          </Box>

          <Box marginX={2}>
            <Link
              underline="none"
              component="a"
              href="/days-of-service"
              onClick={handleResourcesClick}
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
              Days Of Service
              {/* {
                !resourcesAnchorEl ?
                <ExpandMore/>
                :
                <ExpandLess/>
              } */}
            </Link>
          </Box>

          <Box marginX={2}>
            <Link
              underline="none"
              component="a"
              href="/community-resource-centers"
              onClick={handleResourcesClick}
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
              Community Resource Centers
              {/* {
                !resourcesAnchorEl ?
                <ExpandMore/>
                :
                <ExpandLess/>
              } */}
            </Link>
          </Box>

          {/* <Box marginX={2}>
            <Link
              underline="none"
              component="a"
              href={rootUrl + "/about-us"}
              color="textPrimary"
            >
              About Us
            </Link>
          </Box> */}
          {/* <Box marginX={2}>
            <Link
              underline="none"
              component="a"
              href={rootUrl + "/donate"}
              color="textPrimary"
            >
              Donate
            </Link>
          </Box> */}
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
