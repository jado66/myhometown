import { Delete, Edit, ArrowUpward, ArrowDownward } from "@mui/icons-material";
import { Button, Menu, MenuItem } from "@mui/material";
import { useState } from "react";

export const ClassDropdownActions = ({
  classObj,
  categoryId,
  onEditClass,
  onDeleteClass,
  shiftUpClass,
  shiftDownClass,
  isFirstClass,
  isLastClass,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    const target = event.currentTarget;
    event.stopPropagation();

    setAnchorEl(target);
  };

  const handleClose = (event) => {
    event.stopPropagation();
    setAnchorEl(null);
  };

  return (
    <div>
      <Button
        aria-controls="simple-class-menu"
        aria-haspopup="true"
        onClick={handleClick}
        variant="outlined"
        size="small"
        sx={{ ml: "auto" }}
      >
        <Edit sx={{ fontSize: 20, mr: 1 }} />
        Class Options
      </Button>
      <Menu
        id="simple-class-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <MenuItem
          onClick={(e) => {
            onEditClass(categoryId, classObj.id);
            handleClose(e);
          }}
        >
          <Edit sx={{ mr: 1 }} /> Edit Class
        </MenuItem>
        <MenuItem
          onClick={(e) => {
            onDeleteClass(categoryId, classObj.id);
            handleClose(e);
          }}
        >
          <Delete sx={{ mr: 1 }} /> Delete Class
        </MenuItem>
        <MenuItem
          onClick={(e) => {
            shiftUpClass(categoryId, classObj.id);
            handleClose(e);
          }}
          disabled={isFirstClass}
        >
          <ArrowUpward sx={{ mr: 1 }} /> Move Up
        </MenuItem>
        <MenuItem
          onClick={(e) => {
            shiftDownClass(categoryId, classObj.id);
            handleClose(e);
          }}
          disabled={isLastClass}
        >
          <ArrowDownward sx={{ mr: 1 }} /> Move Down
        </MenuItem>
      </Menu>
    </div>
  );
};