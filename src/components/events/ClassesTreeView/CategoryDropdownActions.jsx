import { Visibility } from "@mui/icons-material";
import { VisibilityOff } from "@mui/icons-material";
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
  onUpdateCategoryVisibility,
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

  const isHeader = category.type === "header";

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
        {isHeader ? "Header Options" : "Category Options"}
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
        {!isHeader && (
          <MenuItem
            onClick={(e) => {
              setAddNewClass(true);
              handleClose(e);
            }}
          >
            <Add sx={{ mr: 1 }} /> Add New Class
          </MenuItem>
        )}

        <MenuItem
          onClick={(e) => {
            onEditCategory(category.id);
            handleClose(e);
          }}
        >
          <Edit sx={{ mr: 1 }} /> Edit {isHeader ? "Header" : "Category"}
        </MenuItem>
        <MenuItem
          onClick={(e) => {
            onDeleteClassCategory(category.id);
            handleClose(e);
          }}
        >
          <Delete sx={{ mr: 1 }} /> Delete {isHeader ? "Header" : "Category"}
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
        {category.visibility !== undefined && category.visibility === false ? (
          <MenuItem
            onClick={(e) => {
              onUpdateCategoryVisibility(true);
              handleClose(e);
            }}
          >
            <Visibility sx={{ mr: 1 }} />
            Make Visible
          </MenuItem>
        ) : (
          <MenuItem
            onClick={(e) => {
              onUpdateCategoryVisibility(false);
              handleClose(e);
            }}
          >
            <VisibilityOff sx={{ mr: 1 }} />
            Make Hidden
          </MenuItem>
        )}
      </Menu>
    </div>
  );
};
