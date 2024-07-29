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
        justifyContent={"flex-end"}
        onClick={() => onClose()}
      >
        <IconButton>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      <Box paddingX={2} paddingBottom={2}>
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
                    href={rootUrl + `/maintenance`}
                    style={{ textDecoration: "none", color: "#686868" }}
                  >
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        marginBottom: 1,
                        mt: 1,
                        display: "block",
                      }}
                    >
                      Ogden
                    </Typography>
                  </NextLink>
                  <NextLink
                    href={rootUrl + `/utah/orem`}
                    style={{ textDecoration: "none", color: "#686868" }}
                  >
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        marginBottom: 1,
                        display: "block",
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
                      }}
                    >
                      Salt Lake City
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
              href={rootUrl + "/community-resource-centers"}
              style={{ textDecoration: "none", color: "#686868" }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  marginBottom: 1,
                  display: "block",
                  textDecoration: "none",
                }}
              >
                Community Resource Centers
              </Typography>
            </NextLink>
          </Box>
          <Box marginBottom={2}>
            <NextLink
              href={rootUrl + "/days-of-service"}
              style={{ textDecoration: "none", color: "#686868" }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  marginBottom: 1,
                  display: "block",
                }}
              >
                Days Of Service
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
