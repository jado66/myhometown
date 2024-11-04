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
            <NextLink
              href={rootUrl + "/"}
              style={{ textDecoration: "none", color: "#686868" }}
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
                Home
              </Typography>
            </NextLink>
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
                Cities
                {expandCities ? <ExpandLess /> : <ExpandMore />}
              </Typography>
            </Button>
            {expandCities && (
              <div style={{ marginLeft: "2em" }}>
                <>
                  <NextLink
                    href={rootUrl + `/utah/ogden`}
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
                      Ogden
                    </Typography>
                  </NextLink>
                  <NextLink
                    href={rootUrl + `/utah/orem/geneva-heights`}
                    style={{ textDecoration: "none", color: "#686868" }}
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
                      Orem
                    </Typography>
                  </NextLink>
                  <NextLink
                    href={rootUrl + `/maintenance`}
                    style={{ textDecoration: "none", color: "#686868" }}
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
                      Provo
                    </Typography>
                  </NextLink>

                  <NextLink
                    href={rootUrl + `/maintenance`}
                    style={{ textDecoration: "none", color: "#686868" }}
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
                      Salt Lake City
                    </Typography>
                  </NextLink>
                  <NextLink
                    href={rootUrl + `/utah/west-valley-city`}
                    style={{ textDecoration: "none", color: "#686868" }}
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
                      West Valley City
                    </Typography>
                  </NextLink>
                </>
              </div>
            )}
          </Box>
          <Box marginBottom={2}>
            <NextLink
              href={"#events"}
              style={{ textDecoration: "none", color: "#686868" }}
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
            </NextLink>
          </Box>
          <Box marginBottom={2}>
            <NextLink
              href={"#sign-ups"}
              style={{ textDecoration: "none", color: "#686868" }}
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
            </NextLink>
          </Box>
        </Box>
        <Box marginBottom={2}>
          <NextLink
            href={"#volunteer"}
            style={{ textDecoration: "none", color: "#686868" }}
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
          </NextLink>
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
