"use client";

import React, { useState } from "react";
import PropTypes from "prop-types";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { usePathname, useRouter } from "next/navigation";
import { Divider } from "@mui/material";

const SidebarNav = ({ onClose }) => {
  const theme = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [activeLink, setActiveLink] = useState(pathname);

  const handleLinkClick = (url) => {
    setTimeout(() => {
      onClose();
      router.push(url);
    }, 250);
  };

  const rootUrl = process.env.NEXT_PUBLIC_ENVIRONMENT === "dev" ? "/mht" : "";

  return (
    <Box sx={{ position: "relative", textAlign: "center" }}>
      <Box paddingX={2} paddingBottom={1}>
        <Box>
          <Box marginBottom={2}>
            <Typography
              onClick={() => handleLinkClick(rootUrl + "/days-of-service")}
              variant="h4"
              sx={{
                fontWeight: 700,
                mt: 1,
                display: "block",
                textDecoration: "none",
                color: "white",
                textTransform: "uppercase",
                pt: "2px",
                cursor: "pointer",
              }}
            >
              Days Of Service
            </Typography>
          </Box>
          <Divider sx={{ backgroundColor: "white", borderWidth: "3px" }} />
          <Box marginBottom={2}>
            <Typography
              onClick={() =>
                handleLinkClick(rootUrl + "/days-of-service/projects")
              }
              variant="h5"
              sx={{
                fontWeight: 700,
                marginTop: 3,
                display: "block",
                textDecoration: "none",
                color: "white",
                cursor: "pointer",
              }}
            >
              Projects
            </Typography>
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
