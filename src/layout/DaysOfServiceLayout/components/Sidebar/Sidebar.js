import React from "react";
import PropTypes from "prop-types";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import SidebarNav from "./SidebarNav/SidebarNav";

const Sidebar = (props) => {
  const { open, variant, onClose, ...rest } = props;

  return (
    <Drawer
      anchor="top"
      onClose={() => onClose()}
      open={open}
      variant={variant}
      sx={{
        "& .MuiPaper-root": {
          width: "100%",
          maxWidth: "100%",
          backgroundColor: "#188D4E",
          color: "white",
        },
      }}
    >
      <Box
        {...rest}
        sx={{
          height: "100%",
          padding: 1,
        }}
      >
        <SidebarNav onClose={onClose} />
      </Box>
    </Drawer>
  );
};

Sidebar.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool.isRequired,
  variant: PropTypes.string.isRequired,
};

export default Sidebar;
