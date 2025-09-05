"use client";

import React from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import {
  Cancel as XCircleIcon,
  Message as MessageSquareIcon,
} from "@mui/icons-material";

interface LoadingStateProps {
  isLoading: boolean;
  error: string | null;
}

export const LoadingState = ({ isLoading, error }: LoadingStateProps) => {
  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 8,
          minWidth: "400px",
        }}
      >
        <CircularProgress size={32} sx={{ mr: 2 }} />
        <Typography>Loading text batches...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: "center", p: 8 }}>
        <XCircleIcon sx={{ fontSize: 48, color: "error.main", mb: 2 }} />
        <Typography color="error.main">
          Error loading text batches: {error}
        </Typography>
      </Box>
    );
  }

  return null;
};

interface EmptyStateProps {
  currentPage: number;
}

export const EmptyState = ({ currentPage }: EmptyStateProps) => {
  return (
    <Box
      sx={{
        textAlign: "center",
        py: 6,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <MessageSquareIcon sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
      <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
        No text message batches found
      </Typography>
      <Typography variant="body2" color="text.disabled">
        {currentPage > 1
          ? "Try going back to previous pages or adjusting your filters."
          : "Text message batches will appear here once they are sent."}
      </Typography>
    </Box>
  );
};
