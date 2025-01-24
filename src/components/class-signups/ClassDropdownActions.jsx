import { Link } from "@mui/icons-material";
import {
  Delete,
  Edit,
  ArrowUpward,
  ArrowDownward,
  ContentCopy,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { Button, Divider, Menu, MenuItem } from "@mui/material";
import { useState } from "react";
import { toast } from "react-toastify";

export const ClassDropdownActions = ({
  classObj,
  categoryId,
  onEditClass,
  shiftUpClass,
  shiftDownClass,
  onUpdateVisibility,
  onDuplicateClass,
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
            onDuplicateClass(categoryId, classObj.id);
            handleClose(e);
          }}
        >
          <ContentCopy sx={{ mr: 1 }} /> Duplicate Class
        </MenuItem>
        <MenuItem
          // copy class title to clipboard
          onClick={(e) => {
            //  this should be the current url + #class-{classObj.id.toLowerCase().replace(/ /g, "-")}
            navigator.clipboard.writeText(
              `${window.location.href}#class-${classObj.title
                .toLowerCase()
                .replace(/ /g, "-")}`
                // replace edit out of the url
                .replace(/\/edit/g, "")
            );
            toast.success("Class URL copied to clipboard");
            handleClose(e);
          }}
        >
          <Link sx={{ mr: 1 }} />
          Copy Class URL
        </MenuItem>

        {classObj.visibility ? (
          <MenuItem
            onClick={(e) => {
              onUpdateVisibility(classObj.id, false);
              handleClose(e);
            }}
          >
            <VisibilityOff sx={{ mr: 1 }} />
            Make Hidden
          </MenuItem>
        ) : (
          <MenuItem
            onClick={(e) => {
              onUpdateVisibility(classObj.id, true);
              handleClose(e);
            }}
          >
            <Visibility sx={{ mr: 1 }} />
            Make Visible
          </MenuItem>
        )}

        <Divider />
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
