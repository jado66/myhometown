import React from "react";
import { Button, Menu, MenuItem } from "@mui/material";

import { VisibilityOff, Visibility } from "@mui/icons-material";

export const ClassVisibilityDropdown = ({ classObj, onUpdateVisibility }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (event, visibility) => {
    event.stopPropagation();

    onUpdateVisibility(classObj.id, visibility);
    setAnchorEl(null);
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Button
        aria-controls="simple-menu"
        aria-haspopup="true"
        onClick={handleClick}
        sx={{ p: 0, minWidth: 0, mx: 1 }}
        size="small"
      >
        <VisibilityOff />
      </Button>
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={(e) => handleClose(e, true)}>
          <Visibility sx={{ mr: 1 }} /> Make Visible
        </MenuItem>
      </Menu>
    </div>
  );
};

export const CategoryVisibilityDropdown = ({
  category,
  onUpdateVisibility,
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (event, visibility) => {
    event.stopPropagation();

    onUpdateVisibility(category.id, visibility);
    setAnchorEl(null);
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Button
        aria-controls="simple-menu"
        aria-haspopup="true"
        onClick={handleClick}
        sx={{ p: 0, minWidth: 0, mx: 1 }}
        size="small"
      >
        <VisibilityOff />
      </Button>
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={(e) => handleClose(e, true)}>
          <Visibility sx={{ mr: 1 }} /> Make Visible
        </MenuItem>
      </Menu>
    </div>
  );
};
