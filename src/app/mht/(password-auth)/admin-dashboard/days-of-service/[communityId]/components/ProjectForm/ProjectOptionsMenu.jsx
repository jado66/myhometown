import React, { useState, useRef } from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { Button, CircularProgress } from "@mui/material";
import {
  FileDownload,
  FileUpload,
  OpenWith,
  Settings,
} from "@mui/icons-material";
import Divider from "@mui/material/Divider";
import { toast } from "react-toastify";

/**
 * ProjectOptionsMenu - A dropdown menu component for project-related actions
 *
 * @param {Object} props
 * @param {Function} props.openDaysOfServiceSelection - Callback for moving a project
 * @param {Function} props.importProject - Import project function from context
 * @param {Function} props.exportProject - Export project function from context
 * @param {boolean} props.isImporting - Loading state for import operation
 * @param {boolean} props.isExporting - Loading state for export operation
 * @param {boolean} props.disabled - Whether the menu should be disabled
 */
export const ProjectOptionsMenu = ({
  isImporting = false,
  isExporting = false,
  importProject,
  exportProject,
  openDaysOfServiceSelection,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const fileInputRef = useRef(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOptionClick = (callback) => {
    return () => {
      if (callback) callback();
      handleClose();
    };
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
    handleClose();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        await importProject(file);
      } catch (error) {
        toast.error("Failed to import project");
        console.error("Import error:", error);
      }

      // Reset the file input so the same file can be selected again
      event.target.value = "";
    }
  };

  const disabled = isImporting || isExporting;

  return (
    <div>
      <Button
        aria-controls={open ? "options-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
        variant="outlined"
        disabled={disabled}
        startIcon={
          isImporting || isExporting ? (
            <CircularProgress size={20} />
          ) : (
            <Settings />
          )
        }
      >
        {isImporting
          ? "Importing..."
          : isExporting
          ? "Exporting..."
          : "Options"}
      </Button>

      {/* Hidden file input for import */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept=".json"
        onChange={handleFileChange}
      />

      <Menu
        id="options-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "options-button",
        }}
      >
        {/* Move project */}
        <MenuItem
          onClick={handleOptionClick(openDaysOfServiceSelection)}
          disabled={disabled}
        >
          <OpenWith sx={{ mr: 1 }} />
          Move Project
        </MenuItem>

        <Divider />

        {/* Import/Export */}
        <MenuItem onClick={handleImportClick} disabled={disabled}>
          <FileUpload sx={{ mr: 1 }} />
          Import Project
        </MenuItem>
        <MenuItem
          onClick={handleOptionClick(exportProject)}
          disabled={disabled}
        >
          <FileDownload sx={{ mr: 1 }} />
          Export Project
        </MenuItem>
      </Menu>
    </div>
  );
};
