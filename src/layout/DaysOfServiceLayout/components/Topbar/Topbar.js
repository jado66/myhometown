import React from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";

import { IconButton, Typography, useMediaQuery } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

const Topbar = ({ onSidebarOpen, theme }) => {
  const isMediumUp = useMediaQuery(theme.breakpoints.up("md"));

  const rootUrl = process.env.NEXT_PUBLIC_ENVIRONMENT === "dev" ? "/mht" : "";

  return (
    <Box
      display={"flex"}
      justifyContent={"space-between"}
      alignItems={"center"}
      width={"100%"}
      position="relative"
    >
      <Box
        display={"flex"}
        alignItems={"center"}
        sx={{ flexGrow: 1, justifyContent: "space-between" }}
      >
        {/* Move the title to a separate Box */}
        <Box
          sx={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            pointerEvents: "none", // This allows clicks to pass through
          }}
        >
          <Link
            underline="none"
            component="a"
            href={rootUrl + "/days-of-service"}
            color={theme.palette.primary.contrastText}
            sx={{ pointerEvents: "auto" }} // Re-enable pointer events for the link itself
          >
            <Typography
              variant={isMediumUp ? "h5" : "h6"}
              sx={{
                textTransform: "uppercase",
                fontWeight: "bold",
                whiteSpace: "nowrap",
              }}
            >
              Days Of Service
            </Typography>
          </Link>
        </Box>

        <Box
          marginRight={{ xs: 1, sm: 2 }}
          sx={{ display: { md: "flex", lg: "none" } }}
        >
          <IconButton
            aria-label="Menu"
            onClick={onSidebarOpen}
            sx={{ color: "white" }}
          >
            <MenuIcon />
          </IconButton>
        </Box>
      </Box>

      <Box display="flex" alignItems={"center"}>
        <Box
          sx={{ display: { xs: "none", md: "none", lg: "flex" } }}
          alignItems={"center"}
        >
          {/* Links remain unchanged */}
          <Box marginX={2}>
            <Link
              underline="none"
              component="a"
              href={rootUrl + "/days-of-service/project-development-forms"}
              color={theme.palette.primary.contrastText}
            >
              Project Development Forms
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
