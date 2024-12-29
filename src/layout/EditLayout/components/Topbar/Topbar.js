"use client";

import React from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MyHometownLogo from "@/assets/svg/logos/MyHometown";
import { useEdit } from "@/hooks/use-edit";
import { Typography } from "@mui/material";

const Topbar = () => {
  const { saveData, isDirty, isSaving } = useEdit();
  const rootUrl = process.env.NEXT_PUBLIC_ENVIRONMENT === "dev" ? "/mht" : "";

  return (
    <Box
      display={"flex"}
      justifyContent={"space-between"}
      alignItems={"center"}
      width={"100%"}
    >
      <Box display={"flex"} alignItems={"center"} sx={{ flexGrow: 1 }}></Box>
      <Box display={"flex"} alignItems={"center"} sx={{ flexGrow: 1 }}>
        <Box
          display={"flex"}
          title="myhometown"
          justifyContent="center"
          height={{ xs: 28, md: 32 }}
        >
          <Typography variant="h4" color="primary">
            You Are In Editing Mode
          </Typography>
        </Box>
      </Box>
      <Box display="flex" alignItems={"center"}>
        <Box sx={{ display: "flex" }} alignItems={"center"}>
          <Box>
            <Button
              variant="outlined"
              component="a"
              href={rootUrl + "/admin-dashboard"}
            >
              Admin Dashboard
            </Button>
          </Box>

          <Box marginX={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={saveData}
              disabled={!isDirty || isSaving}
              loading={isSaving}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
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
