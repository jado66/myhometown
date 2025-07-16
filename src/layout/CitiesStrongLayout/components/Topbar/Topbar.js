import React from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import CitiesStrongLogo from "@/assets/svg/logos/CitiesStrong";
import CitiesStrongShield from "@/assets/svg/logos/CititesStrongShield";
import CitiesStrongShieldIcon from "@/assets/svg/logos/CitiesStrongShieldIcon";
import { IconButton, Typography, useMediaQuery } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

const Topbar = ({ onSidebarOpen, theme }) => {
  const isMediumUp = useMediaQuery(theme.breakpoints.up("md"));

  const rootUrl = process.env.NEXT_PUBLIC_ENVIRONMENT === "dev" ? "/cs" : "";

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
        <Box
          display={"flex"}
          alignItems="baseline"
          title="myhometown"
          height={{ xs: 32, md: 46 }}
          width={45}
        >
          <CitiesStrongShield
            shieldColor="#000000"
            fontColor="#ffffff"
            width={55}
            height={55}
          />
        </Box>

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
            href={rootUrl + "/"}
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
              {isMediumUp ? "Cities Strong Foundation" : "Cities Strong"}
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
          {/* Navigation Links */}
          <Box marginX={2}>
            <Link
              underline="none"
              component="a"
              href={rootUrl + "/about"}
              color={theme.palette.primary.contrastText}
            >
              About Us
            </Link>
          </Box>
          <Box marginX={2}>
            <Link
              underline="none"
              component="a"
              href={rootUrl + "/testimonials"}
              color={theme.palette.primary.contrastText}
            >
              Testimonials
            </Link>
          </Box>
          {/* NEW FINANCIALS LINK */}
          <Box marginX={2}>
            <Link
              underline="none"
              component="a"
              href={rootUrl + "/financials"}
              color={theme.palette.primary.contrastText}
            >
              Financials
            </Link>
          </Box>
          <Box marginX={2}>
            <Link
              underline="none"
              component="a"
              href={rootUrl + "/contact"}
              color={theme.palette.primary.contrastText}
            >
              Contact
            </Link>
          </Box>
          <Box marginX={2}>
            <Link
              underline="none"
              component="a"
              href={rootUrl + "/donate"}
              color={theme.palette.primary.contrastText}
            >
              Donate
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
