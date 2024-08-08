import {
  Add,
  Delete,
  Edit,
  ArrowUpward,
  ArrowDownward,
} from "@mui/icons-material";
import { Button, Menu, MenuItem } from "@mui/material";
import { useState } from "react";

export const CategoryDropdownActions = ({
  category,
  setAddNewClass,
  onEditCategory,
  onDeleteClassCategory,
  shiftUpClassCategory,
  shiftDownClassCategory,
  isFirstCategory,
  isLastCategory,
  onToggleExpand,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    const target = event.currentTarget;
    event.stopPropagation();

    onToggleExpand();

    setTimeout(() => {
      setAnchorEl(target);
    }, 500);
  };

  const handleClose = (event) => {
    event.stopPropagation();
    setAnchorEl(null);
  };

  return (
    <div>
      <Button
        aria-controls="simple-menu"
        aria-haspopup="true"
        onClick={handleClick}
        variant="outlined"
        size="small"
        sx={{ ml: "auto" }}
      >
        <Edit sx={{ fontSize: 20, mr: 1 }} />
        Category Options
      </Button>
      <Menu
        id="simple-menu"
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
            setAddNewClass(true);
            handleClose(e);
          }}
        >
          <Add sx={{ mr: 1 }} /> Add New Class
        </MenuItem>
        <MenuItem
          onClick={(e) => {
            onEditCategory(category.id);
            handleClose(e);
          }}
        >
          <Edit sx={{ mr: 1 }} /> Edit Category
        </MenuItem>
        <MenuItem
          onClick={(e) => {
            onDeleteClassCategory(category.id);
            handleClose(e);
          }}
        >
          <Delete sx={{ mr: 1 }} /> Delete Category
        </MenuItem>
        <MenuItem
          onClick={(e) => {
            shiftUpClassCategory(category.id);
            handleClose(e);
          }}
          disabled={isFirstCategory}
        >
          <ArrowUpward sx={{ mr: 1 }} /> Move Up
        </MenuItem>
        <MenuItem
          onClick={(e) => {
            shiftDownClassCategory(category.id);
            handleClose(e);
          }}
          disabled={isLastCategory}
        >
          <ArrowDownward sx={{ mr: 1 }} /> Move Down
        </MenuItem>
      </Menu>
    </div>
  );
};
