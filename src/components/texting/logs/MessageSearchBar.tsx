"use client";

import React from "react";
import { TextField, InputAdornment, IconButton } from "@mui/material";
import { Search as SearchIcon, Clear as ClearIcon } from "@mui/icons-material";

interface MessageSearchBarProps {
  searchTerm: string;
  onSearchChange: (searchTerm: string) => void;
  onClearSearch: () => void;
}

export const MessageSearchBar = ({
  searchTerm,
  onSearchChange,
  onClearSearch,
}: MessageSearchBarProps) => {
  return (
    <TextField
      size="small"
      placeholder="Search phone numbers..."
      value={searchTerm}
      onChange={(e) => onSearchChange(e.target.value)}
      sx={{ width: "300px" }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon sx={{ fontSize: 18, color: "text.secondary" }} />
          </InputAdornment>
        ),
        endAdornment: searchTerm && (
          <InputAdornment position="end">
            <IconButton
              size="small"
              onClick={onClearSearch}
              sx={{ padding: "2px" }}
            >
              <ClearIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
};
